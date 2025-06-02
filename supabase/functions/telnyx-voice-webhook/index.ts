
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

      // Find the phone number owner to associate the call
      const { data: phoneNumberData } = await supabaseClient
        .from('telnyx_phone_numbers')
        .select('*')
        .eq('phone_number', payload.to)
        .single()

      console.log('Phone number data:', phoneNumberData)

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
          voice_id: 'alloy',
          greeting_template: 'Hello! My name is {agent_name}. I am an AI assistant for {company_name}. How can I help you today?',
          company_name: 'our company',
          service_areas: [],
          business_hours: {},
          service_types: ['HVAC', 'Plumbing', 'Electrical', 'General Repair']
        }
      }

      // Check if call record already exists (to prevent duplicates)
      const { data: existingCall } = await supabaseClient
        .from('telnyx_calls')
        .select('id')
        .eq('call_control_id', callControlId)
        .single()

      let callRecord
      if (existingCall) {
        console.log('Call record already exists, skipping insert')
        callRecord = existingCall
      } else {
        // Log call to database - only insert on first call.initiated event
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
          // Continue with call handling even if logging fails
        } else {
          console.log('Call logged to database:', newCallRecord)
          callRecord = newCallRecord
        }
      }

      // Answer the call
      console.log('Attempting to answer call...')
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
            call_record_id: callRecord?.id
          })
        })
      })

      const answerResult = await answerResponse.text()
      console.log('Answer call response:', answerResponse.status, answerResult)

      if (!answerResponse.ok) {
        console.error('Error answering call:', answerResult)
        // Update call status to failed
        await supabaseClient
          .from('telnyx_calls')
          .update({ call_status: 'failed' })
          .eq('call_control_id', callControlId)
        
        throw new Error(`Failed to answer call: ${answerResult}`)
      }

      console.log('Call answered successfully, waiting for connection...')
    }

    // When call is connected/answered, start AI interaction
    else if (event_type === 'call.answered') {
      console.log('Call connected, starting AI interaction...')

      const clientState = payload.client_state ? JSON.parse(payload.client_state) : {}
      const aiConfig = clientState.ai_config || {}

      // Update call status in database
      const { error: updateError } = await supabaseClient
        .from('telnyx_calls')
        .update({
          call_status: 'answered'
        })
        .eq('call_control_id', callControlId)

      if (updateError) {
        console.error('Error updating call status:', updateError)
      }

      // Generate personalized greeting
      const currentHour = new Date().getHours()
      const timeOfDay = currentHour < 12 ? 'morning' : currentHour < 17 ? 'afternoon' : 'evening'
      
      let greeting = aiConfig.greeting_template || 'Hello! My name is {agent_name}. I am an AI assistant for {company_name}. How can I help you today?'
      greeting = greeting
        .replace(/{agent_name}/g, aiConfig.agent_name || 'AI Assistant')
        .replace(/{company_name}/g, aiConfig.company_name || 'our company')
        .replace(/{time_of_day}/g, timeOfDay)

      console.log('Generated greeting:', greeting)

      // Speak greeting through Telnyx TTS
      const speakResponse = await fetch('https://api.telnyx.com/v2/calls/actions/speak', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${telnyxApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          call_control_id: callControlId,
          payload: greeting,
          voice: 'female',
          language: 'en'
        })
      })

      const speakResult = await speakResponse.text()
      console.log('Speak response:', speakResponse.status, speakResult)

      if (!speakResponse.ok) {
        console.error('TTS error:', speakResult)
      }

      // Update transcript with greeting
      const { error: transcriptError } = await supabaseClient
        .from('telnyx_calls')
        .update({
          ai_transcript: `AI: ${greeting}`
        })
        .eq('call_control_id', callControlId)

      if (transcriptError) {
        console.error('Error updating transcript:', transcriptError)
      }

      // Start listening for customer response after greeting completes
      setTimeout(async () => {
        console.log('Starting to listen for customer input...')
        const gatherResponse = await fetch('https://api.telnyx.com/v2/calls/actions/gather_using_audio', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${telnyxApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            call_control_id: callControlId,
            audio_url: 'silence_stream://1000',
            minimum_digits: 0,
            maximum_digits: 0,
            timeout_millis: 30000,
            inter_digit_timeout_millis: 5000
          })
        })
        
        const gatherResult = await gatherResponse.text()
        console.log('Gather response:', gatherResponse.status, gatherResult)
      }, 5000) // Wait 5 seconds for greeting to complete
    }

    // Handle call hangup/completion
    else if (event_type === 'call.hangup') {
      console.log('Call ended, updating status...')
      
      // Calculate call duration if we have start and end times
      let duration = null
      if (payload.start_time && payload.end_time) {
        const startTime = new Date(payload.start_time)
        const endTime = new Date(payload.end_time)
        duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000)
      }

      // Update status in database
      const { error: updateError } = await supabaseClient
        .from('telnyx_calls')
        .update({
          call_status: 'completed',
          ended_at: new Date().toISOString(),
          call_duration: duration
        })
        .eq('call_control_id', callControlId)

      if (updateError) {
        console.error('Error updating call completion:', updateError)
      } else {
        console.log('Call completion recorded successfully')
      }
    }

    // Handle other call events
    else if (event_type === 'call.speak.ended') {
      console.log('TTS finished, call can continue...')
    }

    else {
      console.log('Unhandled event type:', event_type)
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Processed ${event_type} event` 
    }), {
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json' 
      }
    })

  } catch (error) {
    console.error('Error processing Telnyx webhook:', error)
    
    return new Response(JSON.stringify({
      error: 'Webhook processing failed',
      message: error.message,
      stack: error.stack
    }), {
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json' 
      },
      status: 500
    })
  }
})
