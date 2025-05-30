
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

interface SpeechProcessRequest {
  CallSid: string;
  From: string;
  To: string;
  SpeechResult: string;
  Confidence: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log(`Speech processing request: ${req.method} ${req.url}`)
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

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

    console.log('Processing speech data:', JSON.stringify(speechData, null, 2))

    // Get AI config
    const { data: aiConfigs } = await supabaseClient
      .from('ai_agent_configs')
      .select('*')
      .eq('is_active', true)
      .limit(1)

    const aiConfig = aiConfigs?.[0] || {
      business_niche: 'General Service',
      diagnostic_price: 75,
      emergency_surcharge: 50,
      custom_prompt_additions: ''
    }

    console.log('Using AI config for speech processing')

    // Simple keyword-based response for testing
    const speech = speechData.SpeechResult?.toLowerCase() || ''
    let responseText = ''
    let isEmergency = false

    // Check for emergency keywords
    if (speech.includes('emergency') || speech.includes('urgent') || speech.includes('flooding') || speech.includes('no heat') || speech.includes('broken')) {
      isEmergency = true
      responseText = `I understand this is an emergency. Our emergency service fee is $${aiConfig.emergency_surcharge} plus our standard diagnostic fee of $${aiConfig.diagnostic_price}. Let me connect you to our emergency dispatch right away.`
    } else if (speech.includes('appointment') || speech.includes('schedule') || speech.includes('book')) {
      responseText = `I'd be happy to help you schedule an appointment. Our diagnostic fee is $${aiConfig.diagnostic_price}. Let me transfer you to our scheduling team who can check availability and book your appointment.`
    } else if (speech.includes('price') || speech.includes('cost') || speech.includes('quote')) {
      responseText = `Our standard diagnostic fee is $${aiConfig.diagnostic_price}. For emergency services, there's an additional surcharge of $${aiConfig.emergency_surcharge}. Would you like to schedule a diagnostic visit?`
    } else if (speech.includes('hello') || speech.includes('hi') || speech.includes('help')) {
      responseText = `Hello! I'm here to help with your ${aiConfig.business_niche} needs. Are you looking to schedule a service appointment, or do you have an emergency situation?`
    } else {
      // Use OpenAI if available
      const openaiKey = Deno.env.get('OPENAI_API_KEY')
      if (openaiKey && speech.length > 0) {
        try {
          console.log('Calling OpenAI for speech:', speech)
          const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openaiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                {
                  role: 'system',
                  content: `You are an AI assistant for a ${aiConfig.business_niche} company. 
                  
                  Your pricing is:
                  - Diagnostic fee: $${aiConfig.diagnostic_price}
                  - Emergency surcharge: $${aiConfig.emergency_surcharge}
                  
                  Always be helpful, professional, and try to schedule an appointment if appropriate.
                  Keep responses under 50 words for phone calls.
                  
                  ${aiConfig.custom_prompt_additions || ''}
                  
                  If it's an emergency, mention transferring to emergency dispatch.`
                },
                {
                  role: 'user',
                  content: speech
                }
              ],
              max_tokens: 150,
              temperature: 0.7
            })
          })

          if (openaiResponse.ok) {
            const aiResponse = await openaiResponse.json()
            responseText = aiResponse.choices?.[0]?.message?.content || 'I understand. Let me transfer you to a team member who can better assist you.'
            console.log('OpenAI response:', responseText)
          } else {
            console.error('OpenAI API error:', openaiResponse.status)
            responseText = 'I understand your request. Let me transfer you to a team member who can help you with that.'
          }
        } catch (error) {
          console.error('Error calling OpenAI:', error)
          responseText = 'I understand. Let me connect you with a team member who can help you.'
        }
      } else {
        responseText = 'Thank you for calling. Let me transfer you to a team member who can assist you with your request.'
      }
    }

    // Update call log with customer intent
    try {
      await supabaseClient
        .from('ai_dispatcher_call_logs')
        .update({
          customer_intent: isEmergency ? 'emergency' : 'general_inquiry',
          successful_resolution: !isEmergency,
          ai_transcript: `Customer said: "${speechData.SpeechResult}" | AI responded: "${responseText}"`
        })
        .eq('contact_id', speechData.CallSid)
    } catch (updateError) {
      console.error('Error updating call log:', updateError)
    }

    let twiml: string

    if (isEmergency) {
      // Transfer immediately for emergencies
      twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">${responseText}</Say>
    <Pause length="1"/>
    <Say voice="alice">Please hold while I connect you now.</Say>
    <Hangup/>
</Response>`
    } else {
      // Continue AI conversation
      twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">${responseText}</Say>
    <Gather input="speech" action="${Deno.env.get('SUPABASE_URL')}/functions/v1/process-ai-speech" method="POST" speechTimeout="3" timeout="8">
        <Say voice="alice">Is there anything else I can help you with?</Say>
    </Gather>
    <Say voice="alice">Thank you for calling. Have a great day!</Say>
    <Hangup/>
</Response>`
    }

    console.log('Generated response TwiML:', twiml)

    return new Response(twiml, {
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/xml' 
      }
    })

  } catch (error) {
    console.error('Error processing speech:', error)
    
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">I'm having trouble processing your request. Let me transfer you to a team member.</Say>
    <Hangup/>
</Response>`

    return new Response(errorTwiml, {
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/xml' 
      }
    })
  }
})
