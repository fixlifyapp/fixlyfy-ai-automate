
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
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    
    if (!telnyxApiKey) {
      console.error('TELNYX_API_KEY not configured')
      throw new Error('TELNYX_API_KEY not configured')
    }

    if (!openaiApiKey) {
      console.error('OPENAI_API_KEY not configured')
      throw new Error('OPENAI_API_KEY not configured')
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
        console.log('Found existing phone number data:', phoneNumberData)
      } else {
        // Create the phone number entry if it doesn't exist
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
          console.log('Created new phone number entry:', phoneNumberData)
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

      // Check if call record already exists
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
        // Log call to database
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
          console.log('Call logged to database:', newCallRecord)
          callRecord = newCallRecord
        }
      }

      // Add a small delay before attempting to answer
      await new Promise(resolve => setTimeout(resolve, 1000))

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
        await supabaseClient
          .from('telnyx_calls')
          .update({ call_status: 'failed' })
          .eq('call_control_id', callControlId)
        
        // Try to play a simple greeting even if answer failed
        console.log('Attempting fallback greeting...')
        await fetch('https://api.telnyx.com/v2/calls/actions/speak', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${telnyxApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            call_control_id: callControlId,
            payload: `Hello! Thank you for calling ${aiConfig.company_name}. We're experiencing technical difficulties but will call you back shortly.`,
            voice: 'female',
            language: 'en'
          })
        })

        return new Response(JSON.stringify({ 
          success: false, 
          message: 'Call answered with fallback greeting' 
        }), {
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          }
        })
      }

      console.log('Call answered successfully!')
    }

    // When call is answered, start streaming to OpenAI
    else if (event_type === 'call.answered') {
      console.log('Call connected, starting AI conversation...')

      const clientState = payload.client_state ? JSON.parse(payload.client_state) : {}
      const aiConfig = clientState.ai_config || {}

      // Update call status
      await supabaseClient
        .from('telnyx_calls')
        .update({ call_status: 'answered' })
        .eq('call_control_id', callControlId)

      // Play a simple greeting for now
      console.log('Playing AI greeting...')
      await fetch('https://api.telnyx.com/v2/calls/actions/speak', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${telnyxApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          call_control_id: callControlId,
          payload: `Hello! My name is ${aiConfig.agent_name || 'AI Assistant'} from ${aiConfig.company_name || 'our company'}. How can I help you today?`,
          voice: 'female',
          language: 'en'
        })
      })
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
