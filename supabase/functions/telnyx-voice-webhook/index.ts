
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

interface TelnyxWebhookEvent {
  data: {
    event_type: string;
    id: string;
    payload: {
      call_control_id?: string;
      connection_id?: string;
      call_session_id?: string;
      call_leg_id?: string;
      from?: string;
      to?: string;
      direction?: string;
      state?: string;
      client_state?: string;
      start_time?: string;
      end_time?: string;
      hangup_cause?: string;
      hangup_source?: string;
      stream_url?: string;
    };
  };
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log(`Telnyx Voice Webhook: ${req.method} ${req.url}`)
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const telnyxApiKey = Deno.env.get('TELNYX_API_KEY')
    
    if (!telnyxApiKey) {
      console.error('TELNYX_API_KEY not configured')
      throw new Error('TELNYX_API_KEY not configured')
    }

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    const webhookEvent: TelnyxWebhookEvent = await req.json()
    console.log('Telnyx webhook event received:', JSON.stringify(webhookEvent, null, 2))

    const { event_type, payload } = webhookEvent.data
    const callControlId = payload.call_control_id

    if (!callControlId) {
      console.error('No call_control_id found in payload')
      return new Response(JSON.stringify({ success: false, error: 'Missing call_control_id' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      })
    }

    // Handle incoming call initiation
    if (event_type === 'call.initiated' && payload.direction === 'incoming') {
      console.log('Processing incoming call from:', payload.from, 'to:', payload.to)

      // Find or create the phone number entry
      let phoneNumberData
      const { data: existingNumber } = await supabaseClient
        .from('telnyx_phone_numbers')
        .select('*')
        .eq('phone_number', payload.to)
        .single()

      if (existingNumber) {
        phoneNumberData = existingNumber
        console.log('Found existing phone number data')
      } else {
        console.log('Phone number not found, creating entry for:', payload.to)
        const { data: newNumber, error: createError } = await supabaseClient
          .from('telnyx_phone_numbers')
          .insert({
            phone_number: payload.to,
            status: 'active',
            country_code: 'US',
            configured_at: new Date().toISOString(),
            webhook_url: 'https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-voice-webhook'
          })
          .select()
          .single()

        if (createError) {
          console.error('Error creating phone number entry:', createError)
        } else {
          phoneNumberData = newNumber
          console.log('Created new phone number entry')
        }
      }

      // Find active AI configuration
      const { data: aiConfigs } = await supabaseClient
        .from('ai_agent_configs')
        .select('*')
        .eq('is_active', true)
        .limit(1)

      let aiConfig = aiConfigs?.[0]
      if (!aiConfig) {
        console.log('No active AI config found, using default')
        aiConfig = {
          business_niche: 'General Service',
          diagnostic_price: 75,
          emergency_surcharge: 50,
          agent_name: 'AI Assistant',
          company_name: 'our company',
          service_areas: [],
          business_hours: {},
          service_types: ['HVAC', 'Plumbing', 'Electrical', 'General Repair'],
          custom_prompt_additions: ''
        }
      }

      // Log the call in database
      const { data: newCallRecord, error: logError } = await supabaseClient
        .from('telnyx_calls')
        .insert({
          call_control_id: callControlId,
          call_session_id: payload.call_session_id,
          phone_number: payload.from,
          to_number: payload.to,
          call_status: 'initiated',
          direction: 'incoming',
          started_at: new Date().toISOString(),
          user_id: phoneNumberData?.user_id || null,
          appointment_scheduled: false,
          appointment_data: null
        })
        .select()
        .single()

      if (logError) {
        console.error('Error logging call to database:', logError)
      } else {
        console.log('Call logged to database successfully')
      }

      // Answer the call and start media streaming
      console.log('Attempting to answer call with control ID:', callControlId)
      try {
        const answerResponse = await fetch('https://api.telnyx.com/v2/calls/actions/answer', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${telnyxApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            call_control_id: callControlId,
            client_state: JSON.stringify({ 
              ai_config: aiConfig,
              user_id: phoneNumberData?.user_id,
              call_record_id: newCallRecord?.id
            })
          })
        })

        const answerResult = await answerResponse.text()
        console.log('Answer call response status:', answerResponse.status)
        console.log('Answer call response body:', answerResult)

        if (!answerResponse.ok) {
          console.error('Failed to answer call. Status:', answerResponse.status, 'Response:', answerResult)
          
          await supabaseClient
            .from('telnyx_calls')
            .update({ call_status: 'failed' })
            .eq('call_control_id', callControlId)

          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Failed to answer call',
            details: answerResult
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500
          })
        }

        console.log('Call answered successfully!')
        
        await supabaseClient
          .from('telnyx_calls')
          .update({ call_status: 'answered' })
          .eq('call_control_id', callControlId)

      } catch (answerError) {
        console.error('Exception while answering call:', answerError)
        
        await supabaseClient
          .from('telnyx_calls')
          .update({ call_status: 'failed' })
          .eq('call_control_id', callControlId)

        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Exception while answering call',
          details: answerError.message
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        })
      }
    }

    // When call is answered, start media streaming to our Realtime API
    else if (event_type === 'call.answered') {
      console.log('Call connected, starting media streaming...')

      const clientState = payload.client_state ? JSON.parse(payload.client_state) : {}

      await supabaseClient
        .from('telnyx_calls')
        .update({ call_status: 'connected' })
        .eq('call_control_id', callControlId)

      // Start streaming media to our realtime voice dispatch function
      try {
        const streamResponse = await fetch('https://api.telnyx.com/v2/calls/actions/streaming_start', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${telnyxApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            call_control_id: callControlId,
            stream_url: `wss://mqppvcrlvsgrsqelglod.functions.supabase.co/realtime-voice-dispatch?telnyx=true&call_record_id=${clientState.call_record_id}`,
            stream_track: 'both',
            enable_bidirectional_audio: true
          })
        })

        const streamResult = await streamResponse.text()
        console.log('Stream start response status:', streamResponse.status)
        console.log('Stream start response body:', streamResult)

        if (!streamResponse.ok) {
          console.error('Failed to start streaming:', streamResult)
        } else {
          console.log('Media streaming started successfully')
        }

      } catch (streamError) {
        console.error('Exception while starting streaming:', streamError)
      }
    }

    // Handle call hangup/completion
    else if (event_type === 'call.hangup') {
      console.log('Call ended, updating status...')
      
      let duration = null
      if (payload.start_time && payload.end_time) {
        const startTime = new Date(payload.start_time)
        const endTime = new Date(payload.end_time)
        duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000)
      }

      await supabaseClient
        .from('telnyx_calls')
        .update({
          call_status: 'completed',
          ended_at: new Date().toISOString(),
          call_duration: duration
        })
        .eq('call_control_id', callControlId)

      console.log('Call completion recorded successfully')
    }

    // Handle other events
    else {
      console.log('Unhandled event type:', event_type)
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Processed ${event_type} event successfully` 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error processing Telnyx webhook:', error)
    
    return new Response(JSON.stringify({
      error: 'Webhook processing failed',
      message: error.message,
      stack: error.stack
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})
