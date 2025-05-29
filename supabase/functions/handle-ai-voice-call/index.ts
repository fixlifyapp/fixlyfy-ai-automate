
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

serve(async (req) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (req.method !== 'POST') {
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

    console.log('Incoming voice call:', callData)

    // Find the phone number configuration
    const { data: phoneNumber, error: phoneError } = await supabaseClient
      .from('phone_numbers')
      .select('*, ai_dispatcher_configs(*)')
      .eq('phone_number', callData.To)
      .eq('ai_dispatcher_enabled', true)
      .single()

    if (phoneError || !phoneNumber) {
      console.log('No AI-enabled phone number found, forwarding to human')
      return new Response(generateTwiMLResponse('Sorry, this number is not configured for AI assistance. Please try again later.'), {
        headers: { 'Content-Type': 'text/xml' }
      })
    }

    const aiConfig = phoneNumber.ai_dispatcher_configs?.[0]
    if (!aiConfig) {
      console.log('No AI config found')
      return new Response(generateTwiMLResponse('AI service is temporarily unavailable.'), {
        headers: { 'Content-Type': 'text/xml' }
      })
    }

    // Log the incoming call
    await supabaseClient
      .from('ai_dispatcher_call_logs')
      .insert({
        phone_number_id: phoneNumber.id,
        contact_id: callData.CallSid,
        customer_phone: callData.From,
        call_started_at: new Date().toISOString(),
        customer_intent: 'initial_call'
      })

    // Generate AI greeting based on configuration
    const greeting = aiConfig.business_greeting || 
      `Hello! Thanks for calling ${aiConfig.business_name || 'our service'}. I'm your AI assistant and I'm here to help with your ${aiConfig.business_type || 'service'} needs. How can I assist you today?`

    // Create TwiML response for AI voice interaction
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="${aiConfig.voice_selection || 'nova'}">${greeting}</Say>
    <Gather input="speech" action="/functions/v1/process-ai-speech" method="POST" speechTimeout="3" timeout="10">
        <Say voice="${aiConfig.voice_selection || 'nova'}">Please tell me what you need help with.</Say>
    </Gather>
    <Say voice="${aiConfig.voice_selection || 'nova'}">I didn't hear anything. Let me transfer you to a team member.</Say>
    <Dial>${Deno.env.get('BACKUP_PHONE_NUMBER') || '+1234567890'}</Dial>
</Response>`

    return new Response(twiml, {
      headers: { 'Content-Type': 'text/xml' }
    })

  } catch (error) {
    console.error('Error handling voice call:', error)
    return new Response(generateTwiMLResponse('Sorry, there was an error. Please try again.'), {
      headers: { 'Content-Type': 'text/xml' },
      status: 500
    })
  }
})

function generateTwiMLResponse(message: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="nova">${message}</Say>
</Response>`
}
