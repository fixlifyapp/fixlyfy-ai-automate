
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

interface VoiceCallRequest {
  CallSid: string;
  From: string;
  To: string;
  CallStatus: string;
  Direction: string;
  ForwardedFrom?: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log(`Incoming request: ${req.method} ${req.url}`)
  
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

    const formData = await req.formData()
    const callData: VoiceCallRequest = {
      CallSid: formData.get('CallSid') as string,
      From: formData.get('From') as string,
      To: formData.get('To') as string,
      CallStatus: formData.get('CallStatus') as string,
      Direction: formData.get('Direction') as string,
      ForwardedFrom: formData.get('ForwardedFrom') as string || undefined,
    }

    console.log('Incoming voice call data:', JSON.stringify(callData, null, 2))

    // Find the phone number configuration - check both formats
    const phoneToCheck = callData.To
    console.log('Looking for phone number:', phoneToCheck)
    
    // First, try to find any active AI config for any user (for testing)
    const { data: aiConfigs, error: configError } = await supabaseClient
      .from('ai_agent_configs')
      .select('*')
      .eq('is_active', true)
      .limit(1)

    if (configError) {
      console.error('Error fetching AI configs:', configError)
    }

    let aiConfig = aiConfigs?.[0]
    console.log('Found AI config:', aiConfig ? 'Yes' : 'No', aiConfig?.id)

    if (!aiConfig) {
      console.log('No active AI config found, using default settings')
      aiConfig = {
        business_niche: 'General Service',
        diagnostic_price: 75,
        emergency_surcharge: 50,
        custom_prompt_additions: '',
        is_active: true
      }
    }

    // Log the incoming call
    try {
      const { error: logError } = await supabaseClient
        .from('ai_dispatcher_call_logs')
        .insert({
          phone_number_id: '00000000-0000-0000-0000-000000000000', // Placeholder for test
          contact_id: callData.CallSid,
          customer_phone: callData.From,
          client_phone: callData.From,
          call_started_at: new Date().toISOString(),
          customer_intent: 'initial_call',
          call_status: callData.CallStatus
        })
      
      if (logError) {
        console.error('Error logging call:', logError)
      } else {
        console.log('Call logged successfully')
      }
    } catch (logErr) {
      console.error('Failed to log call:', logErr)
    }

    // Generate AI greeting based on configuration
    const businessType = aiConfig.business_niche || 'service'
    const greeting = `Hello! Thanks for calling our ${businessType} company. I'm your AI assistant and I'm here to help with your service needs. How can I assist you today?`

    console.log('Generated greeting:', greeting)

    // Create TwiML response for AI voice interaction
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">${greeting}</Say>
    <Gather input="speech" action="${Deno.env.get('SUPABASE_URL')}/functions/v1/process-ai-speech" method="POST" speechTimeout="3" timeout="10">
        <Say voice="alice">Please tell me what you need help with.</Say>
    </Gather>
    <Say voice="alice">I didn't hear anything. Please hold while I connect you to a team member.</Say>
    <Pause length="2"/>
    <Say voice="alice">Thank you for calling. Goodbye.</Say>
    <Hangup/>
</Response>`

    console.log('Generated TwiML:', twiml)

    return new Response(twiml, {
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/xml' 
      }
    })

  } catch (error) {
    console.error('Error handling voice call:', error)
    
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">Thank you for calling. I'm sorry, but I'm having technical difficulties right now. Please try calling again in a few minutes or contact us through our website.</Say>
    <Hangup/>
</Response>`

    return new Response(errorTwiml, {
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/xml' 
      },
      status: 500
    })
  }
})
