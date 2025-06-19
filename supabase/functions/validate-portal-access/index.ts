
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
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'

    console.log('🔐 Validating portal access:', accessId)

    let clientId: string | null = null
    let permissions = {
      view_estimates: true,
      view_invoices: true,
      make_payments: false
    }

    // First, check if this is a token in client_portal_access table
    if (accessId && !accessId.startsWith('C-')) {
      console.log('🔍 Checking for access token in client_portal_access...')
      
      const { data: portalAccess, error: portalError } = await supabaseClient
        .from('client_portal_access')
        .select('*')
        .eq('access_token', accessId)
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
          .eq('access_token', accessId)
      } else {
        // Check portal_sessions table as fallback
        console.log('🔍 Checking for access token in portal_sessions...')
        
        const { data: session, error: sessionError } = await supabaseClient
          .from('portal_sessions')
          .select('*')
          .eq('access_token', accessId)
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
            .eq('access_token', accessId)
        }
      }
    } else if (accessId && accessId.startsWith('C-')) {
      // Direct client ID access (legacy support)
      console.log('📌 Direct client ID access')
      clientId = accessId
    }

    if (!clientId) {
      console.log('❌ No valid access found')
      return new Response(
        JSON.stringify({ error: 'Invalid or expired access' }),
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

    console.log('✅ Valid portal access for client:', client.name)

    // Log the access
    await supabaseClient
      .from('portal_activity_logs')
      .insert({
        client_id: clientId,
        action: 'portal_access',
        ip_address: clientIP,
        user_agent: userAgent,
        metadata: { access_method: accessId.startsWith('C-') ? 'direct' : 'token' }
      })

    return new Response(
      JSON.stringify({ 
        valid: true,
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
        permissions: permissions
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('❌ Error in validate-portal-access:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
