
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'
import { sendSMS } from './telnyx.ts'
import { validateRequest } from './validation.ts'
import { getEstimateData } from './estimate.ts'
import { logSMSEvent } from './logging.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('📱 SMS Estimate request received');
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const body = await req.json()
    console.log('Request body:', body)
    
    const { estimateId, recipientPhone, message } = body
    
    // Validate the request
    const validation = validateRequest({ estimateId, recipientPhone, message })
    if (!validation.isValid) {
      return new Response(
        JSON.stringify({ success: false, error: validation.error }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log(`Processing SMS for estimate: ${estimateId} to phone: ${recipientPhone}`)

    // Get estimate data
    const estimate = await getEstimateData(supabaseAdmin, estimateId)
    if (!estimate) {
      return new Response(
        JSON.stringify({ success: false, error: 'Estimate not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    console.log('Estimate found:', estimate.estimate_number)

    // Get the from phone number
    const { data: phoneNumbers } = await supabaseAdmin
      .from('telnyx_phone_numbers')
      .select('phone_number')
      .eq('source', 'telnyx_table')
      .limit(1)

    const fromNumber = phoneNumbers?.[0]?.phone_number || '+14375249932'
    console.log('Using from number:', fromNumber)

    // Format phone numbers for Telnyx (ensure they start with +)
    const formattedFromNumber = fromNumber.startsWith('+') ? fromNumber : `+${fromNumber}`
    const formattedToNumber = recipientPhone.startsWith('+') ? recipientPhone : `+1${recipientPhone.replace(/\D/g, '')}`
    
    console.log('Formatted phones - From:', formattedFromNumber, 'To:', formattedToNumber)

    // Send SMS
    const smsResult = await sendSMS({
      from: formattedFromNumber,
      to: formattedToNumber,
      text: message
    })

    if (!smsResult.success) {
      console.error('Failed to send SMS:', smsResult.error)
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to send SMS' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Log the SMS event
    await logSMSEvent(supabaseAdmin, {
      estimateId,
      recipientPhone,
      message,
      status: 'sent',
      provider: 'telnyx',
      messageId: smsResult.messageId
    })

    console.log('SMS sent successfully')

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: smsResult.messageId,
        message: 'SMS sent successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in send-estimate-sms function:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
