
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DomainRequest {
  action: 'add' | 'verify' | 'list' | 'delete';
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
      // Use the provided domain directly with fixlyfy.app
      const fullDomain = `${domain}.fixlyfy.app`;
      
      console.log(`Adding domain: ${fullDomain}`);
      
      // Add domain to Mailgun
      const mailgunResponse = await fetch(`https://api.mailgun.net/v3/domains`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`api:${mailgunApiKey}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          name: fullDomain,
          smtp_password: 'mailgun123',
          spam_action: 'disabled',
          wildcard: 'false'
        }),
      });

      const mailgunResult = await mailgunResponse.text();
      console.log('Mailgun add domain response:', mailgunResult);

      let mailgunData;
      try {
        mailgunData = JSON.parse(mailgunResult);
      } catch (e) {
        console.error('Failed to parse Mailgun response:', mailgunResult);
        throw new Error('Invalid response from Mailgun API');
      }

      if (!mailgunResponse.ok) {
        console.error("Mailgun error response:", mailgunData);
        throw new Error(`Mailgun API error: ${mailgunResponse.status} - ${mailgunData.message || mailgunResult}`);
      }

      // Get DNS records from Mailgun
      const dnsResponse = await fetch(`https://api.mailgun.net/v3/domains/${fullDomain}`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${btoa(`api:${mailgunApiKey}`)}`,
        },
      });

      const dnsResult = await dnsResponse.text();
      let dnsData;
      try {
        dnsData = JSON.parse(dnsResult);
      } catch (e) {
        console.error('Failed to parse DNS response:', dnsResult);
        dnsData = { domain: { sending_dns_records: [], receiving_dns_records: [] } };
      }

      // Store domain in company settings
      const { error: updateError } = await supabaseClient
        .from('company_settings')
        .upsert({
          user_id: userData.user.id,
          custom_domain: domain,
          mailgun_domain: fullDomain,
          email_from_address: `noreply@${fullDomain}`,
          domain_verification_status: 'pending',
          mailgun_settings: {
            domain_data: mailgunData,
            dns_records: dnsData.domain || {}
          }
        }, {
          onConflict: 'user_id'
        });

      if (updateError) {
        console.error('Database update error:', updateError);
        throw updateError;
      }

      // Return DNS records for user to configure
      const dnsRecords = dnsData.domain?.sending_dns_records || [];
      const receivingRecords = dnsData.domain?.receiving_dns_records || [];

      return new Response(JSON.stringify({ 
        success: true, 
        domain: fullDomain,
        dns_records: [...dnsRecords, ...receivingRecords],
        mailgun_data: mailgunData
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    if (action === 'verify' && domain) {
      const fullDomain = `${domain}.fixlyfy.app`;
      
      console.log(`Verifying domain: ${fullDomain}`);
      
      // Check domain status with Mailgun
      const verifyResponse = await fetch(`https://api.mailgun.net/v3/domains/${fullDomain}/verify`, {
        method: 'PUT',
        headers: {
          'Authorization': `Basic ${btoa(`api:${mailgunApiKey}`)}`,
        },
      });

      const verifyResult = await verifyResponse.text();
      console.log('Mailgun verify response:', verifyResult);

      let verifyData;
      try {
        verifyData = JSON.parse(verifyResult);
      } catch (e) {
        console.error('Failed to parse verify response:', verifyResult);
        verifyData = { domain: { state: 'unverified' } };
      }

      const isVerified = verifyData.domain?.state === 'active';
      const newStatus = isVerified ? 'verified' : 'failed';

      // Update domain verification status
      const { error: updateError } = await supabaseClient
        .from('company_settings')
        .update({
          domain_verification_status: newStatus,
          mailgun_settings: {
            ...((await supabaseClient
              .from('company_settings')
              .select('mailgun_settings')
              .eq('user_id', userData.user.id)
              .single()).data?.mailgun_settings || {}),
            verification_data: verifyData
          }
        })
        .eq('user_id', userData.user.id);

      if (updateError) {
        console.error('Database update error:', updateError);
        throw updateError;
      }

      return new Response(JSON.stringify({ 
        success: true, 
        verified: isVerified,
        status: newStatus,
        verification_data: verifyData
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    if (action === 'list') {
      // List domains from Mailgun
      const listResponse = await fetch(`https://api.mailgun.net/v3/domains`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${btoa(`api:${mailgunApiKey}`)}`,
        },
      });

      const listResult = await listResponse.text();
      let listData;
      try {
        listData = JSON.parse(listResult);
      } catch (e) {
        console.error('Failed to parse list response:', listResult);
        listData = { items: [] };
      }

      return new Response(JSON.stringify({ 
        success: true, 
        domains: listData.items || []
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
