
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
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url)
    const token = url.searchParams.get('token')
    
    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Token is required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Validate the token and get session info
    const { data: sessionData, error } = await supabaseAdmin
      .rpc('validate_client_portal_session', { p_token: token })

    if (error || !sessionData || sessionData.length === 0) {
      console.error('Session validation error:', error)
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      )
    }

    const session = sessionData[0]
    
    if (!session.is_valid) {
      return new Response(
        JSON.stringify({ error: 'Session expired' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      )
    }

    // Log the login activity
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
    })

    // Update last login time
    await supabaseAdmin
      .from('client_portal_users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', session.user_id)

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
    console.error('Portal auth error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
