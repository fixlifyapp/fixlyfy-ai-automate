
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
    console.log('📊 Loading enhanced portal data for client:', accessToken)

    // For portal domain, accessToken is actually the client_id
    if (!accessToken || !accessToken.startsWith('C-')) {
      return new Response(
        JSON.stringify({ error: 'Invalid client ID' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const clientId = accessToken

    // Get client data
    const { data: client, error: clientError } = await supabaseClient
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single()

    if (clientError || !client) {
      console.log('❌ Client not found:', clientId)
      return new Response(
        JSON.stringify({ error: 'Client not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get client's jobs
    const { data: jobs, error: jobsError } = await supabaseClient
      .from('jobs')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })

    if (jobsError) {
      console.warn('Error fetching jobs:', jobsError)
    }

    // Get client's estimates
    const { data: estimates, error: estimatesError } = await supabaseClient
      .from('estimates')
      .select('*')
      .in('job_id', jobs?.map(job => job.id) || [])
      .order('created_at', { ascending: false })

    if (estimatesError) {
      console.warn('Error fetching estimates:', estimatesError)
    }

    // Get client's invoices
    const { data: invoices, error: invoicesError } = await supabaseClient
      .from('invoices')
      .select('*')
      .in('job_id', jobs?.map(job => job.id) || [])
      .order('created_at', { ascending: false })

    if (invoicesError) {
      console.warn('Error fetching invoices:', invoicesError)
    }

    console.log('✅ Portal data loaded successfully for client:', client.name)

    return new Response(
      JSON.stringify({
        client: {
          id: client.id,
          name: client.name,
          email: client.email,
          phone: client.phone,
          address: client.address,
          city: client.city,
          state: client.state,
          zip: client.zip
        },
        jobs: jobs || [],
        estimates: estimates || [],
        invoices: invoices || [],
        messages: [], // Not implemented yet
        documents: [], // Not implemented yet
        preferences: {
          theme: 'light',
          language: 'en',
          notification_preferences: {},
          timezone: 'UTC'
        },
        permissions: {
          view_estimates: true,
          view_invoices: true,
          make_payments: false
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('❌ Error loading portal data:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to load portal data' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
