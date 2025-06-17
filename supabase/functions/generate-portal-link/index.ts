
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

    const { clientId, validHours = 72 } = await req.json()
    console.log('🔗 Generating portal link for client:', clientId)

    // Verify client exists
    const { data: client, error: clientError } = await supabaseClient
      .from('clients')
      .select('id, name')
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

    // Generate access token using our database function
    const { data: accessToken, error: tokenError } = await supabaseClient
      .rpc('generate_client_portal_access', {
        p_client_id: clientId,
        p_document_type: 'general',
        p_document_id: crypto.randomUUID(),
        p_hours_valid: validHours
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

    console.log('✅ Generated portal access token for client:', client.name)

    return new Response(
      JSON.stringify({ 
        success: true, 
        accessLink: accessToken,
        clientId: clientId,
        expiresIn: validHours 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('❌ Error in generate-portal-link:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
