
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

    console.log('🔐 Validating portal access for token:', accessId)

    // First try using the database function for proper validation
    try {
      const { data: functionResult, error: functionError } = await supabaseClient
        .rpc('validate_portal_access', {
          p_access_token: accessId,
          p_ip_address: clientIP,
          p_user_agent: userAgent
        })

      if (functionError) {
        console.error('❌ Database function error:', functionError)
        throw functionError
      }

      if (functionResult && functionResult.valid) {
        console.log('✅ Valid portal access via database function')
        return new Response(
          JSON.stringify(functionResult),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
    } catch (funcError) {
      console.error('❌ Function validation failed:', funcError)
    }

    // Fallback: Direct database query with service role (bypasses RLS)
    console.log('🔄 Trying direct database query fallback...')
    
    // Check portal_sessions first
    const { data: portalSession, error: sessionError } = await supabaseClient
      .from('portal_sessions')
      .select('*, clients!inner(id, name, email, phone, address, city, state, zip)')
      .eq('access_token', accessId)
      .gt('expires_at', new Date().toISOString())
      .eq('is_active', true)
      .single()

    if (!sessionError && portalSession) {
      console.log('✅ Valid portal session found')
      
      return new Response(
        JSON.stringify({ 
          valid: true,
          client: {
            id: portalSession.clients.id,
            name: portalSession.clients.name,
            email: portalSession.clients.email,
            phone: portalSession.clients.phone,
            address: portalSession.clients.address,
            city: portalSession.clients.city,
            state: portalSession.clients.state,
            zip: portalSession.clients.zip
          },
          permissions: portalSession.permissions || {
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
    }

    // Check client_portal_access as fallback
    const { data: portalAccess, error: accessError } = await supabaseClient
      .from('client_portal_access')
      .select('*, clients!inner(id, name, email, phone, address, city, state, zip)')
      .eq('access_token', accessId)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (!accessError && portalAccess) {
      console.log('✅ Valid portal access found in client_portal_access')
      
      // Update use count
      await supabaseClient
        .from('client_portal_access')
        .update({ 
          use_count: (portalAccess.use_count || 0) + 1,
          used_at: new Date().toISOString()
        })
        .eq('access_token', accessId)

      return new Response(
        JSON.stringify({ 
          valid: true,
          client: {
            id: portalAccess.clients.id,
            name: portalAccess.clients.name,
            email: portalAccess.clients.email,
            phone: portalAccess.clients.phone,
            address: portalAccess.clients.address,
            city: portalAccess.clients.city,
            state: portalAccess.clients.state,
            zip: portalAccess.clients.zip
          },
          permissions: portalAccess.permissions || {
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
    }

    // If no valid token found
    console.log('❌ No valid portal access found for token:', accessId)
    return new Response(
      JSON.stringify({ 
        valid: false, 
        error: 'Invalid or expired access token' 
      }),
      { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('❌ Error in validate-portal-access:', error)
    return new Response(
      JSON.stringify({ 
        valid: false, 
        error: 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
