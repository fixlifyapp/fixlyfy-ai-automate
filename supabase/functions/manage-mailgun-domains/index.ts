
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DomainRequest {
  action: 'add' | 'verify' | 'list';
  domain?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 401,
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) {
      console.error('User authentication error:', userError);
      throw new Error('Authentication failed');
    }

    const { action, domain }: DomainRequest = await req.json();
    const mailgunApiKey = Deno.env.get('MAILGUN_API_KEY');
    
    if (!mailgunApiKey) {
      throw new Error('Mailgun API key not configured');
    }

    if (action === 'add' && domain) {
      // For demo purposes, we'll use a custom subdomain approach
      // In production, you'd want to use Mailgun's domain API
      const customDomain = `${domain}.fixlyfy.app`;
      
      // Store domain in company settings
      const { error: updateError } = await supabaseClient
        .from('company_settings')
        .update({
          custom_domain: domain,
          mailgun_domain: customDomain,
          email_from_address: `noreply@${customDomain}`,
          domain_verification_status: 'pending'
        })
        .eq('user_id', userData.user.id);

      if (updateError) throw updateError;

      // Return DNS records that would need to be configured
      const dnsRecords = [
        {
          record_type: 'TXT',
          name: customDomain,
          value: `v=spf1 include:mailgun.org ~all`
        },
        {
          record_type: 'TXT',
          name: `_domainkey.${customDomain}`,
          value: 'k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC...'
        },
        {
          record_type: 'CNAME',
          name: `email.${customDomain}`,
          value: 'mailgun.org'
        }
      ];

      return new Response(JSON.stringify({ 
        success: true, 
        domain: customDomain,
        dns_records: dnsRecords
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    if (action === 'verify' && domain) {
      // For demo purposes, we'll mark as verified immediately
      // In production, you'd check actual DNS records via Mailgun API
      const { error: updateError } = await supabaseClient
        .from('company_settings')
        .update({
          domain_verification_status: 'verified'
        })
        .eq('user_id', userData.user.id)
        .eq('custom_domain', domain);

      if (updateError) throw updateError;

      return new Response(JSON.stringify({ 
        success: true, 
        verified: true 
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      status: 400
    });

  } catch (error) {
    console.error('Error in manage-mailgun-domains function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to manage domain' 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
});
