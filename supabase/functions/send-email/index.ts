
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

    const { 
      to, 
      subject, 
      html, 
      text, 
      from, 
      templateData = {}, 
      companyId,
      conversationId 
    }: SendEmailRequest = await req.json();

    console.log('Sending email request:', { to, subject, from });

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
    const mailgunDomain = 'fixlyfy.app'; // Use the main verified domain
    
    // Generate dynamic FROM address based on company's custom domain name
    if (companySettings && companySettings.custom_domain_name) {
      const fromName = companySettings.email_from_name || companySettings.company_name || 'Support Team';
      const customDomainName = companySettings.custom_domain_name;
      fromEmail = `${fromName} <${customDomainName}@fixlyfy.app>`;
      console.log('Using custom domain name:', customDomainName);
    } else {
      // Fallback to default support email
      const fromName = companySettings?.email_from_name || companySettings?.company_name || 'Support Team';
      fromEmail = `${fromName} <support@fixlyfy.app>`;
      console.log('Using default support domain');
    }

    const mailgunApiKey = Deno.env.get('MAILGUN_API_KEY');
    if (!mailgunApiKey) {
      console.error('Mailgun API key not found');
      throw new Error('Mailgun API key not configured');
    }

    console.log(`Sending email via Mailgun domain: ${mailgunDomain}`);
    console.log(`From: ${fromEmail}`);
    console.log(`To: ${to}`);

    // Send email via Mailgun using the main domain
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
    console.log('Mailgun URL:', mailgunUrl);

    const mailgunResponse = await fetch(mailgunUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`api:${mailgunApiKey}`)}`
      },
      body: formData
    });

    const responseText = await mailgunResponse.text();
    console.log('Mailgun response status:', mailgunResponse.status);
    console.log('Mailgun response:', responseText);

    if (!mailgunResponse.ok) {
      console.error("Mailgun error response:", responseText);
      throw new Error(`Mailgun API error: ${mailgunResponse.status} - ${responseText}`);
    }

    let mailgunResult;
    try {
      mailgunResult = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Error parsing Mailgun response:', parseError);
      throw new Error('Invalid response from Mailgun API');
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
        customDomainName: companySettings?.custom_domain_name || null
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
        error: error.message || 'Failed to send email' 
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
