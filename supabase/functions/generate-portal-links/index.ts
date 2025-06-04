
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

    const { clientEmail, linkType, resourceId, jobId } = await req.json()
    console.log('generate-portal-links - Request:', { clientEmail, linkType, resourceId, jobId })

    if (!clientEmail) {
      return new Response(
        JSON.stringify({ error: 'Client email is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Ensure client portal user exists
    const { data: existingPortalUser, error: portalUserError } = await supabaseAdmin
      .from('client_portal_users')
      .select('*')
      .eq('email', clientEmail)
      .single()

    if (portalUserError && portalUserError.code === 'PGRST116') {
      // Create client portal user if doesn't exist
      const { error: createError } = await supabaseAdmin
        .from('client_portal_users')
        .insert({
          email: clientEmail,
          client_id: (await supabaseAdmin
            .from('clients')
            .select('id')
            .eq('email', clientEmail)
            .single()).data?.id,
          is_active: true
        })

      if (createError) {
        console.error('Error creating client portal user:', createError)
        return new Response(
          JSON.stringify({ error: 'Failed to create portal user' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }
    }

    // Generate login token
    const { data: tokenData, error: tokenError } = await supabaseAdmin.rpc('generate_client_login_token', {
      p_email: clientEmail
    })
    
    if (tokenError || !tokenData) {
      console.error('Failed to generate portal login token:', tokenError)
      return new Response(
        JSON.stringify({ error: 'Failed to generate login token' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Build portal URL based on link type
    const portalDomain = 'https://hub.fixlify.app' // Update with your actual domain
    let portalPath = '/portal/login'
    let queryParams = new URLSearchParams({ token: tokenData })

    switch (linkType) {
      case 'estimate':
        if (resourceId) {
          queryParams.set('redirect', `/portal/estimates?id=${resourceId}`)
        } else {
          queryParams.set('redirect', '/portal/estimates')
        }
        break
      case 'invoice':
        if (resourceId) {
          queryParams.set('redirect', `/portal/invoices?id=${resourceId}`)
        } else {
          queryParams.set('redirect', '/portal/invoices')
        }
        break
      case 'job':
        if (jobId || resourceId) {
          queryParams.set('redirect', `/portal/jobs?id=${jobId || resourceId}`)
        } else {
          queryParams.set('redirect', '/portal/jobs')
        }
        break
      default:
        queryParams.set('redirect', '/portal/dashboard')
    }

    const portalLink = `${portalDomain}${portalPath}?${queryParams.toString()}`
    
    console.log('Generated portal link:', portalLink.substring(0, 80) + '...')

    return new Response(
      JSON.stringify({ 
        portalLink,
        token: tokenData,
        linkType,
        clientEmail 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('generate-portal-links - Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
