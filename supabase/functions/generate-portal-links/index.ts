
import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Input validation functions
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
};

const sanitizeInput = (input: string, maxLength: number = 255): string => {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, maxLength);
};

const getPortalDomain = (): string => {
  // Always use hub.fixlify.app as the portal domain
  return 'https://hub.fixlify.app';
};

const validatePortalDomain = (domain: string): boolean => {
  try {
    const url = new URL(domain);
    return url.protocol === 'https:' && url.hostname.length > 0;
  } catch {
    return false;
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const requestBody = await req.json()
    const { clientEmail, linkType, resourceId, jobId } = requestBody
    
    // Enhanced input validation
    const sanitizedEmail = sanitizeInput(clientEmail || '', 254);
    const sanitizedLinkType = sanitizeInput(linkType || '', 50);
    const sanitizedResourceId = sanitizeInput(resourceId || '', 100);
    const sanitizedJobId = sanitizeInput(jobId || '', 100);
    
    console.log('generate-portal-links - Request:', { 
      clientEmail: sanitizedEmail, 
      linkType: sanitizedLinkType, 
      resourceId: sanitizedResourceId, 
      jobId: sanitizedJobId 
    })

    if (!validateEmail(sanitizedEmail)) {
      return new Response(
        JSON.stringify({ error: 'Valid client email is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Ensure client portal user exists
    const { data: existingPortalUser, error: portalUserError } = await supabaseAdmin
      .from('client_portal_users')
      .select('*')
      .eq('email', sanitizedEmail)
      .single()

    if (portalUserError && portalUserError.code === 'PGRST116') {
      // Create client portal user if doesn't exist
      const { error: createError } = await supabaseAdmin
        .from('client_portal_users')
        .insert({
          email: sanitizedEmail,
          client_id: (await supabaseAdmin
            .from('clients')
            .select('id')
            .eq('email', sanitizedEmail)
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
      p_email: sanitizedEmail
    })
    
    if (tokenError || !tokenData) {
      console.error('Failed to generate portal login token:', tokenError)
      return new Response(
        JSON.stringify({ error: 'Failed to generate login token' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Build portal URL based on link type - always use hub.fixlify.app
    const portalDomain = getPortalDomain()
    
    if (!validatePortalDomain(portalDomain)) {
      console.error('Invalid portal domain configuration:', portalDomain)
      return new Response(
        JSON.stringify({ error: 'Portal configuration error' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }
    
    let portalPath = '/portal/login'
    let queryParams = new URLSearchParams({ token: tokenData })

    switch (sanitizedLinkType) {
      case 'estimate':
        if (sanitizedResourceId) {
          queryParams.set('redirect', `/portal/estimates?id=${sanitizedResourceId}`)
        } else {
          queryParams.set('redirect', '/portal/estimates')
        }
        break
      case 'invoice':
        if (sanitizedResourceId) {
          queryParams.set('redirect', `/portal/invoices?id=${sanitizedResourceId}`)
        } else {
          queryParams.set('redirect', '/portal/invoices')
        }
        break
      case 'job':
        if (sanitizedJobId || sanitizedResourceId) {
          queryParams.set('redirect', `/portal/jobs?id=${sanitizedJobId || sanitizedResourceId}`)
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
        linkType: sanitizedLinkType,
        clientEmail: sanitizedEmail 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('generate-portal-links - Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
