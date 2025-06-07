
import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Enhanced input validation
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
};

const validateToken = (token: string): boolean => {
  if (!token || typeof token !== 'string') return false;
  if (token.length < 16 || token.length > 512) return false;
  return /^[A-Za-z0-9+/=_-]+$/.test(token);
};

const sanitizeInput = (input: string, maxLength: number = 255): string => {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, maxLength);
};

// Rate limiting check
const checkRateLimit = async (supabaseAdmin: any, identifier: string, attemptType: string) => {
  try {
    const { data: result } = await supabaseAdmin.rpc('check_rate_limit', {
      p_identifier: identifier,
      p_attempt_type: attemptType,
      p_max_attempts: 5,
      p_window_minutes: 15
    });
    
    return result === true;
  } catch (error) {
    console.error('Rate limit check failed:', error);
    return true; // Allow on error to avoid blocking legitimate users
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const requestBody = await req.json()
    const { action, token, email } = requestBody
    
    // Enhanced input validation
    if (action && typeof action !== 'string') {
      throw new Error('Invalid action parameter');
    }
    
    const clientIp = req.headers.get('cf-connecting-ip') || 
                    req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    'unknown';

    console.log('client-portal-auth - Action:', action, 'Email:', email ? sanitizeInput(email, 100) : 'none', 'IP:', clientIp)

    if (action === 'generate_login_token') {
      const sanitizedEmail = sanitizeInput(email || '', 254);
      
      if (!validateEmail(sanitizedEmail)) {
        return new Response(
          JSON.stringify({ error: 'Invalid email format' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }

      // Check rate limiting
      const rateLimitOk = await checkRateLimit(supabaseAdmin, clientIp, 'login_request');
      if (!rateLimitOk) {
        return new Response(
          JSON.stringify({ error: 'Too many requests. Please try again later.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
        )
      }

      console.log('client-portal-auth - Generating login token for email:', sanitizedEmail)
      
      const { data: tokenData, error: tokenError } = await supabaseAdmin.rpc('generate_client_login_token', {
        p_email: sanitizedEmail
      })

      console.log('client-portal-auth - Token generation result:', tokenData ? 'success' : 'failed', tokenError)

      if (tokenError || !tokenData) {
        console.error('client-portal-auth - Token generation error:', tokenError)
        return new Response(
          JSON.stringify({ error: 'No account found with this email address' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
        )
      }

      return new Response(
        JSON.stringify({ token: tokenData }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    if (action === 'verify_token') {
      const sanitizedToken = sanitizeInput(token || '', 512);
      
      if (!validateToken(sanitizedToken)) {
        return new Response(
          JSON.stringify({ error: 'Invalid token format' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }

      // Check rate limiting for token verification
      const rateLimitOk = await checkRateLimit(supabaseAdmin, clientIp, 'token_verification');
      if (!rateLimitOk) {
        return new Response(
          JSON.stringify({ error: 'Too many requests. Please try again later.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
        )
      }

      console.log('client-portal-auth - Verifying token:', sanitizedToken.substring(0, 20) + '...')
      
      const { data: sessionData, error: sessionError } = await supabaseAdmin.rpc('verify_client_login_token', {
        p_token: sanitizedToken
      })

      console.log('client-portal-auth - Token verification result:', sessionData ? sessionData.length : 0, 'records', sessionError)

      if (sessionError || !sessionData || sessionData.length === 0) {
        console.error('client-portal-auth - Token verification error:', sessionError)
        return new Response(
          JSON.stringify({ error: 'Invalid or expired login token' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        )
      }

      const session = sessionData[0]
      console.log('client-portal-auth - Session created for client:', session.client_id)
      
      return new Response(
        JSON.stringify({
          session_token: session.session_token,
          client_id: session.client_id,
          user_id: session.user_id,
          client_name: sanitizeInput(session.client_name || '', 100),
          client_email: sanitizeInput(session.client_email || '', 254),
          expires_at: session.expires_at
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    if (action === 'validate_session') {
      const sessionToken = req.headers.get('client-portal-session') || 
                          req.headers.get('Authorization')?.replace('Bearer ', '') ||
                          requestBody.session_token
      
      const sanitizedSessionToken = sanitizeInput(sessionToken || '', 512);
      
      if (!validateToken(sanitizedSessionToken)) {
        return new Response(
          JSON.stringify({ error: 'Invalid session token format' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }

      console.log('client-portal-auth - Validating session token:', sanitizedSessionToken.substring(0, 20) + '...')
      
      if (!sanitizedSessionToken) {
        console.log('client-portal-auth - No session token provided')
        return new Response(
          JSON.stringify({ error: 'Missing session token' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        )
      }

      const { data: sessionData, error: sessionError } = await supabaseAdmin.rpc('validate_client_session', {
        p_session_token: sanitizedSessionToken
      })

      console.log('client-portal-auth - Session validation result:', sessionData ? sessionData.length : 0, 'records', sessionError)

      if (sessionError || !sessionData || sessionData.length === 0) {
        console.error('client-portal-auth - Session validation error:', sessionError)
        return new Response(
          JSON.stringify({ error: 'Invalid session' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        )
      }

      const session = sessionData[0]
      return new Response(
        JSON.stringify({
          valid: true,
          client_id: session.client_id,
          user_id: session.user_id,
          client_name: sanitizeInput(session.client_name || '', 100),
          client_email: sanitizeInput(session.client_email || '', 254)
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )

  } catch (error) {
    console.error('client-portal-auth - Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
