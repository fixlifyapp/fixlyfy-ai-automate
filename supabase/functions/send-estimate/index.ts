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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('send-estimate - No authorization header provided');
      throw new Error('No authorization header provided');
    }

    console.log('send-estimate - Authorization header present:', !!authHeader);

    // Use service role client for database access to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the current user using the authorization header
    const token = authHeader.replace('Bearer ', '');
    console.log('send-estimate - Extracted token:', token.substring(0, 20) + '...');

    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user) {
      console.error('send-estimate - Error getting user:', userError);
      throw new Error('Failed to authenticate user');
    }

    console.log('send-estimate - Authenticated user ID:', userData.user.id);

    const {
      estimateId,
      sendMethod,
      recipientEmail,
      recipientPhone,
      subject,
      message
    } = await req.json()

    console.log('send-estimate - Request details:', { estimateId, sendMethod, recipientEmail, recipientPhone })

    if (!estimateId) {
      throw new Error('Estimate ID is required')
    }

    // Get estimate details using admin client to bypass RLS
    const { data: estimate, error: estimateError } = await supabaseAdmin
      .from('estimates')
      .select(`
        *,
        jobs:job_id (
          *,
          clients:client_id (*)
        )
      `)
      .eq('id', estimateId)
      .single()

    if (estimateError || !estimate) {
      console.error('send-estimate - Estimate lookup error:', estimateError)
      throw new Error(`Estimate not found: ${estimateError?.message || 'Unknown error'}`)
    }

    console.log('send-estimate - Found estimate:', estimate.estimate_number)

    // Get company settings for the AUTHENTICATED USER with explicit filtering
    const { data: companySettings, error: settingsError } = await supabaseAdmin
      .from('company_settings')
      .select('*')
      .eq('user_id', userData.user.id)
      .maybeSingle()

    if (settingsError) {
      console.error('send-estimate - Error fetching company settings:', settingsError)
    }

    console.log('send-estimate - Fetching company settings for user_id:', userData.user.id)
    console.log('send-estimate - Company settings found:', !!companySettings)
    console.log('send-estimate - Company name from database:', companySettings?.company_name || 'NULL')

    // Validate we have the correct user's data
    if (companySettings && companySettings.user_id !== userData.user.id) {
      console.error('send-estimate - CRITICAL: Company settings user_id mismatch!')
      console.error('send-estimate - Expected user_id:', userData.user.id)
      console.error('send-estimate - Got user_id:', companySettings.user_id)
    }

    const client = estimate.jobs?.clients
    const job = estimate.jobs

    if (sendMethod === 'email') {
      // Validate email
      if (!recipientEmail || !recipientEmail.includes('@')) {
        throw new Error('Valid email address is required')
      }

      // Create or update client portal user and generate login token
      let portalLoginToken = null
      let portalLoginLink = ''
      
      if (client?.email) {
        try {
          console.log('send-estimate - Generating portal login token for:', client.email)
          
          const { data: tokenData, error: tokenError } = await supabaseAdmin.rpc('generate_client_login_token', {
            p_email: client.email
          })
          
          if (!tokenError && tokenData) {
            portalLoginToken = tokenData
            console.log('send-estimate - Successfully generated client portal login token')
            
            const currentDomain = req.headers.get('origin') || 'https://your-app.vercel.app'
            portalLoginLink = `${currentDomain}/portal/login?token=${portalLoginToken}`
            console.log('send-estimate - Portal login link created:', portalLoginLink)
          } else {
            console.error('send-estimate - Failed to generate portal token:', tokenError)
          }
        } catch (error) {
          console.error('send-estimate - Error generating portal token:', error)
        }
      } else {
        console.log('send-estimate - No client email available for portal token generation')
      }

      // Check Mailgun configuration
      const mailgunApiKey = Deno.env.get('MAILGUN_API_KEY')
      if (!mailgunApiKey) {
        throw new Error('Mailgun API key not configured. Please configure MAILGUN_API_KEY in Supabase secrets.')
      }

      const mailgunDomain = 'fixlify.app'
      
      // Get company name from the AUTHENTICATED USER's settings
      const companyName = companySettings?.company_name?.trim() || 'Fixlify Services'
      
      // Auto-generate email from company name
      const fromEmail = generateFromEmail(companyName)
      
      // Generate correct subject line format: "Estimate #{number} from {company name}"
      const emailSubject = subject || `Estimate #${estimate.estimate_number} from ${companyName}`

      console.log('send-estimate - Final email configuration:')
      console.log('send-estimate - User ID:', userData.user.id)
      console.log('send-estimate - Company name used:', companyName)
      console.log('send-estimate - Mailgun domain:', mailgunDomain)
      console.log('send-estimate - From email:', fromEmail)
      console.log('send-estimate - Subject:', emailSubject)

      // Create branded email template with modern design
      let emailHtml = ''
      
      if (client?.email && portalLoginToken && portalLoginLink) {
        emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Your Estimate is Ready</title>
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
                line-height: 1.6; 
                color: #333; 
                margin: 0; 
                padding: 0; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
              }
              .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background-color: white; 
                border-radius: 12px; 
                box-shadow: 0 20px 40px rgba(0,0,0,0.1); 
                overflow: hidden;
                margin-top: 40px;
                margin-bottom: 40px;
              }
              .header { 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; 
                padding: 40px 30px; 
                text-align: center; 
              }
              .company-name { 
                font-size: 32px; 
                font-weight: bold; 
                margin-bottom: 8px; 
                letter-spacing: -0.5px;
              }
              .subtitle { 
                font-size: 16px; 
                opacity: 0.9; 
                margin: 0;
              }
              .content { 
                padding: 40px 30px; 
              }
              .title { 
                color: #333; 
                font-size: 24px; 
                font-weight: 600; 
                margin-bottom: 20px; 
                text-align: center;
              }
              .message { 
                font-size: 16px; 
                margin-bottom: 30px; 
                color: #666; 
                line-height: 1.7;
              }
              .estimate-details {
                background: #f8fafc;
                border-radius: 8px;
                padding: 24px;
                margin: 30px 0;
                border-left: 4px solid #667eea;
              }
              .estimate-number {
                font-size: 18px;
                font-weight: 600;
                color: #333;
                margin-bottom: 8px;
              }
              .estimate-amount {
                font-size: 24px;
                font-weight: bold;
                color: #667eea;
                margin-bottom: 8px;
              }
              .job-title {
                color: #666;
                font-size: 14px;
              }
              .portal-button { 
                display: inline-block; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; 
                padding: 16px 32px; 
                text-decoration: none; 
                border-radius: 8px; 
                font-size: 16px; 
                font-weight: 600; 
                margin: 20px 0; 
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
                transition: all 0.3s ease;
                border: none;
                cursor: pointer;
              }
              .portal-button:hover { 
                box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
                transform: translateY(-1px);
              }
              .button-container {
                text-align: center;
                margin: 30px 0;
              }
              .footer { 
                margin-top: 40px; 
                padding-top: 30px; 
                border-top: 1px solid #e5e7eb; 
                color: #666; 
                font-size: 14px; 
                text-align: center;
              }
              .contact-info {
                margin: 10px 0;
              }
              .security-note { 
                font-size: 12px; 
                color: #999; 
                margin-top: 20px; 
                text-align: center;
                padding: 16px;
                background: #fef7e7;
                border-radius: 6px;
                border: 1px solid #f4d03f;
              }
              .brand-colors {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
              }
              @media (max-width: 600px) {
                .container { margin: 20px; max-width: none; }
                .header { padding: 30px 20px; }
                .content { padding: 30px 20px; }
                .company-name { font-size: 28px; }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="company-name">${companyName}</div>
                <div class="subtitle">Professional Service Solutions</div>
              </div>
              
              <div class="content">
                <div class="title">Hello ${client?.name || 'Valued Customer'}, Your Estimate is Ready! 📋</div>
                
                <div class="message">
                  <p>We've prepared your estimate and it's ready for your review. You can view all the details securely through our client portal.</p>
                </div>
                
                <div class="estimate-details">
                  <div class="estimate-number">Estimate #${estimate.estimate_number}</div>
                  <div class="estimate-amount">$${estimate.total?.toFixed(2) || '0.00'}</div>
                  <div class="job-title">${job?.title || 'Service Request'}</div>
                </div>
                
                <div class="button-container">
                  <a href="${portalLoginLink}" class="portal-button">🔐 View Your Estimate</a>
                </div>
                
                <div class="security-note">
                  🔒 This secure link will expire in 30 minutes for your protection.
                </div>
                
                <div class="footer">
                  <div style="font-weight: 600; margin-bottom: 16px;">Thank you for choosing ${companyName}!</div>
                  ${companySettings?.company_phone ? `<div class="contact-info">📞 <strong>Phone:</strong> ${companySettings.company_phone}</div>` : ''}
                  ${companySettings?.company_email ? `<div class="contact-info">✉️ <strong>Email:</strong> ${companySettings.company_email}</div>` : ''}
                  ${companySettings?.company_website ? `<div class="contact-info">🌐 <strong>Website:</strong> ${companySettings.company_website}</div>` : ''}
                  <div style="margin-top: 20px; color: #999; font-size: 12px;">
                    Powered by Fixlify - Smart Solutions for Field Service Businesses
                  </div>
                </div>
              </div>
            </div>
          </body>
          </html>
        `
      } else {
        const currentDomain = req.headers.get('origin') || 'https://your-app.vercel.app'
        emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Your Estimate is Ready</title>
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
                line-height: 1.6; 
                color: #333; 
                margin: 0; 
                padding: 0; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
              }
              .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background-color: white; 
                border-radius: 12px; 
                box-shadow: 0 20px 40px rgba(0,0,0,0.1); 
                overflow: hidden;
                margin-top: 40px;
                margin-bottom: 40px;
              }
              .header { 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; 
                padding: 40px 30px; 
                text-align: center; 
              }
              .company-name { 
                font-size: 32px; 
                font-weight: bold; 
                margin-bottom: 8px; 
                letter-spacing: -0.5px;
              }
              .subtitle { 
                font-size: 16px; 
                opacity: 0.9; 
                margin: 0;
              }
              .content { 
                padding: 40px 30px; 
              }
              .title { 
                color: #333; 
                font-size: 24px; 
                font-weight: 600; 
                margin-bottom: 20px; 
                text-align: center;
              }
              .message { 
                font-size: 16px; 
                margin-bottom: 30px; 
                color: #666; 
                line-height: 1.7;
              }
              .estimate-details {
                background: #f8fafc;
                border-radius: 8px;
                padding: 24px;
                margin: 30px 0;
                border-left: 4px solid #667eea;
              }
              .estimate-number {
                font-size: 18px;
                font-weight: 600;
                color: #333;
                margin-bottom: 8px;
              }
              .estimate-amount {
                font-size: 24px;
                font-weight: bold;
                color: #667eea;
                margin-bottom: 8px;
              }
              .job-title {
                color: #666;
                font-size: 14px;
              }
              .portal-button { 
                display: inline-block; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; 
                padding: 16px 32px; 
                text-decoration: none; 
                border-radius: 8px; 
                font-size: 16px; 
                font-weight: 600; 
                margin: 20px 0; 
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
              }
              .button-container {
                text-align: center;
                margin: 30px 0;
              }
              .footer { 
                margin-top: 40px; 
                padding-top: 30px; 
                border-top: 1px solid #e5e7eb; 
                color: #666; 
                font-size: 14px; 
                text-align: center;
              }
              .contact-info {
                margin: 10px 0;
              }
              @media (max-width: 600px) {
                .container { margin: 20px; max-width: none; }
                .header { padding: 30px 20px; }
                .content { padding: 30px 20px; }
                .company-name { font-size: 28px; }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="company-name">${companyName}</div>
                <div class="subtitle">Professional Service Solutions</div>
              </div>
              
              <div class="content">
                <div class="title">Hello ${client?.name || 'Valued Customer'}, Your Estimate is Ready! 📋</div>
                
                <div class="message">
                  <p>We've prepared your estimate and it's ready for your review.</p>
                </div>
                
                <div class="estimate-details">
                  <div class="estimate-number">Estimate #${estimate.estimate_number}</div>
                  <div class="estimate-amount">$${estimate.total?.toFixed(2) || '0.00'}</div>
                  <div class="job-title">${job?.title || 'Service Request'}</div>
                </div>
                
                <div class="button-container">
                  <a href="${currentDomain}/portal/login" class="portal-button">🔐 Access Client Portal</a>
                </div>
                
                <div class="footer">
                  <div style="font-weight: 600; margin-bottom: 16px;">Thank you for choosing ${companyName}!</div>
                  ${companySettings?.company_phone ? `<div class="contact-info">📞 <strong>Phone:</strong> ${companySettings.company_phone}</div>` : ''}
                  ${companySettings?.company_email ? `<div class="contact-info">✉️ <strong>Email:</strong> ${companySettings.company_email}</div>` : ''}
                  ${companySettings?.company_website ? `<div class="contact-info">🌐 <strong>Website:</strong> ${companySettings.company_website}</div>` : ''}
                  <div style="margin-top: 20px; color: #999; font-size: 12px;">
                    Powered by Fixlify - Smart Solutions for Field Service Businesses
                  </div>
                </div>
              </div>
            </div>
          </body>
          </html>
        `
      }

      // Use Mailgun API
      const mailgunUrl = `https://api.mailgun.net/v3/${mailgunDomain}/messages`
      console.log('send-estimate - Sending email via Mailgun URL:', mailgunUrl)
      console.log('send-estimate - From:', `${companyName} <${fromEmail}>`)
      console.log('send-estimate - To:', recipientEmail)

      const response = await fetch(mailgunUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`api:${mailgunApiKey}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          from: `${companyName} <${fromEmail}>`,
          to: recipientEmail,
          subject: emailSubject,
          html: emailHtml
        })
      })

      console.log('send-estimate - Email send response status:', response.status)
      const result = await response.text()
      console.log('send-estimate - Email send response body:', result)
      
      if (!response.ok) {
        console.error('send-estimate - Mailgun API error:', result)
        throw new Error(`Failed to send email via Mailgun: ${result}`)
      }

      console.log('send-estimate - Email sent successfully via Mailgun:', result)

      // Log communication in database
      try {
        await supabaseAdmin
          .from('estimate_communications')
          .insert({
            estimate_id: estimateId,
            communication_type: 'email',
            recipient: recipientEmail,
            subject: emailSubject,
            content: emailHtml,
            status: 'sent',
            provider_message_id: JSON.parse(result).id,
            estimate_number: estimate.estimate_number,
            client_name: client?.name,
            client_email: client?.email,
            client_phone: client?.phone,
            sent_at: new Date().toISOString()
          })
      } catch (logError) {
        console.error('send-estimate - Failed to log communication:', logError)
      }

    } else if (sendMethod === 'sms') {
      // Validate phone number
      if (!recipientPhone) {
        throw new Error('Phone number is required for SMS')
      }

      // Clean and validate phone number
      const cleanPhone = recipientPhone.replace(/\D/g, '')
      if (cleanPhone.length < 10) {
        throw new Error('Valid phone number is required')
      }

      // Format phone number for Telnyx
      const formattedPhone = cleanPhone.length === 10 ? `+1${cleanPhone}` : `+${cleanPhone}`

      // Use Telnyx SMS API
      const telnyxApiKey = Deno.env.get('TELNYX_API_KEY')
      if (!telnyxApiKey) {
        throw new Error('Telnyx API key not configured. Please configure TELNYX_API_KEY in Supabase secrets.')
      }

      // Get company phone number from settings
      const fromPhone = companySettings?.company_phone?.replace(/\D/g, '') || null
      
      if (!fromPhone) {
        throw new Error('Company phone number not configured in settings')
      }

      const formattedFromPhone = fromPhone.length === 10 ? `+1${fromPhone}` : `+${fromPhone}`

      const smsMessage = message || `Hi ${client?.name || 'Customer'}! Your estimate ${estimate.estimate_number} is ready. Total: $${estimate.total?.toFixed(2) || '0.00'}. Please contact us if you have any questions.`

      const response = await fetch('https://api.telnyx.com/v2/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${telnyxApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: formattedFromPhone,
          to: formattedPhone,
          text: smsMessage
        })
      })

      const result = await response.json()
      
      if (!response.ok) {
        console.error('send-estimate - Telnyx API error:', result)
        throw new Error(result.errors?.[0]?.detail || 'Failed to send SMS via Telnyx')
      }

      console.log('send-estimate - SMS sent successfully via Telnyx:', result)

      // Log SMS communication
      try {
        await supabaseAdmin
          .from('estimate_communications')
          .insert({
            estimate_id: estimateId,
            communication_type: 'sms',
            recipient: recipientPhone,
            content: smsMessage,
            status: 'sent',
            provider_message_id: result.data?.id,
            estimate_number: estimate.estimate_number,
            client_name: client?.name,
            client_email: client?.email,
            client_phone: client?.phone,
            sent_at: new Date().toISOString()
          })
      } catch (logError) {
        console.error('send-estimate - Failed to log SMS communication:', logError)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Estimate sent successfully',
        companyName: companySettings?.company_name,
        userId: userData.user.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('send-estimate - Error sending estimate:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
