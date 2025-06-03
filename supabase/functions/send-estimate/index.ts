
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

    // Get estimate details
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

    // Get line items
    const { data: lineItems } = await supabaseClient
      .from('line_items')
      .select('*')
      .eq('parent_type', 'estimate')
      .eq('parent_id', estimateId)

    if (sendMethod === 'email') {
      // Use Mailgun for email sending
      const mailgunApiKey = Deno.env.get('MAILGUN_API_KEY')
      if (!mailgunApiKey) {
        throw new Error('MAILGUN_API_KEY not configured')
      }

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
        
        <p>Thank you for choosing our services!</p>
      `

      // Use Mailgun API
      const response = await fetch('https://api.mailgun.net/v3/fixlyfy.app/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`api:${mailgunApiKey}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          from: 'estimates@fixlyfy.app',
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
      // Use Telnyx SMS API
      const telnyxApiKey = Deno.env.get('TELNYX_API_KEY')
      if (!telnyxApiKey) {
        throw new Error('TELNYX_API_KEY not configured')
      }

      const smsMessage = `Hi ${estimate.jobs?.clients?.name || 'Customer'}! Your estimate ${estimate.estimate_number} is ready. Total: $${estimate.total}. ${message || 'Please contact us if you have any questions.'}`

      const response = await fetch('https://api.telnyx.com/v2/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${telnyxApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: '+1555XXXXX', // Replace with your Telnyx phone number
          to: recipientPhone,
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
