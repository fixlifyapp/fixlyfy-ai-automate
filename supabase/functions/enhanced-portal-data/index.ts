
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

    console.log('📊 Getting enhanced portal data for token:', accessToken.substring(0, 8) + '...')

    // First validate access
    const { data: validation, error: validationError } = await supabaseClient
      .rpc('validate_portal_access', {
        p_access_token: accessToken,
        p_ip_address: clientIP,
        p_user_agent: userAgent
      })

    if (validationError || !validation?.valid) {
      console.error('❌ Access validation failed:', validationError)
      return new Response(
        JSON.stringify({ error: 'Access denied' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const clientId = validation.client_id
    const permissions = validation.permissions

    console.log('✅ Valid access for client:', validation.client_name)

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

    // Get estimates (if permitted)
    let estimates = []
    if (permissions.view_estimates) {
      const { data: estimatesData, error: estimatesError } = await supabaseClient
        .from('estimates')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })

      if (!estimatesError) {
        estimates = estimatesData || []
      }
    }

    // Get invoices (if permitted)
    let invoices = []
    if (permissions.view_invoices) {
      const { data: invoicesData, error: invoicesError } = await supabaseClient
        .from('invoices')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })

      if (!invoicesError) {
        invoices = invoicesData || []
      }
    }

    // Get jobs
    const { data: jobs, error: jobsError } = await supabaseClient
      .from('jobs')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })

    // Get portal messages
    const { data: messages, error: messagesError } = await supabaseClient
      .from('portal_messages')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(10)

    // Get portal documents
    const { data: documents, error: documentsError } = await supabaseClient
      .from('portal_documents')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })

    // Get portal preferences
    const { data: preferences, error: preferencesError } = await supabaseClient
      .from('portal_preferences')
      .select('*')
      .eq('client_id', clientId)
      .single()

    // Log portal data access
    await supabaseClient
      .from('portal_activity_logs')
      .insert({
        client_id: clientId,
        action: 'portal_data_access',
        ip_address: clientIP,
        user_agent: userAgent,
        metadata: {
          accessed_sections: {
            estimates: permissions.view_estimates,
            invoices: permissions.view_invoices,
            jobs: true,
            messages: true,
            documents: true
          }
        }
      })

    const portalData = {
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
      estimates: estimates,
      invoices: invoices,
      jobs: jobs || [],
      messages: messages || [],
      documents: documents || [],
      preferences: preferences || {
        theme: 'light',
        language: 'en',
        notification_preferences: { email: true, sms: false },
        timezone: 'UTC'
      },
      permissions: permissions
    }

    console.log('📊 Returning enhanced portal data for client:', client.name)

    return new Response(
      JSON.stringify(portalData),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('❌ Error in enhanced-portal-data:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
