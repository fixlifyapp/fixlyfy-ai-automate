
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
    console.log('📊 Loading enhanced portal data for token:', accessToken)

    let clientId: string | null = null
    let permissions = {
      view_estimates: true,
      view_invoices: true,
      make_payments: false
    }

    // Check if this is a direct client ID (legacy support)
    if (accessToken && accessToken.startsWith('C-')) {
      clientId = accessToken
      console.log('📌 Using direct client ID:', clientId)
    } else if (accessToken) {
      // Validate token to get client ID and permissions
      console.log('🔍 Validating token to get client ID...')
      
      // Check client_portal_access table first
      const { data: portalAccess, error: portalError } = await supabaseClient
        .from('client_portal_access')
        .select('*')
        .eq('access_token', accessToken)
        .gt('expires_at', new Date().toISOString())
        .single()

      if (portalAccess && !portalError) {
        console.log('✅ Found valid token in client_portal_access')
        clientId = portalAccess.client_id
        permissions = portalAccess.permissions || permissions
        
        // Update use count
        await supabaseClient
          .from('client_portal_access')
          .update({ 
            use_count: (portalAccess.use_count || 0) + 1,
            used_at: new Date().toISOString()
          })
          .eq('access_token', accessToken)
      } else {
        // Check portal_sessions table as fallback
        console.log('🔍 Checking portal_sessions as fallback...')
        
        const { data: session, error: sessionError } = await supabaseClient
          .from('portal_sessions')
          .select('*')
          .eq('access_token', accessToken)
          .gt('expires_at', new Date().toISOString())
          .eq('is_active', true)
          .single()

        if (session && !sessionError) {
          console.log('✅ Found valid token in portal_sessions')
          clientId = session.client_id
          permissions = session.permissions || permissions
          
          // Update last accessed
          await supabaseClient
            .from('portal_sessions')
            .update({ last_accessed_at: new Date().toISOString() })
            .eq('access_token', accessToken)
        }
      }
    }

    if (!clientId) {
      console.log('❌ No valid access found')
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

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

    console.log('📋 Loading data for client:', client.name, 'ID:', clientId)

    // Get client's jobs
    const { data: jobs, error: jobsError } = await supabaseClient
      .from('jobs')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })

    if (jobsError) {
      console.warn('Warning: Error fetching jobs:', jobsError)
    }

    const jobIds = jobs?.map(job => job.id) || []
    console.log('🔧 Found jobs:', jobIds.length)

    // Get client's estimates with proper data
    const { data: estimates, error: estimatesError } = await supabaseClient
      .from('estimates')
      .select('*')
      .in('job_id', jobIds.length > 0 ? jobIds : ['no-jobs'])
      .order('created_at', { ascending: false })

    if (estimatesError) {
      console.warn('Warning: Error fetching estimates:', estimatesError)
    }

    console.log('📋 Found estimates:', estimates?.length || 0)
    if (estimates && estimates.length > 0) {
      console.log('💰 Estimate totals:', estimates.map(e => ({ id: e.id, total: e.total, status: e.status })))
    }

    // Get client's invoices with proper data
    const { data: invoices, error: invoicesError } = await supabaseClient
      .from('invoices')
      .select('*')
      .in('job_id', jobIds.length > 0 ? jobIds : ['no-jobs'])
      .order('created_at', { ascending: false })

    if (invoicesError) {
      console.warn('Warning: Error fetching invoices:', invoicesError)
    }

    console.log('📄 Found invoices:', invoices?.length || 0)
    if (invoices && invoices.length > 0) {
      console.log('💰 Invoice totals:', invoices.map(i => ({ 
        id: i.id, 
        total: i.total, 
        status: i.status, 
        payment_status: i.payment_status 
      })))
    }

    // Calculate actual totals
    const estimateCount = estimates?.length || 0
    const estimateValue = estimates?.reduce((sum, est) => sum + (parseFloat(est.total) || 0), 0) || 0
    
    const invoiceCount = invoices?.length || 0
    const invoiceValue = invoices?.reduce((sum, inv) => sum + (parseFloat(inv.total) || 0), 0) || 0
    
    const paidInvoices = invoices?.filter(inv => 
      inv.status === 'paid' || inv.payment_status === 'paid'
    ) || []
    const paidCount = paidInvoices.length
    const paidValue = paidInvoices.reduce((sum, inv) => sum + (parseFloat(inv.total) || 0), 0)
    
    const pendingInvoices = invoices?.filter(inv => 
      inv.status !== 'paid' && inv.payment_status !== 'paid'
    ) || []
    const pendingCount = pendingInvoices.length

    console.log('📊 Calculated totals:', {
      estimates: { count: estimateCount, value: estimateValue },
      invoices: { count: invoiceCount, value: invoiceValue },
      paid: { count: paidCount, value: paidValue },
      pending: { count: pendingCount }
    })

    console.log('✅ Portal data loaded successfully for client:', client.name)

    // Log the access for audit purposes
    await supabaseClient
      .from('portal_activity_logs')
      .insert({
        client_id: clientId,
        action: 'portal_data_accessed',
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown',
        metadata: { 
          access_method: accessToken.startsWith('C-') ? 'direct' : 'token',
          data_loaded: true,
          totals: {
            estimates: estimateCount,
            invoices: invoiceCount,
            paid: paidCount,
            pending: pendingCount
          }
        }
      })

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
        permissions: permissions,
        // Add calculated totals for easier frontend access
        totals: {
          estimates: {
            count: estimateCount,
            value: estimateValue
          },
          invoices: {
            count: invoiceCount,
            value: invoiceValue
          },
          paid: {
            count: paidCount,
            value: paidValue
          },
          pending: {
            count: pendingCount
          }
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
