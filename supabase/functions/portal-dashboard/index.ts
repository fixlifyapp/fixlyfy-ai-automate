
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

    const { token } = await req.json()
    
    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Token is required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Validate session
    const { data: sessionData, error: sessionError } = await supabaseAdmin
      .rpc('validate_client_portal_session', { p_token: token })

    if (sessionError || !sessionData || sessionData.length === 0 || !sessionData[0].is_valid) {
      return new Response(
        JSON.stringify({ error: 'Invalid session' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      )
    }

    const session = sessionData[0]
    const clientId = session.client_id

    // Get client information
    const { data: client, error: clientError } = await supabaseAdmin
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single()

    if (clientError) {
      console.error('Client fetch error:', clientError)
    }

    // Get jobs for this client
    const { data: jobs, error: jobsError } = await supabaseAdmin
      .from('jobs')
      .select(`
        id,
        title,
        description,
        status,
        job_type,
        service,
        date,
        schedule_start,
        schedule_end,
        revenue,
        address,
        notes,
        created_at,
        updated_at
      `)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })

    if (jobsError) {
      console.error('Jobs fetch error:', jobsError)
    }

    // Get estimates for this client
    const { data: estimates, error: estimatesError } = await supabaseAdmin
      .from('estimates')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })

    if (estimatesError) {
      console.error('Estimates fetch error:', estimatesError)
    }

    // Get invoices for this client
    const { data: invoices, error: invoicesError } = await supabaseAdmin
      .from('invoices')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })

    if (invoicesError) {
      console.error('Invoices fetch error:', invoicesError)
    }

    // Get payments for this client
    const { data: payments, error: paymentsError } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })

    if (paymentsError) {
      console.error('Payments fetch error:', paymentsError)
    }

    // Get recent activity for this client
    const { data: activities, error: activitiesError } = await supabaseAdmin
      .from('client_portal_activity_logs')
      .select('*')
      .eq('client_portal_user_id', session.user_id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (activitiesError) {
      console.error('Activities fetch error:', activitiesError)
    }

    // Log dashboard access
    await supabaseAdmin.rpc('log_client_portal_activity', {
      p_user_id: session.user_id,
      p_action: 'view_dashboard',
      p_resource_type: 'portal',
      p_resource_id: null,
      p_details: {},
      p_ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      p_user_agent: req.headers.get('user-agent') || 'unknown'
    })

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          client: client || null,
          jobs: jobs || [],
          estimates: estimates || [],
          invoices: invoices || [],
          payments: payments || [],
          activities: activities || [],
          session: {
            user_id: session.user_id,
            client_id: session.client_id,
            email: session.email,
            name: session.name,
            document_type: session.document_type,
            document_id: session.document_id
          }
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Portal dashboard error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
