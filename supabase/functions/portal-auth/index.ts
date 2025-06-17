
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
    
    console.log('🔑 Received token for validation');
    
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

    // Validate the token and get session info
    console.log('🔍 Validating token with database...');
    const { data: sessionData, error } = await supabaseAdmin
      .rpc('validate_client_portal_session', { p_token: token })

    console.log('🔍 Session validation result:', { sessionData, error });

    if (error) {
      console.error('❌ Session validation error:', error);
      return new Response(
        JSON.stringify({ success: false, error: 'Database validation failed' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    if (!sessionData || sessionData.length === 0) {
      console.error('❌ No session data found for token');
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid or expired access link' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      )
    }

    const session = sessionData[0]
    console.log('✅ Session found for client:', session.client_id);
    
    if (!session.is_valid) {
      console.error('❌ Session has expired');
      return new Response(
        JSON.stringify({ success: false, error: 'Access link has expired' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      )
    }

    // Log the login activity
    try {
      await supabaseAdmin.rpc('log_client_portal_activity', {
        p_user_id: session.user_id,
        p_action: 'login',
        p_resource_type: 'portal',
        p_resource_id: null,
        p_details: { 
          document_type: session.document_type,
          document_id: session.document_id,
          login_method: 'magic_link'
        },
        p_ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        p_user_agent: req.headers.get('user-agent') || 'unknown'
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
          user_id: session.user_id,
          client_id: session.client_id,
          email: session.email,
          name: session.name,
          document_type: session.document_type,
          document_id: session.document_id,
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
