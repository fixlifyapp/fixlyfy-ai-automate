
import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('📧 Email Estimate request received');
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header provided');
    }

    // Use service role client for database access
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the current user
    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user) {
      throw new Error('Failed to authenticate user');
    }

    console.log('send-estimate - Authenticated user ID:', userData.user.id);

    const requestBody = await req.json()
    console.log('Request body:', requestBody);
    
    const { estimateId, recipientEmail, customMessage } = requestBody;

    if (!estimateId || !recipientEmail) {
      throw new Error('Missing required fields: estimateId and recipientEmail');
    }

    console.log('send-estimate - Request details:', {
      estimateId,
      sendMethod: 'email',
      recipientEmail
    });

    // Get estimate details with proper join
    const { data: estimate, error: estimateError } = await supabaseAdmin
      .from('estimates')
      .select(`
        *,
        jobs!inner(
          *,
          clients(*)
        )
      `)
      .eq('id', estimateId)
      .single();

    if (estimateError || !estimate) {
      console.error('Estimate lookup error:', estimateError);
      throw new Error('Estimate not found');
    }

    console.log('send-estimate - Found estimate:', estimate.estimate_number);
    
    const job = estimate.jobs;
    const client = job?.clients;

    // Get company settings for the user
    console.log('send-estimate - Fetching company settings for user_id:', userData.user.id);
    const { data: companySettings, error: settingsError } = await supabaseAdmin
      .from('company_settings')
      .select('*')
      .eq('user_id', userData.user.id)
      .maybeSingle();

    if (settingsError) {
      console.error('send-estimate - Error fetching company settings:', settingsError);
    }

    console.log('send-estimate - Company settings found:', !!companySettings);
    console.log('send-estimate - Company name from database:', companySettings?.company_name || 'NULL');

    // Generate client portal login token and create portal link
    let portalLink = '';
    if (client?.email) {
      try {
        const { data: tokenData, error: tokenError } = await supabaseAdmin.rpc('generate_client_login_token', {
          p_email: client.email
        });

        if (!tokenError && tokenData) {
          portalLink = `https://hub.fixlify.app/portal/login?token=${tokenData}`;
          console.log('Portal link generated');
        }
      } catch (error) {
        console.warn('Failed to generate portal login token:', error);
      }
    }

    // Create estimate link
    const estimateLink = `https://hub.fixlify.app/estimate/view/${estimate.id}`;

    // Prepare email content
    const subject = customMessage 
      ? `Estimate ${estimate.estimate_number} from ${job?.title || 'Your Service Provider'}`
      : `Your Estimate ${estimate.estimate_number} is Ready`;

    const companyName = companySettings?.company_name?.trim() || 'Fixlify Services';
    const fromEmail = `${companyName} <${generateFromEmail(companyName)}>`;

    const emailBody = customMessage || `
      Hi ${client?.name || 'valued customer'},
      
      Your estimate ${estimate.estimate_number} is ready for review.
      
      Total: $${estimate.total?.toFixed(2) || '0.00'}
      
      View your estimate: ${estimateLink}
      ${portalLink ? `\nClient Portal: ${portalLink}` : ''}
      
      Thank you for your business!
    `;

    // Get Mailgun API key
    const mailgunApiKey = Deno.env.get('MAILGUN_API_KEY');
    if (!mailgunApiKey) {
      console.error('send-estimate - Mailgun API key not found in environment variables');
      throw new Error('Mailgun API key not configured');
    }

    // Send email via Mailgun
    console.log('send-estimate - Sending email via Mailgun');
    console.log('send-estimate - FROM:', fromEmail);
    console.log('send-estimate - TO:', recipientEmail);
    console.log('send-estimate - SUBJECT:', subject);

    const formData = new FormData();
    formData.append('from', fromEmail);
    formData.append('to', recipientEmail);
    formData.append('subject', subject);
    formData.append('text', emailBody);
    formData.append('o:tracking', 'yes');
    formData.append('o:tracking-clicks', 'yes');
    formData.append('o:tracking-opens', 'yes');

    const mailgunUrl = 'https://api.mailgun.net/v3/fixlify.app/messages';
    const basicAuth = btoa(`api:${mailgunApiKey}`);

    const mailgunResponse = await fetch(mailgunUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`
      },
      body: formData
    });

    const responseText = await mailgunResponse.text();
    console.log('send-estimate - Mailgun response status:', mailgunResponse.status);
    console.log('send-estimate - Mailgun response body:', responseText);

    if (!mailgunResponse.ok) {
      console.error("send-estimate - Mailgun send error:", responseText);
      throw new Error(`Mailgun API error: ${mailgunResponse.status} - ${responseText}`);
    }

    let mailgunResult;
    try {
      mailgunResult = JSON.parse(responseText);
    } catch (parseError) {
      console.error('send-estimate - Error parsing Mailgun response:', parseError);
      throw new Error('Invalid response from Mailgun API');
    }

    console.log('send-estimate - Email sent successfully via Mailgun:', mailgunResult);

    // Log email communication
    try {
      await supabaseAdmin
        .from('estimate_communications')
        .insert({
          estimate_id: estimateId,
          communication_type: 'email',
          recipient: recipientEmail,
          subject: subject,
          content: emailBody,
          status: 'sent',
          estimate_number: estimate.estimate_number,
          client_name: client?.name,
          client_email: client?.email,
          client_phone: client?.phone,
          portal_link_included: !!portalLink,
          provider_message_id: mailgunResult.id
        });
    } catch (logError) {
      console.warn('Failed to log communication:', logError);
    }

    console.log('Email sent successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        messageId: mailgunResult.id,
        portalLinkIncluded: !!portalLink
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
