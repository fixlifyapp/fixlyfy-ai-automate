
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

    const { action, token, email, resource_type, resource_id } = await req.json()
    console.log('client-portal-auth - Action:', action)

    if (action === 'generate_access_token') {
      console.log('client-portal-auth - Generating access token for:', email, resource_type, resource_id)
      
      const { data: tokenData, error: tokenError } = await supabaseAdmin.rpc('generate_client_access_token', {
        p_email: email,
        p_resource_type: resource_type || 'general',
        p_resource_id: resource_id || null
      })

      if (tokenError || !tokenData) {
        console.error('client-portal-auth - Token generation error:', tokenError)
        return new Response(
          JSON.stringify({ error: 'No client found with this email address' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
        )
      }

      return new Response(
        JSON.stringify({ token: tokenData }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    if (action === 'authenticate_token') {
      console.log('client-portal-auth - Authenticating token:', token ? token.substring(0, 20) + '...' : 'none')
      
      const { data: authData, error: authError } = await supabaseAdmin.rpc('authenticate_client_token', {
        p_token: token
      })

      if (authError || !authData || authData.length === 0 || !authData[0].success) {
        console.error('client-portal-auth - Token authentication error:', authError)
        return new Response(
          JSON.stringify({ error: 'Invalid or expired access token' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        )
      }

      const auth = authData[0]
      console.log('client-portal-auth - Session created for client:', auth.client_id)
      
      return new Response(
        JSON.stringify({
          success: true,
          session_token: auth.session_token,
          client_id: auth.client_id,
          client_name: auth.client_name,
          client_email: auth.client_email,
          resource_type: auth.resource_type,
          resource_id: auth.resource_id,
          expires_at: auth.expires_at
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    if (action === 'validate_session') {
      const sessionToken = req.headers.get('authorization')?.replace('Bearer ', '') ||
                          (await req.json()).session_token
      
      console.log('client-portal-auth - Validating session token:', sessionToken ? sessionToken.substring(0, 20) + '...' : 'none')
      
      if (!sessionToken) {
        return new Response(
          JSON.stringify({ error: 'Missing session token' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        )
      }

      const { data: sessionData, error: sessionError } = await supabaseAdmin.rpc('validate_client_portal_session', {
        p_session_token: sessionToken
      })

      if (sessionError || !sessionData || sessionData.length === 0 || !sessionData[0].valid) {
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
    console.error('client-portal-auth - Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
