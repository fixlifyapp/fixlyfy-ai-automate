
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DomainRequest {
  action: 'add' | 'verify' | 'list' | 'delete'
  domain?: string
  companyId?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 401,
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token)
    if (userError) throw userError

    const { action, domain, companyId }: DomainRequest = await req.json()
    const mailgunApiKey = Deno.env.get('MAILGUN_API_KEY')
    
    if (!mailgunApiKey) {
      throw new Error('Mailgun API key not configured')
    }

    const mailgunHeaders = {
      'Authorization': `Basic ${btoa(`api:${mailgunApiKey}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    }

    switch (action) {
      case 'add':
        if (!domain) throw new Error('Domain is required')
        
        // Add domain to Mailgun
        const addResponse = await fetch('https://api.mailgun.net/v3/domains', {
          method: 'POST',
          headers: mailgunHeaders,
          body: new URLSearchParams({
            name: domain,
            smtp_password: crypto.randomUUID(),
          }),
        })

        if (!addResponse.ok) {
          const errorText = await addResponse.text()
          throw new Error(`Failed to add domain to Mailgun: ${errorText}`)
        }

        const domainData = await addResponse.json()
        
        // Update company settings
        const { error: updateError } = await supabaseClient
          .from('company_settings')
          .update({
            custom_domain: domain,
            mailgun_domain: domain,
            domain_verification_status: 'pending',
            email_from_address: `noreply@${domain}`,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userData.user.id)

        if (updateError) throw updateError

        return new Response(JSON.stringify({ 
          success: true, 
          domain: domainData.domain,
          dns_records: domainData.receiving_dns_records 
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        })

      case 'verify':
        if (!domain) throw new Error('Domain is required')
        
        // Check domain verification status in Mailgun
        const verifyResponse = await fetch(`https://api.mailgun.net/v3/domains/${domain}`, {
          headers: { 'Authorization': `Basic ${btoa(`api:${mailgunApiKey}`)}` },
        })

        if (!verifyResponse.ok) {
          throw new Error('Failed to verify domain')
        }

        const verifyData = await verifyResponse.json()
        const isVerified = verifyData.domain.state === 'active'
        
        // Update verification status
        await supabaseClient
          .from('company_settings')
          .update({
            domain_verification_status: isVerified ? 'verified' : 'pending',
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userData.user.id)

        return new Response(JSON.stringify({ 
          success: true, 
          verified: isVerified,
          domain: verifyData.domain 
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        })

      case 'list':
        // List all domains for the user
        const listResponse = await fetch('https://api.mailgun.net/v3/domains', {
          headers: { 'Authorization': `Basic ${btoa(`api:${mailgunApiKey}`)}` },
        })

        if (!listResponse.ok) {
          throw new Error('Failed to list domains')
        }

        const listData = await listResponse.json()
        
        return new Response(JSON.stringify({ 
          success: true, 
          domains: listData.items 
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        })

      default:
        throw new Error('Invalid action')
    }

  } catch (error) {
    console.error('Error in manage-mailgun-domains:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      status: 500,
    })
  }
})
