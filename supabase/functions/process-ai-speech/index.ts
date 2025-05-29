
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

interface SpeechProcessRequest {
  CallSid: string;
  From: string;
  To: string;
  SpeechResult: string;
  Confidence: string;
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
    const speechData: SpeechProcessRequest = {
      CallSid: formData.get('CallSid') as string,
      From: formData.get('From') as string,
      To: formData.get('To') as string,
      SpeechResult: formData.get('SpeechResult') as string,
      Confidence: formData.get('Confidence') as string,
    }

    console.log('Processing speech:', speechData)

    // Get phone number and AI config
    const { data: phoneNumber } = await supabaseClient
      .from('phone_numbers')
      .select('*, ai_dispatcher_configs(*)')
      .eq('phone_number', speechData.To)
      .single()

    const aiConfig = phoneNumber?.ai_dispatcher_configs?.[0]
    if (!aiConfig) {
      return new Response(generateTwiMLResponse('Sorry, AI service is not available.'), {
        headers: { 'Content-Type': 'text/xml' }
      })
    }

    // Analyze customer intent using OpenAI
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant for ${aiConfig.business_name}, a ${aiConfig.business_type} company. 
            
            Analyze the customer's request and respond appropriately. Your pricing is:
            - Diagnostic fee: $${aiConfig.diagnostic_fee}
            - Emergency surcharge: $${aiConfig.emergency_surcharge}
            - Hourly rate: $${aiConfig.hourly_rate}
            
            If it's an emergency and emergency detection is enabled (${aiConfig.emergency_detection_enabled}), transfer immediately.
            
            Always be helpful, professional, and try to schedule an appointment if appropriate.
            Keep responses under 100 words for phone calls.
            
            Determine the intent: emergency, appointment_request, quote_request, general_inquiry, or transfer_needed.`
          },
          {
            role: 'user',
            content: speechData.SpeechResult
          }
        ],
        max_tokens: 200,
        temperature: 0.7
      })
    })

    const aiResponse = await openaiResponse.json()
    const responseText = aiResponse.choices?.[0]?.message?.content || 'I apologize, but I need to transfer you to a team member who can better assist you.'

    // Determine if this is an emergency
    const isEmergency = speechData.SpeechResult.toLowerCase().includes('emergency') || 
                       speechData.SpeechResult.toLowerCase().includes('urgent') ||
                       speechData.SpeechResult.toLowerCase().includes('flooding') ||
                       speechData.SpeechResult.toLowerCase().includes('no heat')

    // Update call log with customer intent
    await supabaseClient
      .from('ai_dispatcher_call_logs')
      .update({
        customer_intent: isEmergency ? 'emergency' : 'general_inquiry',
        successful_resolution: !isEmergency
      })
      .eq('contact_id', speechData.CallSid)

    let twiml: string

    if (isEmergency && aiConfig.emergency_detection_enabled) {
      // Transfer immediately for emergencies
      twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="${aiConfig.voice_selection || 'nova'}">I understand this is an emergency. Let me connect you to our emergency dispatch right away.</Say>
    <Dial>${Deno.env.get('EMERGENCY_PHONE_NUMBER') || Deno.env.get('BACKUP_PHONE_NUMBER') || '+1234567890'}</Dial>
</Response>`
    } else {
      // Continue AI conversation
      twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="${aiConfig.voice_selection || 'nova'}">${responseText}</Say>
    <Gather input="speech" action="/functions/v1/process-ai-speech" method="POST" speechTimeout="3" timeout="10">
        <Say voice="${aiConfig.voice_selection || 'nova'}">Is there anything else I can help you with?</Say>
    </Gather>
    <Say voice="${aiConfig.voice_selection || 'nova'}">Thank you for calling. Have a great day!</Say>
    <Hangup/>
</Response>`
    }

    return new Response(twiml, {
      headers: { 'Content-Type': 'text/xml' }
    })

  } catch (error) {
    console.error('Error processing speech:', error)
    return new Response(generateTwiMLResponse('Let me transfer you to a team member.'), {
      headers: { 'Content-Type': 'text/xml' }
    })
  }
})

function generateTwiMLResponse(message: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="nova">${message}</Say>
    <Dial>${Deno.env.get('BACKUP_PHONE_NUMBER') || '+1234567890'}</Dial>
</Response>`
}
