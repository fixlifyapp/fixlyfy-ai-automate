
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Email utility functions
const formatCompanyNameForEmail = (companyName: string): string => {
  if (!companyName || typeof companyName !== 'string') {
    return 'support';
  }

  return companyName
    .toLowerCase()
    .trim()
    .replace(/[\s\-&+.,()]+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 30)
    || 'support';
};

const generateFromEmail = (companyName: string): string => {
  const formattedName = formatCompanyNameForEmail(companyName);
  return `${formattedName}@fixlify.app`;
};

// UUID validation function
const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
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
    if (userError || !userData.user) {
      console.error('User authentication error:', userError);
      return new Response(JSON.stringify({ error: 'Authentication failed' }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 401,
      });
    }

    console.log('send-email - Authenticated user ID:', userData.user.id);

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

    console.log('send-email - Request details:', { to, subject, from, conversationId, useSandbox });

    // Get company settings for the AUTHENTICATED USER with explicit filtering
    const { data: companySettings, error: settingsError } = await supabaseClient
      .from('company_settings')
      .select('*')
      .eq('user_id', userData.user.id)
      .maybeSingle();

    if (settingsError) {
      console.error('send-email - Error fetching company settings:', settingsError);
    }

    console.log('send-email - Company settings found:', !!companySettings);
    console.log('send-email - Company name from database:', companySettings?.company_name || 'NULL');

    let fromEmail = from;
    let mailgunDomain = 'fixlify.app';
    
    // Use sandbox domain for testing if requested
    if (useSandbox) {
      mailgunDomain = 'sandboxXXXXXXXXXXXXXXXXXXXXXXXXXXXX.mailgun.org';
      console.log('send-email - Using Mailgun sandbox domain for testing');
    }
    
    // Auto-generate email from company name if not provided
    if (!fromEmail) {
      const companyName = companySettings?.company_name?.trim() || 'Fixlify Services';
      const fromEmailAddress = generateFromEmail(companyName);
      
      if (useSandbox) {
        fromEmail = `${companyName} <postmaster@${mailgunDomain}>`;
      } else {
        fromEmail = `${companyName} <${fromEmailAddress}>`;
      }
      
      console.log('send-email - Company name used for email generation:', companyName);
      console.log('send-email - Generated FROM email:', fromEmail);
      console.log('send-email - Generated email address:', fromEmailAddress);
    }

    const mailgunApiKey = Deno.env.get('MAILGUN_API_KEY');
    if (!mailgunApiKey) {
      console.error('send-email - Mailgun API key not found in environment variables');
      return new Response(JSON.stringify({ error: 'Mailgun API key not configured' }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 500,
      });
    }

    console.log('send-email - Final email configuration:');
    console.log('send-email - User ID:', userData.user.id);
    console.log('send-email - Company name from DB:', companySettings?.company_name);
    console.log('send-email - Domain:', mailgunDomain);
    console.log('send-email - FROM:', fromEmail);
    console.log('send-email - TO:', to);

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

    const mailgunResponse = await fetch(mailgunUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`
      },
      body: formData
    });

    const responseText = await mailgunResponse.text();
    console.log('send-email - Mailgun response status:', mailgunResponse.status);
    console.log('send-email - Mailgun response body:', responseText);

    if (!mailgunResponse.ok) {
      console.error("send-email - Mailgun send error:", responseText);
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
      console.error('send-email - Error parsing Mailgun response:', parseError);
      return new Response(JSON.stringify({ error: 'Invalid response from Mailgun API' }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 500,
      });
    }

    console.log('send-email - Email sent successfully via Mailgun:', mailgunResult);

    // Store email in database for tracking if conversation ID provided and valid
    if (conversationId && isValidUUID(conversationId)) {
      console.log('send-email - Storing email message with conversation ID:', conversationId);
      
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
        console.error('send-email - Error storing email message:', insertError);
      } else {
        console.log('send-email - Email message stored successfully');
      }
    } else {
      console.log('send-email - Skipping email storage - invalid or missing conversation ID:', conversationId);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully via Mailgun',
        messageId: mailgunResult.id,
        from: fromEmail,
        domain: mailgunDomain,
        companyName: companySettings?.company_name || null,
        usedSandbox: useSandbox,
        userId: userData.user.id
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error('send-email - Error in send-email function:', error);
    
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
