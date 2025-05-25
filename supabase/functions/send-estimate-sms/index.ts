
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SendEstimateSmsRequest {
  estimateId: string;
  recipient: string;
  estimateNumber: string;
  clientName: string;
  estimateTotal: number;
  estimateDate: string;
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

    const { estimateId, recipient, estimateNumber, clientName, estimateTotal, estimateDate }: SendEstimateSmsRequest = await req.json()

    // Get the default SMS template
    const { data: template } = await supabase
      .from('communication_templates')
      .select('content')
      .eq('type', 'sms')
      .eq('is_default', true)
      .single()

    if (!template) {
      throw new Error('No SMS template found')
    }

    // Replace template variables
    let content = template.content
      .replace('{{client_name}}', clientName)
      .replace('{{estimate_number}}', estimateNumber)
      .replace('{{estimate_total}}', estimateTotal.toFixed(2))
      .replace('{{estimate_date}}', estimateDate)

    // Record the communication attempt
    const { data: communication } = await supabase
      .from('estimate_communications')
      .insert({
        estimate_id: estimateId,
        communication_type: 'sms',
        recipient: recipient,
        content: content,
        status: 'pending'
      })
      .select()
      .single()

    // Send SMS via Twilio
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER')

    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      throw new Error('Twilio credentials not configured')
    }

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`
    const auth = btoa(`${twilioAccountSid}:${twilioAuthToken}`)

    const formData = new URLSearchParams()
    formData.append('From', twilioPhoneNumber)
    formData.append('To', recipient)
    formData.append('Body', content)

    const twilioResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData
    })

    const twilioResult = await twilioResponse.json()

    if (!twilioResponse.ok) {
      throw new Error(`Twilio error: ${twilioResult.message}`)
    }

    // Update communication status
    await supabase
      .from('estimate_communications')
      .update({
        status: 'sent',
        provider_message_id: twilioResult.sid,
        sent_at: new Date().toISOString()
      })
      .eq('id', communication.id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'SMS sent successfully',
        sid: twilioResult.sid 
      }),
      { 
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error sending SMS:', error)
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
