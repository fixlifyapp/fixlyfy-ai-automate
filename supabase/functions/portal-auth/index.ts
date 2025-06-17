
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔐 Portal auth function called');
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const requestBody = await req.json()
    const { token } = requestBody
    
    console.log('🔑 Received token for validation:', token ? token.substring(0, 10) + '...' : 'missing');
    
    if (!token) {
      console.error('❌ No token provided');
      return new Response(
        JSON.stringify({ success: false, error: 'Token is required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // First check if session exists
    console.log('🔍 Checking session existence...');
    const { data: sessionCheck, error: sessionCheckError } = await supabaseAdmin
      .from('client_portal_sessions')
      .select(`
        id,
        token,
        expires_at,
        document_type,
        document_id,
        client_portal_user_id,
        client_portal_users!inner(
          id,
          client_id,
          email,
          name
        )
      `)
      .eq('token', token)
      .single()

    console.log('🔍 Session check result:', { sessionCheck, sessionCheckError });

    if (sessionCheckError || !sessionCheck) {
      console.error('❌ Session not found:', sessionCheckError);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid or expired access link' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      )
    }

    // Check if session is expired
    const isExpired = new Date(sessionCheck.expires_at) <= new Date()
    console.log('⏰ Session expiry check:', { 
      expires_at: sessionCheck.expires_at, 
      now: new Date().toISOString(),
      isExpired 
    });

    if (isExpired) {
      console.error('❌ Session has expired');
      return new Response(
        JSON.stringify({ success: false, error: 'Access link has expired' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      )
    }

    // Update accessed_at
    try {
      await supabaseAdmin
        .from('client_portal_sessions')
        .update({ accessed_at: new Date().toISOString() })
        .eq('token', token)
    } catch (updateError) {
      console.warn('⚠️ Failed to update accessed_at:', updateError);
    }

    const session = {
      user_id: sessionCheck.client_portal_users.id,
      client_id: sessionCheck.client_portal_users.client_id,
      email: sessionCheck.client_portal_users.email,
      name: sessionCheck.client_portal_users.name,
      document_type: sessionCheck.document_type,
      document_id: sessionCheck.document_id
    }

    console.log('✅ Session found for client:', session.client_id);

    // Log the login activity
    try {
      await supabaseAdmin
        .from('client_portal_activity_logs')
        .insert({
          client_portal_user_id: session.user_id,
          action: 'login',
          resource_type: 'portal',
          resource_id: null,
          details: { 
            document_type: session.document_type,
            document_id: session.document_id,
            login_method: 'magic_link'
          },
          ip_address: req.headers.get('x-forwarded-for') || 'unknown',
          user_agent: req.headers.get('user-agent') || 'unknown'
        });
    } catch (logError) {
      console.warn('⚠️ Failed to log activity:', logError);
    }

    // Update last login time
    try {
      await supabaseAdmin
        .from('client_portal_users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', session.user_id);
    } catch (updateError) {
      console.warn('⚠️ Failed to update last login:', updateError);
    }

    console.log('✅ Portal authentication successful for:', session.email);

    return new Response(
      JSON.stringify({
        success: true,
        session: {
          ...session,
          token: token
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('💥 Portal auth error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Authentication service temporarily unavailable' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
