
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { accessToken } = await req.json()
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'

    console.log('🔐 Validating portal access for token:', accessToken.substring(0, 8) + '...')

    // Use the new validation function
    const { data: validation, error } = await supabaseClient
      .rpc('validate_portal_access', {
        p_access_token: accessToken,
        p_ip_address: clientIP,
        p_user_agent: userAgent
      })

    if (error) {
      console.error('❌ Validation error:', error)
      throw error
    }

    if (!validation?.valid) {
      console.log('❌ Invalid access token')
      return new Response(
        JSON.stringify({ error: validation?.error || 'Access denied' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('✅ Valid portal access for client:', validation.client_name)

    return new Response(
      JSON.stringify({ 
        valid: true,
        client: {
          id: validation.client_id,
          name: validation.client_name,
          email: validation.client_email
        },
        permissions: validation.permissions
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('❌ Error in validate-portal-access:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
