
import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Use service role client for database access to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Also create anon client for user context if needed
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const {
      estimateId,
      sendMethod,
      recipientEmail,
      recipientPhone,
      subject,
      message
    } = await req.json()

    console.log('Send estimate request:', { estimateId, sendMethod, recipientEmail, recipientPhone })

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
      console.error('Estimate lookup error:', estimateError)
      throw new Error(`Estimate not found: ${estimateError?.message || 'Unknown error'}`)
    }

    console.log('Found estimate:', estimate.estimate_number)

    // Get company settings using admin client
    const { data: companySettings, error: settingsError } = await supabaseAdmin
      .from('company_settings')
      .select('*')
      .limit(1)
      .maybeSingle()

    if (settingsError) {
      console.error('Company settings error:', settingsError)
    }

    console.log('Company settings found:', !!companySettings)

    // Get line items using admin client
    const { data: lineItems, error: lineItemsError } = await supabaseAdmin
      .from('line_items')
      .select('*')
      .eq('parent_type', 'estimate')
      .eq('parent_id', estimateId)

    if (lineItemsError) {
      console.error('Line items error:', lineItemsError)
    }

    console.log('Line items found:', lineItems?.length || 0)

    const client = estimate.jobs?.clients
    const job = estimate.jobs

    if (sendMethod === 'email') {
      // Validate email
      if (!recipientEmail || !recipientEmail.includes('@')) {
        throw new Error('Valid email address is required')
      }

      // Check Mailgun configuration
      const mailgunApiKey = Deno.env.get('MAILGUN_API_KEY')
      if (!mailgunApiKey) {
        throw new Error('Mailgun API key not configured. Please configure MAILGUN_API_KEY in Supabase secrets.')
      }

      const mailgunDomain = companySettings?.mailgun_domain || 'fixlyfy.app'
      const fromEmail = companySettings?.email_from_address || `support@${mailgunDomain}`
      const fromName = companySettings?.email_from_name || companySettings?.company_name || 'Support Team'

      console.log('Sending email with Mailgun:', { domain: mailgunDomain, from: fromEmail })

      // Create detailed HTML email template
      const lineItemsHtml = lineItems?.map(item => 
        `<tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.description}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${item.unit_price?.toFixed(2)}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${(item.quantity * item.unit_price)?.toFixed(2)}</td>
        </tr>`
      ).join('') || '<tr><td colspan="4" style="padding: 16px; text-align: center; color: #666;">No items found</td></tr>'

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Estimate ${estimate.estimate_number}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #007bff; }
            .company-name { color: #007bff; font-size: 24px; font-weight: bold; margin-bottom: 5px; }
            .estimate-title { color: #333; font-size: 20px; margin-bottom: 20px; }
            .client-info { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
            .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .items-table th { background-color: #007bff; color: white; padding: 12px; text-align: left; }
            .items-table td { padding: 8px; border-bottom: 1px solid #eee; }
            .total-section { text-align: right; margin-top: 20px; padding-top: 15px; border-top: 2px solid #007bff; }
            .total-amount { font-size: 24px; font-weight: bold; color: #007bff; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; }
            .message { background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="company-name">${companySettings?.company_name || 'Fixlyfy Services'}</div>
              <div style="color: #666;">${companySettings?.company_tagline || 'Professional Service Solutions'}</div>
            </div>
            
            <div class="estimate-title">Estimate ${estimate.estimate_number}</div>
            
            <div class="client-info">
              <strong>To:</strong> ${client?.name || 'Valued Customer'}<br>
              ${client?.email ? `<strong>Email:</strong> ${client.email}<br>` : ''}
              ${client?.phone ? `<strong>Phone:</strong> ${client.phone}<br>` : ''}
              ${job?.address ? `<strong>Service Address:</strong> ${job.address}<br>` : ''}
            </div>

            ${message ? `<div class="message">${message}</div>` : ''}
            
            <div style="margin: 20px 0;">
              <strong>Job:</strong> ${job?.title || 'Service Request'}<br>
              ${job?.description ? `<strong>Description:</strong> ${job.description}<br>` : ''}
              <strong>Date:</strong> ${new Date(estimate.date || estimate.created_at).toLocaleDateString()}
            </div>
            
            <table class="items-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Unit Price</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${lineItemsHtml}
              </tbody>
            </table>
            
            <div class="total-section">
              <div class="total-amount">Total: $${estimate.total?.toFixed(2) || '0.00'}</div>
            </div>

            ${estimate.notes ? `<div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 5px;"><strong>Notes:</strong><br>${estimate.notes}</div>` : ''}
            
            <div class="footer">
              <p>Thank you for choosing ${companySettings?.company_name || 'our services'}!</p>
              ${companySettings?.company_phone ? `<p>Questions? Call us at ${companySettings.company_phone}</p>` : ''}
              ${companySettings?.company_email ? `<p>Email: ${companySettings.company_email}</p>` : ''}
              ${companySettings?.company_website ? `<p>Web: ${companySettings.company_website}</p>` : ''}
            </div>
          </div>
        </body>
        </html>
      `

      // Use Mailgun API
      const response = await fetch(`https://api.mailgun.net/v3/${mailgunDomain}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`api:${mailgunApiKey}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          from: `${fromName} <${fromEmail}>`,
          to: recipientEmail,
          subject: subject || `Estimate ${estimate.estimate_number} from ${companySettings?.company_name || 'Fixlyfy Services'}`,
          html: emailHtml
        })
      })

      const result = await response.text()
      
      if (!response.ok) {
        console.error('Mailgun API error:', result)
        throw new Error(`Failed to send email via Mailgun: ${result}`)
      }

      console.log('Email sent successfully via Mailgun:', result)

      // Log communication in database
      try {
        await supabaseAdmin
          .from('estimate_communications')
          .insert({
            estimate_id: estimateId,
            communication_type: 'email',
            recipient: recipientEmail,
            subject: subject || `Estimate ${estimate.estimate_number}`,
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
        console.error('Failed to log communication:', logError)
        // Don't fail the whole operation for logging errors
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
        console.error('Telnyx API error:', result)
        throw new Error(result.errors?.[0]?.detail || 'Failed to send SMS via Telnyx')
      }

      console.log('SMS sent successfully via Telnyx:', result)

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
        console.error('Failed to log SMS communication:', logError)
        // Don't fail the whole operation for logging errors
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Estimate sent successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error sending estimate:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
