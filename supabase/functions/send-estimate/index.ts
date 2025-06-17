
import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const createEstimateEmailTemplate = (data: any) => {
  const {
    companyName,
    companyLogo,
    companyPhone,
    companyEmail,
    clientName,
    estimateNumber,
    total,
    portalLink
  } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Estimate is Ready</title>
  <style>
    body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center; }
    .logo { max-height: 60px; margin-bottom: 15px; }
    .header-text { color: #ffffff; font-size: 24px; font-weight: bold; margin: 0; }
    .content { padding: 40px 30px; }
    .greeting { font-size: 18px; color: #374151; margin-bottom: 20px; }
    .estimate-card { background-color: #f8fafc; border: 2px solid #e5e7eb; border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center; }
    .estimate-title { font-size: 20px; font-weight: bold; color: #1f2937; margin-bottom: 10px; }
    .estimate-number { font-size: 16px; color: #6b7280; margin-bottom: 15px; }
    .estimate-total { font-size: 28px; font-weight: bold; color: #059669; margin: 15px 0; }
    .portal-button { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 20px 0; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); transition: transform 0.2s; }
    .portal-button:hover { transform: translateY(-2px); }
    .footer { background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; }
    .company-info { color: #6b7280; font-size: 14px; line-height: 1.6; }
    .contact-info { margin-top: 15px; }
    .contact-info a { color: #4f46e5; text-decoration: none; }
    @media (max-width: 600px) {
      .content { padding: 20px 15px; }
      .estimate-card { padding: 15px; margin: 15px 0; }
      .portal-button { padding: 12px 20px; font-size: 14px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      ${companyLogo ? `<img src="${companyLogo}" alt="${companyName}" class="logo">` : ''}
      <h1 class="header-text">${companyName}</h1>
    </div>
    
    <div class="content">
      <div class="greeting">Hello ${clientName},</div>
      
      <p>Your estimate is ready for review! We've prepared a detailed quote for the services you requested.</p>
      
      <div class="estimate-card">
        <div class="estimate-title">Estimate Ready</div>
        <div class="estimate-number">Estimate #${estimateNumber}</div>
        <div class="estimate-total">$${total.toFixed(2)}</div>
        
        ${portalLink ? `
          <a href="${portalLink}" class="portal-button">
            View & Accept Estimate
          </a>
          <p style="margin-top: 15px; font-size: 14px; color: #6b7280;">
            Click the button above to view your estimate details and accept if you're ready to proceed.
          </p>
        ` : `
          <p style="margin-top: 15px; font-size: 14px; color: #6b7280;">
            Please contact us to review and accept this estimate.
          </p>
        `}
      </div>
      
      <p>If you have any questions about this estimate, please don't hesitate to reach out to us.</p>
      
      <p>Thank you for choosing ${companyName}!</p>
    </div>
    
    <div class="footer">
      <div class="company-info">
        <strong>${companyName}</strong><br>
        ${companyPhone ? `Phone: <a href="tel:${companyPhone}">${companyPhone}</a><br>` : ''}
        ${companyEmail ? `Email: <a href="mailto:${companyEmail}">${companyEmail}</a><br>` : ''}
      </div>
      <div class="contact-info">
        <p style="margin: 10px 0; font-size: 12px; color: #9ca3af;">
          This email was sent regarding your estimate request. Please keep this email for your records.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
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

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user) {
      throw new Error('Failed to authenticate user');
    }

    const requestBody = await req.json()
    console.log('Request body:', requestBody);
    
    const { estimateId, recipientEmail, customMessage } = requestBody;

    if (!estimateId || !recipientEmail) {
      throw new Error('Missing required fields: estimateId and recipientEmail');
    }

    console.log('Processing email for estimate:', estimateId, 'to email:', recipientEmail);

    // Get estimate details
    const { data: estimate, error: estimateError } = await supabaseAdmin
      .from('estimates')
      .select('*')
      .eq('id', estimateId)
      .single();

    if (estimateError || !estimate) {
      throw new Error('Estimate not found');
    }

    console.log('Estimate found:', estimate.estimate_number);
    
    // Get job and client details
    const { data: job, error: jobError } = await supabaseAdmin
      .from('jobs')
      .select('*')
      .eq('id', estimate.job_id)
      .single();

    if (jobError) {
      console.warn('Could not fetch job details:', jobError);
    }

    let client = null;
    if (job?.client_id) {
      const { data: clientData, error: clientError } = await supabaseAdmin
        .from('clients')
        .select('*')
        .eq('id', job.client_id)
        .single();
      
      if (!clientError) {
        client = clientData;
      }
    }

    // Get company settings
    const { data: companySettings } = await supabaseAdmin
      .from('company_settings')
      .select('*')
      .eq('user_id', userData.user.id)
      .maybeSingle();

    const companyName = companySettings?.company_name || 'Fixlify Services';
    const companyEmail = companySettings?.email || userData.user.email || '';
    const companyPhone = companySettings?.phone || '';

    // Generate secure document access token using correct portal domain
    let portalLink = '';
    if (client?.email) {
      try {
        console.log('Generating secure access token for client email:', client.email);
        
        const { data: accessToken, error: tokenError } = await supabaseAdmin.rpc('generate_secure_document_access', {
          p_document_type: 'estimate',
          p_document_id: estimate.id,
          p_client_email: client.email,
          p_hours_valid: 72
        });

        if (!tokenError && accessToken) {
          portalLink = `https://portal.fixlify.app/view/${accessToken}`;
          console.log('Secure access link generated:', portalLink.substring(0, 60) + '...');
        } else {
          console.error('Failed to generate secure access token:', tokenError);
        }
      } catch (error) {
        console.warn('Failed to generate secure access token:', error);
      }
    }

    // Create email HTML
    const emailHtml = createEstimateEmailTemplate({
      companyName,
      companyEmail,
      companyPhone,
      clientName: client?.name || 'Valued Customer',
      estimateNumber: estimate.estimate_number,
      total: estimate.total || 0,
      portalLink
    });

    // Get Mailgun configuration
    const mailgunApiKey = Deno.env.get('MAILGUN_API_KEY');
    if (!mailgunApiKey) {
      throw new Error('Mailgun API key not configured');
    }

    const mailgunDomain = 'fixlify.app';
    const fromEmail = `${companyName} <estimates@${mailgunDomain}>`;

    // Send email via Mailgun
    const formData = new FormData();
    formData.append('from', fromEmail);
    formData.append('to', recipientEmail);
    formData.append('subject', `Your Estimate #${estimate.estimate_number} is Ready - ${companyName}`);
    formData.append('html', emailHtml);
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

    const mailgunResult = await mailgunResponse.json();
    console.log('Mailgun response:', mailgunResult);

    if (!mailgunResponse.ok) {
      console.error('Mailgun send error:', mailgunResult);
      throw new Error(`Failed to send email via Mailgun: ${mailgunResult.message || 'Unknown error'}`);
    }

    // Log email communication
    try {
      await supabaseAdmin
        .from('estimate_communications')
        .insert({
          estimate_id: estimateId,
          communication_type: 'email',
          recipient: recipientEmail,
          subject: `Your Estimate #${estimate.estimate_number} is Ready - ${companyName}`,
          content: emailHtml,
          status: 'sent',
          provider_message_id: mailgunResult.id,
          estimate_number: estimate.estimate_number,
          client_name: client?.name,
          client_email: client?.email,
          client_phone: client?.phone,
          portal_link_included: !!portalLink
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
