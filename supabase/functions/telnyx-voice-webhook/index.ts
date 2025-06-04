
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'
import { getBusinessConfig } from './utils/businessConfig.ts'
import { findOrCreatePhoneNumber, updateCallStatus } from './utils/callHandling.ts'

interface TelnyxWebhookData {
  data?: {
    event_type?: string;
    id?: string;
    payload?: {
      call_control_id?: string;
      connection_id?: string;
      call_session_id?: string;
      from?: string;
      to?: string;
      direction?: string;
      state?: string;
      previous_state?: string;
      start_time?: string;
      answer_time?: string;
      end_time?: string;
    };
  };
  CallSid?: string;
  From?: string;
  To?: string;
  CallStatus?: string;
  Direction?: string;
  AccountSid?: string;
  ConnectionId?: string;
  [key: string]: any;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const TELNYX_API_KEY = Deno.env.get('TELNYX_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')

const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('1') && cleaned.length === 11) {
    return cleaned.substring(1);
  }
  return cleaned;
};

const findClientByPhone = async (supabase: any, phone: string) => {
  const formattedPhone = formatPhoneNumber(phone);
  
  const phoneVariations = [
    phone,
    formattedPhone,
    `+1${formattedPhone}`,
    `(${formattedPhone.slice(0,3)}) ${formattedPhone.slice(3,6)}-${formattedPhone.slice(6)}`,
    `${formattedPhone.slice(0,3)}-${formattedPhone.slice(3,6)}-${formattedPhone.slice(6)}`
  ];

  for (const phoneVar of phoneVariations) {
    const { data: client, error } = await supabase
      .from('clients')
      .select('*')
      .ilike('phone', `%${phoneVar}%`)
      .limit(1)
      .maybeSingle();

    if (!error && client) {
      return client;
    }
  }
  return null;
};

const logCallToTelnyxDatabase = async (supabaseClient: any, callControlId: string, from: string, to: string, phoneNumberData?: any) => {
  try {
    // Find client by phone number
    const client = await findClientByPhone(supabaseClient, from);
    
    const { error } = await supabaseClient
      .from('telnyx_calls')
      .insert({
        call_control_id: callControlId,
        from_number: from,
        to_number: to,
        direction: 'inbound',
        status: 'initiated',
        client_id: client?.id || null,
        metadata: {
          phone_number_data: phoneNumberData
        }
      });

    if (error) {
      console.error('Error logging call to telnyx_calls:', error);
    } else {
      console.log('Call logged to telnyx_calls table');
    }
  } catch (error) {
    console.error('Error in logCallToTelnyxDatabase:', error);
  }
};

const updateTelnyxCallStatus = async (supabaseClient: any, callControlId: string, status: string, additionalData?: any) => {
  try {
    const updateData: any = { status };
    
    if (additionalData) {
      if (additionalData.answered_at) updateData.answered_at = additionalData.answered_at;
      if (additionalData.ended_at) updateData.ended_at = additionalData.ended_at;
      if (additionalData.duration_seconds) updateData.duration_seconds = additionalData.duration_seconds;
      if (additionalData.metadata) updateData.metadata = additionalData.metadata;
    }

    const { error } = await supabaseClient
      .from('telnyx_calls')
      .update(updateData)
      .eq('call_control_id', callControlId);

    if (error) {
      console.error('Error updating telnyx call status:', error);
    } else {
      console.log(`Telnyx call status updated to: ${status}`);
    }
  } catch (error) {
    console.error('Error in updateTelnyxCallStatus:', error);
  }
};

const answerCall = async (callControlId: string) => {
  try {
    const response = await fetch(`https://api.telnyx.com/v2/calls/${callControlId}/actions/answer`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TELNYX_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        webhook_url: `${SUPABASE_URL}/functions/v1/telnyx-voice-webhook`,
        webhook_url_method: 'POST'
      })
    })
    
    if (!response.ok) {
      const error = await response.text()
      console.error('Failed to answer call:', error)
      return false
    }
    
    console.log('Call answered successfully')
    return true
  } catch (error) {
    console.error('Error answering call:', error)
    return false
  }
}

const startAudioStreaming = async (callControlId: string) => {
  try {
    const streamUrl = `wss://${SUPABASE_URL?.replace('https://', '')}/functions/v1/realtime-voice-dispatch`
    
    const response = await fetch(`https://api.telnyx.com/v2/calls/${callControlId}/actions/streaming_start`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TELNYX_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        stream_url: streamUrl,
        stream_track: 'both',
        enable_dialogflow_es: false,
        enable_dialogflow_cx: false
      })
    })
    
    if (!response.ok) {
      const error = await response.text()
      console.error('Failed to start streaming:', error)
      return false
    }
    
    console.log('Audio streaming started successfully')
    return true
  } catch (error) {
    console.error('Error starting audio streaming:', error)
    return false
  }
}

serve(async (req) => {
  console.log(`=== Telnyx Call Control Webhook START ===`)
  console.log(`Method: ${req.method}`)
  console.log(`URL: ${req.url}`)
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (req.method !== 'POST') {
      console.log('Method not allowed:', req.method)
      return new Response('Method not allowed', { status: 405 })
    }

    let webhookData: TelnyxWebhookData = {}
    let rawBody: string = ''
    
    try {
      rawBody = await req.text()
      console.log('=== RAW BODY ===')
      console.log(rawBody)
      
      try {
        webhookData = JSON.parse(rawBody)
        console.log('=== PARSED JSON WEBHOOK DATA ===')
        console.log(JSON.stringify(webhookData, null, 2))
      } catch (jsonError) {
        console.log('JSON parse failed, trying form data format')
        
        const formData = new URLSearchParams(rawBody)
        console.log('=== PARSED FORM DATA ===')
        for (const [key, value] of formData.entries()) {
          webhookData[key as keyof TelnyxWebhookData] = value as string
          console.log(`${key}: ${value}`)
        }
      }
    } catch (bodyError) {
      console.error('Failed to parse request body:', bodyError)
      return new Response('Invalid request body', { status: 400 })
    }

    // Extract call information from either format
    let callControlId: string | undefined
    let from: string | undefined
    let to: string | undefined
    let eventType: string | undefined
    let callState: string | undefined

    if (webhookData.data?.payload) {
      // Call Control API format
      const payload = webhookData.data.payload
      callControlId = payload.call_control_id
      from = payload.from
      to = payload.to
      eventType = webhookData.data.event_type
      callState = payload.state
      
      console.log(`=== CALL CONTROL EVENT: ${eventType} ===`)
      console.log(`Call Control ID: ${callControlId}`)
      console.log(`State: ${callState}`)
      console.log(`From: ${from} -> To: ${to}`)
    } else {
      // Legacy TeXML format
      callControlId = webhookData.CallSid
      from = webhookData.From
      to = webhookData.To
      eventType = 'legacy_call'
      callState = webhookData.CallStatus
      
      console.log(`=== LEGACY CALL EVENT ===`)
      console.log(`Call Sid: ${callControlId}`)
      console.log(`Status: ${callState}`)
      console.log(`From: ${from} -> To: ${to}`)
    }

    if (!callControlId) {
      console.error('No call control ID found in webhook data')
      return new Response('Missing call control ID', { status: 400 })
    }

    // Handle incoming call
    if (eventType === 'call.initiated' || eventType === 'call.ringing' || (!eventType && from && to)) {
      console.log('=== NEW INCOMING CALL - REALTIME MODE ===')

      const phoneNumberData = await findOrCreatePhoneNumber(supabaseClient, to || '')
      const businessConfig = await getBusinessConfig(supabaseClient)

      // Log the call in telnyx_calls database
      await logCallToTelnyxDatabase(supabaseClient, callControlId, from || '', to || '', phoneNumberData)

      console.log('Answering call with Call Control API...')
      const answerSuccess = await answerCall(callControlId)
      
      if (!answerSuccess) {
        console.error('Failed to answer call')
        return new Response('Failed to answer call', { status: 500 })
      }

      console.log('Starting audio streaming...')
      const streamSuccess = await startAudioStreaming(callControlId)
      
      if (!streamSuccess) {
        console.error('Failed to start audio streaming')
        return new Response('Failed to start streaming', { status: 500 })
      }

      await updateTelnyxCallStatus(supabaseClient, callControlId, 'connected', {
        metadata: { realtime_mode: true, business_config: businessConfig }
      })

      return new Response('Call answered and streaming started', {
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
      })
    }

    // Handle call answered event
    if (eventType === 'call.answered') {
      console.log('=== CALL ANSWERED ===')
      
      await updateTelnyxCallStatus(supabaseClient, callControlId, 'answered', {
        answered_at: new Date().toISOString()
      })

      return new Response('Call answered', {
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
      })
    }

    // Handle streaming events
    if (eventType === 'call.streaming.started') {
      console.log('=== STREAMING STARTED ===')
      
      await updateTelnyxCallStatus(supabaseClient, callControlId, 'streaming', {
        metadata: { streaming_active: true }
      })

      return new Response('Streaming started', {
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
      })
    }

    // Handle call completion
    if (eventType === 'call.hangup' || callState === 'completed' || callState === 'hangup') {
      console.log('=== CALL COMPLETED ===')
      
      await updateTelnyxCallStatus(supabaseClient, callControlId, 'completed', {
        ended_at: new Date().toISOString()
      })

      return new Response('Call completed', {
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
      })
    }

    console.log('=== UNHANDLED WEBHOOK EVENT ===')
    console.log(`Event Type: ${eventType}, Call State: ${callState}`)
    
    return new Response('Event received', {
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
    })

  } catch (error) {
    console.error('=== ERROR IN CALL CONTROL WEBHOOK ===')
    console.error('Error processing webhook:', error)
    
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  } finally {
    console.log(`=== Telnyx Call Control Webhook END ===`)
  }
})
