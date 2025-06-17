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
      .estimate-card { padding: 20px 15px; }
      .portal-button { padding: 12px 24px; font-size: 14px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      ${companyLogo ? `<img src="${companyLogo}" alt="${companyName}" class="logo">` : ''}
      <h1 class="header-text">Your Estimate is Ready</h1>
    </div>
    
    <div class="content">
      <p class="greeting">Hi ${clientName || 'valued customer'},</p>
      
      <p>We're pleased to present your estimate. Please review the details below and let us know if you have any questions.</p>
      
      <div class="estimate-card">
        <div class="estimate-title">Estimate Details</div>
        <div class="estimate-number">Estimate #${estimateNumber}</div>
        <div class="estimate-total">$${total.toFixed(2)}</div>
        
        ${portalLink ? `
          <a href="${portalLink}" class="portal-button">View Your Estimate</a>
          <div style="margin-top: 15px; color: #6b7280; font-size: 14px;">
            ✓ Secure client portal access<br>
            ✓ View all your documents<br>
            ✓ Download PDF when ready
          </div>
        ` : `
          <div style="color: #6b7280; font-size: 14px;">
            Your estimate is being prepared and will be available soon.
          </div>
        `}
      </div>
      
      <p>If you're ready to proceed, please contact us at your earliest convenience. We look forward to working with you!</p>
      
      <p>Best regards,<br>
      <strong>${companyName}</strong></p>
    </div>
    
    <div class="footer">
      <div class="company-info">
        <strong>${companyName}</strong><br>
        Professional service you can trust
      </div>
      <div class="contact-info">
        ${companyPhone ? `<div>📞 <a href="tel:${companyPhone}">${companyPhone}</a></div>` : ''}
        ${companyEmail ? `<div>✉️ <a href="mailto:${companyEmail}">${companyEmail}</a></div>` : ''}
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

    console.log('✅ User authenticated:', userData.user.id);

    const requestBody = await req.json()
    console.log('📥 Request body:', requestBody);
    
    const { estimateId, recipientEmail, customMessage } = requestBody;

    if (!estimateId || !recipientEmail) {
      throw new Error('Missing required fields: estimateId and recipientEmail');
    }

    console.log('📋 Processing estimate email:', { estimateId, recipientEmail });

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
      console.error('❌ Estimate lookup error:', estimateError);
      throw new Error('Estimate not found');
    }

    console.log('📄 Found estimate:', estimate.estimate_number);
    
    const job = estimate.jobs;
    const client = job?.clients;

    // Verify we have client data
    if (!client?.id) {
      console.error('❌ No client data found for estimate:', estimateId);
      throw new Error('Client information not found for this estimate');
    }

    console.log('👤 Client found:', client.name, client.email);

    const { data: companySettings, error: settingsError } = await supabaseAdmin
      .from('company_settings')
      .select('*')
      .eq('user_id', userData.user.id)
      .maybeSingle();

    if (settingsError) {
      console.error('⚠️ Error fetching company settings:', settingsError);
    }

    console.log('🏢 Company settings loaded:', !!companySettings);

    // Get active Telnyx phone number for display in email (not for sending)
    const { data: telnyxNumbers, error: telnyxError } = await supabaseAdmin
      .from('telnyx_phone_numbers')
      .select('phone_number')
      .eq('status', 'active')
      .limit(1);

    const activePhone = telnyxNumbers?.[0]?.phone_number || companySettings?.company_phone;

    // Generate simple portal link using client ID directly
    const portalLink = `https://hub.fixlify.app/portal/${client.id}`;
    console.log('✅ Portal link generated:', portalLink);

    const companyName = companySettings?.company_name?.trim() || 'Fixlify Services';
    const companyLogo = companySettings?.company_logo_url;
    const companyPhone = activePhone; // Use active Telnyx number for display
    const companyEmail = companySettings?.company_email;

    let subject, emailBody;
    
    if (customMessage) {
      subject = `Estimate ${estimate.estimate_number} from ${companyName}`;
      // Include portal link in custom message
      emailBody = `${customMessage}\n\nView your estimate online: ${portalLink}`;
    } else {
      subject = `Your Estimate ${estimate.estimate_number} is Ready`;
      emailBody = createEstimateEmailTemplate({
        companyName,
        companyLogo,
        companyPhone,
        companyEmail,
        clientName: client?.name,
        estimateNumber: estimate.estimate_number,
        total: estimate.total || 0,
        portalLink
      });
    }

    const fromEmail = `${companyName} <${companyName.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 30)}@fixlify.app>`;

    const mailgunApiKey = Deno.env.get('MAILGUN_API_KEY');
    if (!mailgunApiKey) {
      console.error('❌ Mailgun API key not found');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Email service not configured. Please contact administrator.' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    console.log('📨 Sending email via Mailgun');
    console.log('📧 FROM:', fromEmail);
    console.log('📧 TO:', recipientEmail);
    console.log('📧 SUBJECT:', subject);
    console.log('🔗 Portal link included:', portalLink);

    const formData = new FormData();
    formData.append('from', fromEmail);
    formData.append('to', recipientEmail);
    formData.append('subject', subject);
    if (customMessage) {
      formData.append('text', emailBody);
    } else {
      formData.append('html', emailBody);
      formData.append('text', `Hi ${client?.name || 'valued customer'},\n\nYour estimate ${estimate.estimate_number} is ready for review.\n\nTotal: $${(estimate.total || 0).toFixed(2)}\n\nView your estimate: ${portalLink}\n\nThank you for your business!\n\n${companyName}`);
    }
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
    console.log('📨 Mailgun response status:', mailgunResponse.status);

    if (!mailgunResponse.ok) {
      console.error("❌ Mailgun send error:", responseText);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Email service error: ${mailgunResponse.status} - ${responseText}` 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    let mailgunResult;
    try {
      mailgunResult = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Error parsing Mailgun response:', parseError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid response from email service' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    console.log('✅ Email sent successfully via Mailgun:', mailgunResult);

    // Log email communication
    try {
      await supabaseAdmin
        .from('estimate_communications')
        .insert({
          estimate_id: estimateId,
          communication_type: 'email',
          recipient: recipientEmail,
          subject: subject,
          content: customMessage || `Professional estimate email with portal access sent`,
          status: 'sent',
          estimate_number: estimate.estimate_number,
          client_name: client?.name,
          client_email: client?.email,
          client_phone: client?.phone,
          provider_message_id: mailgunResult.id
        });
      
      console.log('📊 Communication logged successfully');
    } catch (logError) {
      console.warn('⚠️ Failed to log communication:', logError);
    }

    console.log('🎉 Email process completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        messageId: mailgunResult.id,
        portalLinkIncluded: true
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('💥 Error sending email:', error);
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
