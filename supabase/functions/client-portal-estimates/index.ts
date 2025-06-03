
import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
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

    // Get session token from headers
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid authorization header' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const sessionToken = authHeader.replace('Bearer ', '')

    // Validate session and get client info
    const { data: sessionData, error: sessionError } = await supabaseAdmin.rpc('validate_client_session', {
      p_session_token: sessionToken
    })

    if (sessionError || !sessionData || sessionData.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired session' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const session = sessionData[0]
    const clientEmail = session.client_email

    // Set user context for RLS
    await supabaseAdmin.rpc('set_client_portal_user_email', { user_email: clientEmail })

    // Fetch estimates for the client
    const { data: estimates, error: estimatesError } = await supabaseAdmin
      .from('estimates')
      .select(`
        *,
        jobs:job_id (
          id,
          title,
          description,
          address,
          clients:client_id (
            id,
            name,
            email,
            phone,
            company
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (estimatesError) {
      console.error('Error fetching estimates:', estimatesError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch estimates' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Fetch line items for all estimates
    const estimateIds = estimates?.map(e => e.id) || []
    const { data: lineItems, error: lineItemsError } = await supabaseAdmin
      .from('line_items')
      .select('*')
      .eq('parent_type', 'estimate')
      .in('parent_id', estimateIds)

    if (lineItemsError) {
      console.error('Error fetching line items:', lineItemsError)
    }

    // Group line items by estimate
    const lineItemsByEstimate = (lineItems || []).reduce((acc, item) => {
      if (!acc[item.parent_id]) {
        acc[item.parent_id] = []
      }
      acc[item.parent_id].push(item)
      return acc
    }, {})

    // Combine estimates with their line items
    const estimatesWithItems = estimates?.map(estimate => ({
      ...estimate,
      lineItems: lineItemsByEstimate[estimate.id] || []
    })) || []

    return new Response(
      JSON.stringify({ 
        estimates: estimatesWithItems,
        client: {
          id: session.client_id,
          name: session.client_name,
          email: session.client_email
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in client-portal-estimates:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
