
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SMSRequest {
  to?: string
  recipientPhone?: string
  body?: string
  message?: string
  client_id?: string
  job_id?: string
  estimateId?: string
  invoiceId?: string
  portalLink?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('📱 SMS request received')
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const requestBody: SMSRequest = await req.json()
    console.log('SMS request body:', requestBody)

    const recipientPhone = requestBody.to || requestBody.recipientPhone
    const message = requestBody.body || requestBody.message
    const { client_id, job_id, estimateId, invoiceId } = requestBody

    if (!recipientPhone || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: recipientPhone and message' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get Telnyx API key
    const telnyxApiKey = Deno.env.get('TELNYX_API_KEY')
    if (!telnyxApiKey) {
      console.error('❌ TELNYX_API_KEY not configured')
      return new Response(
        JSON.stringify({ error: 'SMS service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get active Telnyx phone number from telnyx_phone_numbers table
    console.log('🔍 Getting active Telnyx phone number...')
    const { data: telnyxNumbers, error: telnyxError } = await supabaseClient
      .from('telnyx_phone_numbers')
      .select('phone_number')
      .eq('status', 'active')
      .limit(1)

    if (telnyxError) {
      console.error('❌ Error fetching Telnyx phone numbers:', telnyxError)
      return new Response(
        JSON.stringify({ error: 'Failed to get SMS phone number configuration' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!telnyxNumbers || telnyxNumbers.length === 0) {
      console.error('❌ No active Telnyx phone numbers found')
      return new Response(
        JSON.stringify({ error: 'No active SMS phone number configured. Please set up a Telnyx phone number first.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const fromPhone = telnyxNumbers[0].phone_number
    console.log('✅ Using active Telnyx phone number:', fromPhone)

    console.log(`📞 Sending SMS from: ${fromPhone} to: ${recipientPhone}`)
    console.log(`📝 Message length: ${message.length}`)

    // Generate portal link if we have client info
    let finalMessage = message
    if (client_id && (estimateId || invoiceId)) {
      console.log('🔗 Adding portal link for client:', client_id)
      
      const portalUrl = `https://hub.fixlify.app/portal/${client_id}`
      finalMessage = `${message}\n\nView online: ${portalUrl}`
      console.log('✅ Portal link added to message')
    }

    // Send SMS via Telnyx
    const telnyxResponse = await fetch('https://api.telnyx.com/v2/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${telnyxApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromPhone,
        to: recipientPhone,
        text: finalMessage,
        webhook_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/sms-receiver`,
        webhook_failover_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/sms-receiver`,
      }),
    })

    const telnyxData = await telnyxResponse.json()

    if (!telnyxResponse.ok) {
      console.error('❌ Telnyx API error:', telnyxData)
      return new Response(
        JSON.stringify({ error: `SMS service error: ${telnyxData.errors?.[0]?.detail || 'Unable to send SMS'}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ SMS sent successfully:', telnyxData)

    return new Response(
      JSON.stringify({ 
        success: true, 
        id: telnyxData.data?.id,
        status: telnyxData.data?.to?.[0]?.status 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('❌ Error in telnyx-sms function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
