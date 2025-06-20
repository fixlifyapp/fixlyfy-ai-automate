
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

    const { jobNumber } = await req.json()
    console.log('🔍 Loading job portal data for job number:', jobNumber)

    if (!jobNumber) {
      return new Response(
        JSON.stringify({ error: 'Job number is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get job data by job number (assuming job number is the job ID)
    const { data: job, error: jobError } = await supabaseClient
      .from('jobs')
      .select('*')
      .eq('id', jobNumber)
      .single()

    if (jobError || !job) {
      console.log('❌ Job not found:', jobNumber)
      return new Response(
        JSON.stringify({ error: 'Job not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get client data
    let client = null;
    if (job.client_id) {
      const { data: clientData, error: clientError } = await supabaseClient
        .from('clients')
        .select('*')
        .eq('id', job.client_id)
        .single()

      if (clientError) {
        console.warn('Could not fetch client data:', clientError)
      } else {
        client = clientData;
      }
    }

    // Get job's estimates
    const { data: estimates, error: estimatesError } = await supabaseClient
      .from('estimates')
      .select('*')
      .eq('job_id', job.id)
      .order('created_at', { ascending: false })

    if (estimatesError) {
      console.warn('Error fetching estimates:', estimatesError)
    }

    // Get job's invoices
    const { data: invoices, error: invoicesError } = await supabaseClient
      .from('invoices')
      .select('*')
      .eq('job_id', job.id)
      .order('created_at', { ascending: false })

    if (invoicesError) {
      console.warn('Error fetching invoices:', invoicesError)
    }

    console.log('✅ Job portal data loaded successfully for job:', job.id)

    return new Response(
      JSON.stringify({
        job: {
          id: job.id,
          title: job.title || 'Service Call',
          description: job.description,
          status: job.status,
          address: job.address,
          scheduled_start: job.schedule_start,
          created_at: job.created_at
        },
        client: client ? {
          id: client.id,
          name: client.name,
          email: client.email,
          phone: client.phone,
          address: client.address,
          city: client.city,
          state: client.state,
          zip: client.zip
        } : null,
        estimates: estimates || [],
        invoices: invoices || [],
        messages: [], // Not implemented yet
        documents: [], // Not implemented yet
        permissions: {
          view_estimates: true,
          view_invoices: true,
          make_payments: true // Full access for job portal
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('❌ Error loading job portal data:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to load job portal data' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
