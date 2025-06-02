
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendEmailRequest {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  templateData?: Record<string, any>;
  companyId?: string;
  conversationId?: string;
  useSandbox?: boolean;
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
      return new Response(JSON.stringify({ error: 'Authentication failed' }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 401,
      });
    }

    const { 
      to, 
      subject, 
      html, 
      text, 
      from, 
      templateData = {}, 
      companyId,
      conversationId,
      useSandbox = false
    }: SendEmailRequest = await req.json();

    console.log('Sending email request:', { to, subject, from, useSandbox });

    // Get company settings to determine custom domain name
    const { data: companySettings, error: settingsError } = await supabaseClient
      .from('company_settings')
      .select('*')
      .eq('user_id', userData.user.id)
      .maybeSingle();

    if (settingsError) {
      console.error('Error fetching company settings:', settingsError);
    }

    let fromEmail = from;
    let mailgunDomain = 'fixlify.app';
    
    // Use sandbox domain for testing if requested
    if (useSandbox) {
      mailgunDomain = 'sandboxXXXXXXXXXXXXXXXXXXXXXXXXXXXX.mailgun.org'; // Replace with your actual sandbox domain
      console.log('Using Mailgun sandbox domain for testing');
    }
    
    // Generate dynamic FROM address based on company's custom domain name
    if (companySettings && companySettings.custom_domain_name && !useSandbox) {
      const fromName = companySettings.email_from_name || companySettings.company_name || 'Support Team';
      const customDomainName = companySettings.custom_domain_name;
      fromEmail = `${fromName} <${customDomainName}@fixlify.app>`;
      console.log('Using custom domain name:', customDomainName);
    } else {
      // Fallback to default support email or sandbox
      const fromName = companySettings?.email_from_name || companySettings?.company_name || 'Support Team';
      if (useSandbox) {
        fromEmail = `${fromName} <postmaster@${mailgunDomain}>`;
      } else {
        fromEmail = `${fromName} <support@fixlify.app>`;
      }
      console.log(useSandbox ? 'Using sandbox domain' : 'Using default support domain');
    }

    const mailgunApiKey = Deno.env.get('MAILGUN_API_KEY');
    if (!mailgunApiKey) {
      console.error('Mailgun API key not found in environment variables');
      return new Response(JSON.stringify({ error: 'Mailgun API key not configured' }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 500,
      });
    }

    console.log('API Key configured, proceeding with email send');
    console.log(`Sending email via Mailgun domain: ${mailgunDomain}`);
    console.log(`From: ${fromEmail}`);
    console.log(`To: ${to}`);

    // Prepare email data
    const formData = new FormData();
    formData.append('from', fromEmail);
    formData.append('to', to);
    formData.append('subject', subject);
    formData.append('html', html);
    if (text) formData.append('text', text);
    
    // Add tracking
    formData.append('o:tracking', 'yes');
    formData.append('o:tracking-clicks', 'yes');
    formData.append('o:tracking-opens', 'yes');

    const mailgunUrl = `https://api.mailgun.net/v3/${mailgunDomain}/messages`;
    const basicAuth = btoa(`api:${mailgunApiKey}`);
    
    console.log('Mailgun send URL:', mailgunUrl);

    const mailgunResponse = await fetch(mailgunUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`
      },
      body: formData
    });

    const responseText = await mailgunResponse.text();
    console.log('Email send response status:', mailgunResponse.status);
    console.log('Email send response headers:', Object.fromEntries(mailgunResponse.headers.entries()));
    console.log('Email send response body:', responseText);

    if (!mailgunResponse.ok) {
      console.error("Mailgun send error:", responseText);
      return new Response(JSON.stringify({ 
        error: `Mailgun API error: ${mailgunResponse.status} - ${responseText}`,
        details: {
          status: mailgunResponse.status,
          response: responseText,
          url: mailgunUrl,
          domain: mailgunDomain,
          troubleshooting: {
            '401': 'Authentication failed - check API key permissions',
            '403': 'Domain not authorized for sending - verify domain ownership',
            '404': 'Domain or endpoint not found',
            '400': 'Bad request - check email format and required fields'
          }[mailgunResponse.status.toString()] || 'Unknown error'
        }
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 500,
      });
    }

    let mailgunResult;
    try {
      mailgunResult = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Error parsing Mailgun response:', parseError);
      return new Response(JSON.stringify({ error: 'Invalid response from Mailgun API' }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 500,
      });
    }

    console.log('Email sent successfully via Mailgun:', mailgunResult);

    // Store email in database for tracking if conversation ID provided
    if (conversationId) {
      const { error: insertError } = await supabaseClient
        .from('email_messages')
        .insert({
          conversation_id: conversationId,
          mailgun_message_id: mailgunResult.id,
          direction: 'outbound',
          sender_email: fromEmail.includes('<') ? fromEmail.split('<')[1].replace('>', '') : fromEmail,
          recipient_email: to,
          subject,
          body_html: html,
          body_text: text,
          delivery_status: 'sent'
        });

      if (insertError) {
        console.error('Error storing email message:', insertError);
        // Don't fail the entire request if database insert fails
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully via Mailgun',
        messageId: mailgunResult.id,
        from: fromEmail,
        domain: mailgunDomain,
        customDomainName: companySettings?.custom_domain_name || null,
        usedSandbox: useSandbox
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error('Error in send-email function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to send email',
        details: error.stack || 'No stack trace available'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});
