
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'
import { getBusinessConfig } from './utils/businessConfig.ts'
import { findOrCreatePhoneNumber, logCallToDatabase, updateCallStatus } from './utils/callHandling.ts'

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
    };
  };
  // Legacy format support
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
    
    // Try to parse as JSON first (Call Control API format)
    try {
      webhookData = await req.json()
      console.log('=== PARSED JSON WEBHOOK DATA ===')
      console.log(JSON.stringify(webhookData, null, 2))
    } catch {
      // Fallback to form data (TeXML format)
      const formData = await req.formData()
      console.log('=== RAW FORM DATA ===')
      for (const [key, value] of formData.entries()) {
        webhookData[key as keyof TelnyxWebhookData] = value as string
        console.log(`${key}: ${value}`)
      }
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

      // Find or create phone number entry
      const phoneNumberData = await findOrCreatePhoneNumber(supabaseClient, to || '')

      // Get business configuration
      const businessConfig = await getBusinessConfig(supabaseClient)

      // Log the call in database
      await logCallToDatabase(supabaseClient, callControlId, from || '', to || '', phoneNumberData)

      // Answer the call using Call Control API
      console.log('Answering call with Call Control API...')
      const answerSuccess = await answerCall(callControlId)
      
      if (!answerSuccess) {
        console.error('Failed to answer call')
        return new Response('Failed to answer call', { status: 500 })
      }

      // Start audio streaming to our realtime endpoint
      console.log('Starting audio streaming...')
      const streamSuccess = await startAudioStreaming(callControlId)
      
      if (!streamSuccess) {
        console.error('Failed to start audio streaming')
        return new Response('Failed to start streaming', { status: 500 })
      }

      // Update call status
      await updateCallStatus(supabaseClient, callControlId, 'connected', {
        realtime_mode: true,
        business_config: businessConfig
      })

      return new Response('Call answered and streaming started', {
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
      })
    }

    // Handle call answered event
    if (eventType === 'call.answered') {
      console.log('=== CALL ANSWERED ===')
      
      await updateCallStatus(supabaseClient, callControlId, 'connected', {
        realtime_mode: true
      })

      return new Response('Call answered', {
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
      })
    }

    // Handle streaming events
    if (eventType === 'call.streaming.started') {
      console.log('=== STREAMING STARTED ===')
      
      await updateCallStatus(supabaseClient, callControlId, 'streaming', {
        streaming_active: true
      })

      return new Response('Streaming started', {
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
      })
    }

    // Handle call completion
    if (eventType === 'call.hangup' || callState === 'completed' || callState === 'hangup') {
      console.log('=== CALL COMPLETED ===')
      
      await updateCallStatus(supabaseClient, callControlId, 'completed', {
        ended_at: new Date().toISOString()
      })

      return new Response('Call completed', {
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
      })
    }

    // Default response for unhandled events
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
