
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MailgunRequest {
  action: 'verify' | 'create' | 'list';
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
      return new Response(JSON.stringify({ error: 'Authentication failed' }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 401,
      });
    }

    const { action, domain }: MailgunRequest = await req.json();
    const mailgunApiKey = Deno.env.get('MAILGUN_API_KEY');
    
    if (!mailgunApiKey) {
      return new Response(JSON.stringify({ error: 'Mailgun API key not configured' }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 500,
      });
    }

    if (action === 'verify' && domain) {
      // Verify domain with Mailgun
      const response = await fetch(`https://api.mailgun.net/v3/domains/${domain}/verify`, {
        method: 'PUT',
        headers: {
          'Authorization': `Basic ${btoa(`api:${mailgunApiKey}`)}`
        }
      });

      const result = await response.json();
      
      let verified = false;
      if (response.ok) {
        // Check if domain is verified
        verified = result.domain?.state === 'active';
      }

      // Update company settings with verification status
      await supabaseClient
        .from('company_settings')
        .upsert({
          user_id: userData.user.id,
          domain_verification_status: verified ? 'verified' : 'pending'
        });

      return new Response(
        JSON.stringify({ 
          verified,
          domain: result.domain,
          message: verified ? 'Domain verified successfully' : 'Domain verification pending'
        }),
        {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    if (action === 'list') {
      // List domains
      const response = await fetch('https://api.mailgun.net/v3/domains', {
        headers: {
          'Authorization': `Basic ${btoa(`api:${mailgunApiKey}`)}`
        }
      });

      const result = await response.json();
      
      return new Response(
        JSON.stringify(result),
        {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error) {
    console.error('Error in manage-mailgun-domains function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to manage domain' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});
