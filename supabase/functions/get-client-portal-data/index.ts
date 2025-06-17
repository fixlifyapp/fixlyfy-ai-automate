
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

    const { clientId } = await req.json()
    console.log('🔍 Looking up portal data for client:', clientId)

    // Get client information
    const { data: client, error: clientError } = await supabaseClient
      .from('clients')
      .select('*')
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

    console.log('✅ Valid client found:', client.name)

    // Get estimates for the client
    const { data: estimates, error: estimatesError } = await supabaseClient
      .from('estimates')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })

    if (estimatesError) {
      console.error('❌ Error fetching estimates:', estimatesError)
    }

    // Get invoices for the client
    const { data: invoices, error: invoicesError } = await supabaseClient
      .from('invoices')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })

    if (invoicesError) {
      console.error('❌ Error fetching invoices:', invoicesError)
    }

    const portalData = {
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone
      },
      estimates: estimates || [],
      invoices: invoices || []
    }

    console.log('📊 Returning portal data for client:', client.name)

    return new Response(
      JSON.stringify(portalData),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('❌ Error in get-client-portal-data:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
