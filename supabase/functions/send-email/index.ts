
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
    if (userError) throw userError;

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

    // Get company settings to determine email configuration
    const { data: companySettings } = await supabaseClient
      .from('company_settings')
      .select('*')
      .eq('user_id', userData.user.id)
      .single();

    let fromEmail = from;
    let mailgunDomain = 'mg.fixlyfy.com'; // Default domain
    
    if (companySettings && companySettings.domain_verification_status === 'verified') {
      mailgunDomain = companySettings.mailgun_domain;
      fromEmail = companySettings.email_from_address || `noreply@${mailgunDomain}`;
    } else {
      fromEmail = from || "noreply@mg.fixlyfy.com";
    }

    const mailgunApiKey = Deno.env.get('MAILGUN_API_KEY');
    if (!mailgunApiKey) {
      throw new Error('Mailgun API key not configured');
    }

    console.log(`Sending email via Mailgun domain: ${mailgunDomain}`);

    // Send email via Mailgun
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

    const mailgunResponse = await fetch(`https://api.mailgun.net/v3/${mailgunDomain}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`api:${mailgunApiKey}`)}`
      },
      body: formData
    });

    if (!mailgunResponse.ok) {
      const errorData = await mailgunResponse.text();
      console.error("Mailgun error response:", errorData);
      throw new Error(`Mailgun API error: ${mailgunResponse.status} - ${errorData}`);
    }

    const mailgunResult = await mailgunResponse.json();
    console.log('Email sent successfully via Mailgun:', mailgunResult);

    // Store email in database for tracking
    if (conversationId) {
      await supabaseClient
        .from('email_messages')
        .insert({
          conversation_id: conversationId,
          mailgun_message_id: mailgunResult.id,
          direction: 'outbound',
          sender_email: fromEmail,
          recipient_email: to,
          subject,
          body_html: html,
          body_text: text,
          delivery_status: 'sent'
        });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully via Mailgun',
        messageId: mailgunResult.id,
        from: fromEmail,
        domain: mailgunDomain
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
