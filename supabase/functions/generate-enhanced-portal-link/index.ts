
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

    const { 
      clientId, 
      validHours = 72, 
      permissions = { view_estimates: true, view_invoices: true, make_payments: false },
      domainRestriction = 'portal.fixlify.app'
    } = await req.json()

    console.log('🔗 Generating enhanced portal link for client:', clientId)

    // Verify client exists
    const { data: client, error: clientError } = await supabaseClient
      .from('clients')
      .select('id, name, email')
      .eq('id', clientId)
      .single()

    if (clientError || !client) {
      console.error('❌ Client not found:', clientError)
      return new Response(
        JSON.stringify({ error: 'Client not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Generate access token using enhanced function
    const { data: accessToken, error: tokenError } = await supabaseClient
      .rpc('generate_portal_access', {
        p_client_id: clientId,
        p_permissions: permissions,
        p_hours_valid: validHours,
        p_domain_restriction: domainRestriction
      })

    if (tokenError || !accessToken) {
      console.error('❌ Error generating access token:', tokenError)
      return new Response(
        JSON.stringify({ error: 'Failed to generate access token' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('✅ Generated enhanced portal access token for client:', client.name)

    return new Response(
      JSON.stringify({ 
        success: true, 
        accessLink: accessToken,
        clientId: clientId,
        clientName: client.name,
        expiresIn: validHours,
        permissions: permissions,
        portalUrl: `https://${domainRestriction}/portal/${accessToken}`
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('❌ Error in generate-enhanced-portal-link:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
