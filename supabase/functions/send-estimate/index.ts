
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

    // Get estimate details with company settings
    const { data: estimate, error: estimateError } = await supabaseClient
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
      throw new Error('Estimate not found')
    }

    // Get company settings for dynamic email/phone configuration
    const { data: companySettings } = await supabaseClient
      .from('company_settings')
      .select('*')
      .limit(1)
      .maybeSingle()

    // Get line items
    const { data: lineItems } = await supabaseClient
      .from('line_items')
      .select('*')
      .eq('parent_type', 'estimate')
      .eq('parent_id', estimateId)

    if (sendMethod === 'email') {
      // Validate email
      if (!recipientEmail || !recipientEmail.includes('@')) {
        throw new Error('Valid email address is required')
      }

      // Use Mailgun for email sending
      const mailgunApiKey = Deno.env.get('MAILGUN_API_KEY')
      const mailgunDomain = companySettings?.mailgun_domain || 'fixlyfy.app'
      
      if (!mailgunApiKey) {
        throw new Error('MAILGUN_API_KEY not configured')
      }

      const fromEmail = companySettings?.email_from_address || `estimates@${mailgunDomain}`
      const fromName = companySettings?.email_from_name || companySettings?.company_name || 'Support Team'

      const emailHtml = `
        <h2>Estimate ${estimate.estimate_number}</h2>
        <p>Dear ${estimate.jobs?.clients?.name || 'Valued Customer'},</p>
        <p>${message}</p>
        
        <h3>Estimate Details:</h3>
        <ul>
          ${lineItems?.map(item => 
            `<li>${item.description} - Qty: ${item.quantity} - $${item.unit_price} each</li>`
          ).join('') || ''}
        </ul>
        
        <p><strong>Total: $${estimate.total}</strong></p>
        
        <p>Thank you for choosing ${companySettings?.company_name || 'our services'}!</p>
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
          subject: subject || `Estimate ${estimate.estimate_number}`,
          html: emailHtml
        })
      })

      const result = await response.text()
      
      if (!response.ok) {
        throw new Error(`Failed to send email: ${result}`)
      }

      console.log('Email sent successfully via Mailgun:', result)
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
        throw new Error('TELNYX_API_KEY not configured')
      }

      // Get company phone number from settings or use a default
      const fromPhone = companySettings?.company_phone?.replace(/\D/g, '') || null
      
      if (!fromPhone) {
        throw new Error('Company phone number not configured in settings')
      }

      const formattedFromPhone = fromPhone.length === 10 ? `+1${fromPhone}` : `+${fromPhone}`

      const smsMessage = `Hi ${estimate.jobs?.clients?.name || 'Customer'}! Your estimate ${estimate.estimate_number} is ready. Total: $${estimate.total}. ${message || 'Please contact us if you have any questions.'}`

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
        throw new Error(result.errors?.[0]?.detail || 'Failed to send SMS')
      }

      console.log('SMS sent successfully via Telnyx:', result)
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
