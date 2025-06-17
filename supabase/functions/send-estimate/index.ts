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
    portalLink,
    companyAddress,
    companyWebsite
  } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Estimate is Ready</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      margin: 0; 
      padding: 0; 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }
    .email-container { 
      max-width: 600px; 
      margin: 0 auto; 
      background-color: #ffffff; 
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    }
    .header { 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
      padding: 40px 30px; 
      text-align: center; 
      position: relative;
      overflow: hidden;
    }
    .header::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
      animation: shimmer 3s ease-in-out infinite;
    }
    @keyframes shimmer {
      0%, 100% { transform: translateX(-100%) translateY(-100%) rotate(0deg); }
      50% { transform: translateX(0%) translateY(0%) rotate(180deg); }
    }
    .logo { 
      max-height: 80px; 
      margin-bottom: 20px; 
      border-radius: 12px;
      background: rgba(255,255,255,0.2);
      padding: 15px;
      backdrop-filter: blur(10px);
    }
    .header-content {
      position: relative;
      z-index: 2;
    }
    .header-text { 
      color: #ffffff; 
      font-size: 28px; 
      font-weight: 700; 
      margin: 0; 
      text-shadow: 0 2px 4px rgba(0,0,0,0.2);
      letter-spacing: -0.5px;
    }
    .header-subtitle {
      color: rgba(255,255,255,0.9);
      font-size: 16px;
      margin-top: 8px;
      font-weight: 400;
    }
    .content { 
      padding: 50px 40px; 
      background: #ffffff;
    }
    .greeting { 
      font-size: 20px; 
      color: #1a1a1a; 
      margin-bottom: 24px; 
      font-weight: 600;
    }
    .intro-text {
      color: #4a5568;
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 32px;
    }
    .estimate-card { 
      background: linear-gradient(135deg, #f8faff 0%, #f1f5ff 100%);
      border: 2px solid #e2e8f0; 
      border-radius: 16px; 
      padding: 32px; 
      margin: 32px 0; 
      text-align: center; 
      position: relative;
      overflow: hidden;
    }
    .estimate-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    }
    .estimate-badge {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 8px 20px;
      border-radius: 50px;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 16px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .estimate-title { 
      font-size: 24px; 
      font-weight: 700; 
      color: #1a1a1a; 
      margin-bottom: 8px; 
    }
    .estimate-number { 
      font-size: 16px; 
      color: #718096; 
      margin-bottom: 20px; 
      font-weight: 500;
    }
    .estimate-total { 
      font-size: 36px; 
      font-weight: 800; 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 20px 0; 
      text-shadow: none;
    }
    .portal-button { 
      display: inline-block; 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
      color: #ffffff; 
      text-decoration: none; 
      padding: 16px 32px; 
      border-radius: 12px; 
      font-weight: 600; 
      font-size: 16px; 
      margin: 24px 0; 
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3); 
      transition: all 0.3s ease;
      border: none;
      cursor: pointer;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .portal-button:hover { 
      transform: translateY(-2px); 
      box-shadow: 0 12px 35px rgba(102, 126, 234, 0.4); 
    }
    .features-list {
      margin-top: 20px;
      text-align: left;
      display: inline-block;
    }
    .feature-item {
      display: flex;
      align-items: center;
      margin: 8px 0;
      color: #4a5568;
      font-size: 14px;
    }
    .feature-icon {
      width: 20px;
      height: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
      color: white;
      font-size: 12px;
      font-weight: bold;
    }
    .company-info-section {
      background: linear-gradient(135deg, #f8faff 0%, #f1f5ff 100%);
      border-radius: 12px;
      padding: 24px;
      margin: 32px 0;
      border-left: 4px solid #667eea;
    }
    .company-info-title {
      font-size: 18px;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 16px;
    }
    .company-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }
    .company-detail {
      display: flex;
      align-items: center;
      color: #4a5568;
      font-size: 14px;
    }
    .company-detail-icon {
      width: 16px;
      height: 16px;
      margin-right: 8px;
      opacity: 0.7;
    }
    .footer { 
      background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%); 
      padding: 40px 30px; 
      text-align: center; 
      color: white;
    }
    .footer-content {
      max-width: 400px;
      margin: 0 auto;
    }
    .footer-logo {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 16px;
      color: white;
    }
    .footer-text {
      color: rgba(255,255,255,0.8);
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: 20px;
    }
    .social-links {
      display: flex;
      justify-content: center;
      gap: 16px;
      margin-top: 20px;
    }
    .social-link {
      width: 40px;
      height: 40px;
      background: rgba(255,255,255,0.1);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(255,255,255,0.8);
      text-decoration: none;
      transition: all 0.3s ease;
    }
    .social-link:hover {
      background: rgba(255,255,255,0.2);
      transform: translateY(-2px);
    }
    @media (max-width: 600px) {
      body { padding: 10px; }
      .content { padding: 30px 20px; }
      .estimate-card { padding: 24px 16px; margin: 20px 0; }
      .portal-button { padding: 14px 24px; font-size: 14px; }
      .header { padding: 30px 20px; }
      .estimate-total { font-size: 28px; }
      .company-details { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="header-content">
        ${companyLogo ? `<img src="${companyLogo}" alt="${companyName}" class="logo">` : ''}
        <h1 class="header-text">${companyName}</h1>
        <p class="header-subtitle">Your Trusted Service Provider</p>
      </div>
    </div>
    
    <div class="content">
      <div class="greeting">Hello ${clientName},</div>
      
      <p class="intro-text">Great news! We've prepared a detailed estimate for your service request. Our team has carefully reviewed your needs and put together a comprehensive quote.</p>
      
      <div class="estimate-card">
        <div class="estimate-badge">Estimate Ready</div>
        <div class="estimate-title">Professional Service Estimate</div>
        <div class="estimate-number">Estimate #${estimateNumber}</div>
        <div class="estimate-total">$${total.toFixed(2)}</div>
        
        ${portalLink ? `
          <a href="${portalLink}" class="portal-button">
            View & Accept Estimate
          </a>
          <div class="features-list">
            <div class="feature-item">
              <span class="feature-icon">✓</span>
              <span>Secure online portal access</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">📱</span>
              <span>Mobile-friendly interface</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">📋</span>
              <span>Detailed service breakdown</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">💳</span>
              <span>Easy approval process</span>
            </div>
          </div>
        ` : `
          <p style="margin-top: 20px; font-size: 16px; color: #718096;">
            Please contact us to review and discuss this estimate.
          </p>
        `}
      </div>
      
      <div class="company-info-section">
        <div class="company-info-title">About ${companyName}</div>
        <div class="company-details">
          ${companyPhone ? `
            <div class="company-detail">
              <span class="company-detail-icon">📞</span>
              <a href="tel:${companyPhone}" style="color: #667eea; text-decoration: none;">${companyPhone}</a>
            </div>
          ` : ''}
          ${companyEmail ? `
            <div class="company-detail">
              <span class="company-detail-icon">✉️</span>
              <a href="mailto:${companyEmail}" style="color: #667eea; text-decoration: none;">${companyEmail}</a>
            </div>
          ` : ''}
          ${companyWebsite ? `
            <div class="company-detail">
              <span class="company-detail-icon">🌐</span>
              <a href="${companyWebsite}" style="color: #667eea; text-decoration: none;">${companyWebsite}</a>
            </div>
          ` : ''}
        </div>
      </div>
      
      <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-top: 32px;">
        If you have any questions about this estimate or would like to discuss any details, please don't hesitate to reach out. We're here to ensure you have all the information you need to make an informed decision.
      </p>
      
      <p style="color: #1a1a1a; font-size: 16px; font-weight: 600; margin-top: 24px;">
        Thank you for choosing ${companyName}!
      </p>
    </div>
    
    <div class="footer">
      <div class="footer-content">
        <div class="footer-logo">${companyName}</div>
        <div class="footer-text">
          Professional service you can trust. We're committed to delivering exceptional results and outstanding customer satisfaction.
        </div>
        ${companyPhone || companyEmail ? `
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.2);">
            ${companyPhone ? `<div style="margin: 8px 0;">📞 ${companyPhone}</div>` : ''}
            ${companyEmail ? `<div style="margin: 8px 0;">✉️ ${companyEmail}</div>` : ''}
          </div>
        ` : ''}
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
    const companyEmail = companySettings?.company_email || userData.user.email || '';
    const companyPhone = companySettings?.company_phone || '';
    const companyLogo = companySettings?.company_logo_url;
    const companyWebsite = companySettings?.company_website;

    // Generate portal link using client ID directly (no authentication needed)
    let portalLink = '';
    if (client?.id) {
      portalLink = `https://portal.fixlify.app/portal/${client.id}`;
      console.log('Direct portal link generated:', portalLink);
    }

    // Create email HTML
    const emailHtml = createEstimateEmailTemplate({
      companyName,
      companyEmail,
      companyPhone,
      companyLogo,
      companyWebsite,
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
