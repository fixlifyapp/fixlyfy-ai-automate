
import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Input validation functions
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
};

const validatePhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10;
};

const sanitizeInput = (input: string, maxLength: number = 255): string => {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, maxLength);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const requestBody = await req.json()
    const { 
      method, 
      recipient, 
      invoiceNumber, 
      invoiceData, 
      clientName, 
      communicationId 
    } = requestBody
    
    console.log('send-invoice - Request:', { 
      method, 
      recipient: recipient?.substring(0, 10) + '...', 
      invoiceNumber, 
      clientName,
      communicationId 
    })

    // Validate inputs
    const sanitizedMethod = sanitizeInput(method, 10);
    const sanitizedRecipient = sanitizeInput(recipient, 100);
    const sanitizedInvoiceNumber = sanitizeInput(invoiceNumber, 50);
    const sanitizedClientName = sanitizeInput(clientName, 100);

    if (!sanitizedMethod || !sanitizedRecipient || !sanitizedInvoiceNumber) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (sanitizedMethod === 'email' && !validateEmail(sanitizedRecipient)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (sanitizedMethod === 'sms' && !validatePhone(sanitizedRecipient)) {
      return new Response(
        JSON.stringify({ error: 'Invalid phone number' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Get company settings for email configuration
    const { data: settings } = await supabaseAdmin
      .from('company_settings')
      .select('mailgun_domain, email_from_name, email_from_address, mailgun_settings')
      .single()

    if (sanitizedMethod === 'email') {
      // Send email via Mailgun
      const mailgunDomain = settings?.mailgun_domain || Deno.env.get('MAILGUN_DOMAIN')
      const mailgunApiKey = settings?.mailgun_settings?.api_key || Deno.env.get('MAILGUN_API_KEY')
      const fromName = settings?.email_from_name || 'Support Team'
      const fromAddress = settings?.email_from_address || `noreply@${mailgunDomain}`

      if (!mailgunDomain || !mailgunApiKey) {
        throw new Error('Mailgun not configured')
      }

      const emailSubject = `Invoice ${sanitizedInvoiceNumber}`
      const emailContent = `
        <h2>Invoice ${sanitizedInvoiceNumber}</h2>
        <p>Hi ${sanitizedClientName},</p>
        <p>Please find your invoice details below:</p>
        
        <div style="margin: 20px 0; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <h3>Invoice Summary</h3>
          <p><strong>Invoice Number:</strong> ${sanitizedInvoiceNumber}</p>
          <p><strong>Total Amount:</strong> $${invoiceData.total.toFixed(2)}</p>
          
          <h4>Items:</h4>
          <ul>
            ${invoiceData.lineItems.map(item => 
              `<li>${item.description} - Qty: ${item.quantity} × $${item.unitPrice.toFixed(2)} = $${item.total.toFixed(2)}</li>`
            ).join('')}
          </ul>
          
          ${invoiceData.notes ? `<p><strong>Notes:</strong> ${invoiceData.notes}</p>` : ''}
        </div>

        ${invoiceData.viewUrl ? `<p><a href="${invoiceData.viewUrl}" style="background-color: #007cba; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Invoice</a></p>` : ''}
        
        ${invoiceData.portalLoginLink ? `<p><a href="${invoiceData.portalLoginLink}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Access Client Portal</a></p>` : ''}
        
        <p>Thank you for your business!</p>
      `

      const formData = new FormData()
      formData.append('from', `${fromName} <${fromAddress}>`)
      formData.append('to', sanitizedRecipient)
      formData.append('subject', emailSubject)
      formData.append('html', emailContent)

      const response = await fetch(`https://api.mailgun.net/v3/${mailgunDomain}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`api:${mailgunApiKey}`)}`
        },
        body: formData
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Mailgun error:', errorText)
        throw new Error(`Failed to send email: ${response.status}`)
      }

      const result = await response.json()
      console.log('Email sent successfully:', result.id)

      // Update communication record
      if (communicationId) {
        await supabaseAdmin
          .from('invoice_communications')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
            provider_message_id: result.id
          })
          .eq('id', communicationId)
      }

      return new Response(
        JSON.stringify({ success: true, messageId: result.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } else if (sanitizedMethod === 'sms') {
      // Send SMS via Telnyx
      const telnyxApiKey = Deno.env.get('TELNYX_API_KEY')
      
      if (!telnyxApiKey) {
        throw new Error('Telnyx not configured')
      }

      // Get from phone number
      const { data: phoneNumbers } = await supabaseAdmin
        .from('phone_number_assignments')
        .select('phone_number')
        .eq('is_active', true)
        .limit(1)

      const fromNumber = phoneNumbers?.[0]?.phone_number
      if (!fromNumber) {
        throw new Error('No active phone number available')
      }

      const smsContent = `Hi ${sanitizedClientName}! Your invoice ${sanitizedInvoiceNumber} is ready. Total: $${invoiceData.total.toFixed(2)}. ${invoiceData.portalLoginLink ? `View details: ${invoiceData.portalLoginLink}` : ''}`

      const response = await fetch('https://api.telnyx.com/v2/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${telnyxApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: fromNumber,
          to: sanitizedRecipient,
          text: smsContent
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Telnyx error:', errorText)
        throw new Error(`Failed to send SMS: ${response.status}`)
      }

      const result = await response.json()
      console.log('SMS sent successfully:', result.data.id)

      // Update communication record
      if (communicationId) {
        await supabaseAdmin
          .from('invoice_communications')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
            provider_message_id: result.data.id
          })
          .eq('id', communicationId)
      }

      return new Response(
        JSON.stringify({ success: true, messageId: result.data.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid method' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )

  } catch (error) {
    console.error('send-invoice - Error:', error)
    
    // Update communication record with error if we have the ID
    const requestBody = await req.json().catch(() => ({}))
    if (requestBody.communicationId) {
      try {
        const supabaseAdmin = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )
        
        await supabaseAdmin
          .from('invoice_communications')
          .update({
            status: 'failed',
            error_message: error.message
          })
          .eq('id', requestBody.communicationId)
      } catch (updateError) {
        console.error('Failed to update communication record:', updateError)
      }
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
