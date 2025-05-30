
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

interface AuthRequest {
  type: 'login' | 'signup' | 'magic_link';
  identifier: string;
  metadata?: Record<string, any>;
}

serve(async (req) => {
  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 405,
      })
    }

    // Create a Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get client IP for rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    'unknown';

    // Parse the request body
    const body: AuthRequest = await req.json()
    
    // Check rate limiting based on IP and identifier
    const { data: ipRateLimit, error: ipError } = await supabaseClient.rpc('check_rate_limit', {
      p_identifier: clientIP,
      p_attempt_type: body.type,
      p_max_attempts: 10, // Per IP limit
      p_window_minutes: 60
    });

    if (ipError || !ipRateLimit) {
      // Log security event
      await supabaseClient.rpc('log_security_event', {
        p_action: 'rate_limit_exceeded_ip',
        p_resource: 'auth_security',
        p_details: { 
          ip: clientIP, 
          type: body.type,
          identifier: body.identifier 
        }
      });

      return new Response(JSON.stringify({ 
        error: 'Rate limit exceeded. Please try again later.' 
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 429,
      })
    }

    // Check rate limiting based on identifier (email/phone)
    const { data: identifierRateLimit, error: identifierError } = await supabaseClient.rpc('check_rate_limit', {
      p_identifier: body.identifier,
      p_attempt_type: body.type,
      p_max_attempts: 5, // Per identifier limit
      p_window_minutes: 15
    });

    if (identifierError || !identifierRateLimit) {
      // Log security event
      await supabaseClient.rpc('log_security_event', {
        p_action: 'rate_limit_exceeded_identifier',
        p_resource: 'auth_security',
        p_details: { 
          ip: clientIP, 
          type: body.type,
          identifier: body.identifier 
        }
      });

      return new Response(JSON.stringify({ 
        error: 'Too many attempts for this account. Please try again later.' 
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 429,
      })
    }

    // Log successful rate limit check
    await supabaseClient.rpc('log_security_event', {
      p_action: 'auth_attempt_allowed',
      p_resource: 'auth_security',
      p_details: { 
        ip: clientIP, 
        type: body.type,
        identifier: body.identifier 
      }
    });

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Authentication attempt allowed' 
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Secure auth error:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error' 
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
