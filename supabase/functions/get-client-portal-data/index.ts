
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

    const { accessId } = await req.json()
    console.log('🔍 Looking up portal access for:', accessId)

    // Verify the access token and get associated data
    const { data: accessData, error: accessError } = await supabaseClient
      .from('client_portal_access')
      .select('*')
      .eq('access_token', accessId)
      .single()

    if (accessError || !accessData) {
      console.error('❌ Access token not found:', accessError)
      return new Response(
        JSON.stringify({ error: 'Access token not found or expired' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Check if token has expired
    if (new Date(accessData.expires_at) < new Date()) {
      console.error('❌ Access token expired')
      return new Response(
        JSON.stringify({ error: 'Access token has expired' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('✅ Valid access token found for client:', accessData.client_id)

    // Get client information
    const { data: client, error: clientError } = await supabaseClient
      .from('clients')
      .select('*')
      .eq('id', accessData.client_id)
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

    // Get estimates for the client
    const { data: estimates, error: estimatesError } = await supabaseClient
      .from('estimates')
      .select('*')
      .eq('client_id', accessData.client_id)
      .order('created_at', { ascending: false })

    if (estimatesError) {
      console.error('❌ Error fetching estimates:', estimatesError)
    }

    // Get invoices for the client
    const { data: invoices, error: invoicesError } = await supabaseClient
      .from('invoices')
      .select('*')
      .eq('client_id', accessData.client_id)
      .order('created_at', { ascending: false })

    if (invoicesError) {
      console.error('❌ Error fetching invoices:', invoicesError)
    }

    // Mark the access token as used
    await supabaseClient
      .from('client_portal_access')
      .update({ used_at: new Date().toISOString() })
      .eq('access_token', accessId)

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
