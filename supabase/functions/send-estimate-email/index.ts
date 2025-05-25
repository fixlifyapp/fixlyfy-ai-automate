
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SendEstimateEmailRequest {
  estimateId: string;
  recipient: string;
  estimateNumber: string;
  clientName: string;
  estimateTotal: number;
  estimateDate: string;
  companyName?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { 
      estimateId, 
      recipient, 
      estimateNumber, 
      clientName, 
      estimateTotal, 
      estimateDate,
      companyName = 'Your Company'
    }: SendEstimateEmailRequest = await req.json()

    // Get the default email template
    const { data: template } = await supabase
      .from('communication_templates')
      .select('subject, content')
      .eq('type', 'email')
      .eq('is_default', true)
      .single()

    if (!template) {
      throw new Error('No email template found')
    }

    // Replace template variables
    let subject = template.subject
      .replace('{{estimate_number}}', estimateNumber)
    
    let content = template.content
      .replace('{{client_name}}', clientName)
      .replace('{{estimate_number}}', estimateNumber)
      .replace('{{estimate_total}}', estimateTotal.toFixed(2))
      .replace('{{estimate_date}}', estimateDate)
      .replace('{{company_name}}', companyName)

    // Record the communication attempt
    const { data: communication } = await supabase
      .from('estimate_communications')
      .insert({
        estimate_id: estimateId,
        communication_type: 'email',
        recipient: recipient,
        subject: subject,
        content: content,
        status: 'pending'
      })
      .select()
      .single()

    // Send email via SendGrid
    const sendGridApiKey = Deno.env.get('SENDGRID_API_KEY')
    
    if (!sendGridApiKey) {
      throw new Error('SendGrid API key not configured')
    }

    const sendGridUrl = 'https://api.sendgrid.com/v3/mail/send'
    
    const emailData = {
      personalizations: [{
        to: [{ email: recipient }],
        subject: subject
      }],
      from: { 
        email: 'estimates@yourcompany.com', // You should configure this
        name: companyName 
      },
      content: [{
        type: 'text/html',
        value: content.replace(/\n/g, '<br>')
      }]
    }

    const sendGridResponse = await fetch(sendGridUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendGridApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData)
    })

    if (!sendGridResponse.ok) {
      const errorText = await sendGridResponse.text()
      throw new Error(`SendGrid error: ${errorText}`)
    }

    // Get message ID from response headers
    const messageId = sendGridResponse.headers.get('x-message-id')

    // Update communication status
    await supabase
      .from('estimate_communications')
      .update({
        status: 'sent',
        provider_message_id: messageId,
        sent_at: new Date().toISOString()
      })
      .eq('id', communication.id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        messageId: messageId 
      }),
      { 
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error sending email:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 500 
      }
    )
  }
})
