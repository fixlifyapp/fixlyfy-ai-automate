
import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
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

    const { action, token, email } = await req.json()

    if (action === 'generate_login_token') {
      // Generate login token for client
      const { data: tokenData, error: tokenError } = await supabaseAdmin.rpc('generate_client_login_token', {
        p_email: email
      })

      if (tokenError || !tokenData) {
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
      // Verify login token and create session
      const { data: sessionData, error: sessionError } = await supabaseAdmin.rpc('verify_client_login_token', {
        p_token: token
      })

      if (sessionError || !sessionData || sessionData.length === 0) {
        return new Response(
          JSON.stringify({ error: 'Invalid or expired login token' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        )
      }

      const session = sessionData[0]
      return new Response(
        JSON.stringify({
          session_token: session.session_token,
          client_id: session.client_id,
          user_id: session.user_id,
          expires_at: session.expires_at
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    if (action === 'validate_session') {
      const sessionToken = req.headers.get('Authorization')?.replace('Bearer ', '')
      
      if (!sessionToken) {
        return new Response(
          JSON.stringify({ error: 'Missing session token' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        )
      }

      const { data: sessionData, error: sessionError } = await supabaseAdmin.rpc('validate_client_session', {
        p_session_token: sessionToken
      })

      if (sessionError || !sessionData || sessionData.length === 0) {
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
          client_name: session.client_name,
          client_email: session.client_email
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )

  } catch (error) {
    console.error('Error in client-portal-auth:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
