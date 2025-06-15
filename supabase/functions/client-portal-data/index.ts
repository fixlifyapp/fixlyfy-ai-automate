
import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, client-portal-session',
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

    const sessionToken = req.headers.get('client-portal-session') || req.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!sessionToken) {
      return new Response(
        JSON.stringify({ error: 'Missing session token' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // Validate session
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
    const clientId = session.client_id

    const url = new URL(req.url)
    const dataType = url.searchParams.get('type')
    const resourceId = url.searchParams.get('id')

    if (dataType === 'estimates') {
      // Get estimates for this client
      let query = supabaseAdmin
        .from('estimates')
        .select(`
          id,
          estimate_number,
          total,
          status,
          notes,
          date,
          created_at,
          jobs!inner(
            id,
            title,
            description,
            client_id
          )
        `)
        .eq('jobs.client_id', clientId)
        .order('created_at', { ascending: false })

      if (resourceId) {
        query = query.eq('id', resourceId)
      }

      const { data: estimates, error: estimatesError } = await query

      if (estimatesError) {
        console.error('Error fetching estimates:', estimatesError)
        return new Response(
          JSON.stringify({ error: 'Failed to fetch estimates' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      return new Response(
        JSON.stringify({ estimates }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    if (dataType === 'invoices') {
      // Get invoices for this client
      let query = supabaseAdmin
        .from('invoices')
        .select(`
          id,
          invoice_number,
          total,
          amount_paid,
          balance,
          status,
          due_date,
          notes,
          date,
          created_at,
          jobs!inner(
            id,
            title,
            description,
            client_id
          )
        `)
        .eq('jobs.client_id', clientId)
        .order('created_at', { ascending: false })

      if (resourceId) {
        query = query.eq('id', resourceId)
      }

      const { data: invoices, error: invoicesError } = await query

      if (invoicesError) {
        console.error('Error fetching invoices:', invoicesError)
        return new Response(
          JSON.stringify({ error: 'Failed to fetch invoices' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      return new Response(
        JSON.stringify({ invoices }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    if (dataType === 'jobs') {
      // Get jobs for this client
      let query = supabaseAdmin
        .from('jobs')
        .select(`
          id,
          title,
          description,
          status,
          date,
          schedule_start,
          schedule_end,
          address,
          notes,
          service,
          job_type,
          created_at
        `)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })

      if (resourceId) {
        query = query.eq('id', resourceId)
      }

      const { data: jobs, error: jobsError } = await query

      if (jobsError) {
        console.error('Error fetching jobs:', jobsError)
        return new Response(
          JSON.stringify({ error: 'Failed to fetch jobs' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      return new Response(
        JSON.stringify({ jobs }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    if (dataType === 'payments') {
      // Get payments for this client's invoices
      const { data: payments, error: paymentsError } = await supabaseAdmin
        .from('payments')
        .select(`
          id,
          amount,
          method,
          reference,
          notes,
          date,
          created_at,
          invoices!inner(
            id,
            invoice_number,
            jobs!inner(
              client_id
            )
          )
        `)
        .eq('invoices.jobs.client_id', clientId)
        .order('created_at', { ascending: false })

      if (paymentsError) {
        console.error('Error fetching payments:', paymentsError)
        return new Response(
          JSON.stringify({ error: 'Failed to fetch payments' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      return new Response(
        JSON.stringify({ payments }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    if (dataType === 'dashboard') {
      // Get dashboard overview data
      const [estimatesRes, invoicesRes, jobsRes] = await Promise.all([
        supabaseAdmin
          .from('estimates')
          .select('id, status, total, jobs!inner(client_id)')
          .eq('jobs.client_id', clientId),
        supabaseAdmin
          .from('invoices')
          .select('id, status, total, amount_paid, jobs!inner(client_id)')
          .eq('jobs.client_id', clientId),
        supabaseAdmin
          .from('jobs')
          .select('id, status, title, schedule_start')
          .eq('client_id', clientId)
          .order('created_at', { ascending: false })
          .limit(5)
      ])

      const dashboard = {
        estimates: estimatesRes.data || [],
        invoices: invoicesRes.data || [],
        recentJobs: jobsRes.data || [],
        stats: {
          totalEstimates: (estimatesRes.data || []).length,
          totalInvoices: (invoicesRes.data || []).length,
          pendingInvoices: (invoicesRes.data || []).filter(inv => inv.status === 'unpaid').length,
          totalOwed: (invoicesRes.data || []).reduce((sum, inv) => sum + (inv.total - inv.amount_paid), 0)
        }
      }

      return new Response(
        JSON.stringify({ dashboard }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid data type requested' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )

  } catch (error) {
    console.error('client-portal-data - Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
