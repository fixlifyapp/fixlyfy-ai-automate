
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
      throw new Error('TELNYX_API_KEY not configured')
    }

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    const webhookEvent: TelnyxWebhookEvent = await req.json()
    console.log('Telnyx webhook event:', JSON.stringify(webhookEvent, null, 2))

    const { event_type, payload } = webhookEvent.data

    // Handle incoming call
    if (event_type === 'call.initiated' && payload.direction === 'incoming') {
      console.log('Incoming call from:', payload.from, 'to number:', payload.to)

      // Find the phone number owner to associate the call
      const { data: phoneNumberData } = await supabaseClient
        .from('telnyx_phone_numbers')
        .select('*')
        .eq('phone_number', payload.to)
        .single()

      // Find active AI configuration
      const { data: aiConfigs } = await supabaseClient
        .from('ai_agent_configs')
        .select('*')
        .eq('is_active', true)
        .limit(1)

      let aiConfig = aiConfigs?.[0]
      if (!aiConfig) {
        console.log('Using default AI configuration')
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

      // Log call to database with proper user association
      const { error: logError } = await supabaseClient
        .from('telnyx_calls')
        .insert({
          call_control_id: payload.call_control_id,
          call_session_id: payload.call_session_id,
          phone_number: payload.from,
          to_number: payload.to,
          call_status: 'initiated',
          direction: 'incoming',
          started_at: new Date().toISOString(),
          user_id: phoneNumberData?.user_id || aiConfig?.user_id,
          appointment_scheduled: false,
          appointment_data: null
        })

      if (logError) {
        console.error('Error logging call:', logError)
      }

      // Answer the call
      const answerResponse = await fetch('https://api.telnyx.com/v2/calls/actions/answer', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${telnyxApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          call_control_id: payload.call_control_id,
          client_state: JSON.stringify({ 
            ai_config: aiConfig,
            user_id: phoneNumberData?.user_id || aiConfig?.user_id
          })
        })
      })

      if (!answerResponse.ok) {
        console.error('Error answering call:', await answerResponse.text())
        throw new Error('Failed to answer call')
      }

      console.log('Call answered, waiting for connection to start AI')
    }

    // When call is connected, start AI
    else if (event_type === 'call.answered') {
      console.log('Call connected, starting AI dialog')

      const clientState = payload.client_state ? JSON.parse(payload.client_state) : {}
      const aiConfig = clientState.ai_config || {}

      // Update call status
      await supabaseClient
        .from('telnyx_calls')
        .update({
          call_status: 'answered'
        })
        .eq('call_control_id', payload.call_control_id)

      // Generate greeting
      const currentHour = new Date().getHours()
      const timeOfDay = currentHour < 12 ? 'morning' : currentHour < 17 ? 'afternoon' : 'evening'
      
      let greeting = aiConfig.greeting_template || 'Hello! My name is {agent_name}. I am an AI assistant. How can I help you?'
      greeting = greeting
        .replace(/{agent_name}/g, aiConfig.agent_name || 'AI Assistant')
        .replace(/{company_name}/g, aiConfig.company_name || 'our company')
        .replace(/{time_of_day}/g, timeOfDay)

      // Speak greeting through Telnyx TTS
      const speakResponse = await fetch('https://api.telnyx.com/v2/calls/actions/speak', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${telnyxApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          call_control_id: payload.call_control_id,
          payload: greeting,
          voice: 'female',
          language: 'en'
        })
      })

      if (!speakResponse.ok) {
        console.error('TTS error:', await speakResponse.text())
      }

      // Update transcript with greeting
      await supabaseClient
        .from('telnyx_calls')
        .update({
          ai_transcript: `AI: ${greeting}`
        })
        .eq('call_control_id', payload.call_control_id)

      // Start listening after greeting
      setTimeout(async () => {
        await fetch('https://api.telnyx.com/v2/calls/actions/gather_using_audio', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${telnyxApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            call_control_id: payload.call_control_id,
            audio_url: 'silence_stream://1000',
            minimum_digits: 0,
            maximum_digits: 0,
            timeout_millis: 30000,
            inter_digit_timeout_millis: 5000
          })
        })
      }, 5000)
    }

    // Handle call hangup
    else if (event_type === 'call.hangup') {
      console.log('Call ended')
      
      // Update status in database
      await supabaseClient
        .from('telnyx_calls')
        .update({
          call_status: 'completed',
          ended_at: new Date().toISOString()
        })
        .eq('call_control_id', payload.call_control_id)
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json' 
      }
    })

  } catch (error) {
    console.error('Error processing Telnyx webhook:', error)
    
    return new Response(JSON.stringify({
      error: 'Webhook processing failed',
      message: error.message
    }), {
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json' 
      },
      status: 500
    })
  }
})
