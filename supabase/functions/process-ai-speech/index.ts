
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

interface SpeechProcessRequest {
  contactId: string;
  customerNumber: string;
  instanceId: string;
  speechResult: string;
  confidence: number;
  attributes?: Record<string, string>;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log(`Amazon Connect speech processing: ${req.method} ${req.url}`)
  
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

    const speechData: SpeechProcessRequest = await req.json()
    console.log('Processing Amazon Connect speech data:', JSON.stringify(speechData, null, 2))

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
    const speech = speechData.speechResult?.toLowerCase() || ''
    let responseText = ''
    let isEmergency = false
    let nextAction = 'CONTINUE_CONVERSATION'

    // Check for emergency keywords
    if (speech.includes('emergency') || speech.includes('urgent') || speech.includes('flooding') || speech.includes('no heat') || speech.includes('broken')) {
      isEmergency = true
      nextAction = 'TRANSFER_TO_AGENT'
      responseText = `I understand this is an emergency. Our emergency service fee is $${aiConfig.emergency_surcharge} plus our standard diagnostic fee of $${aiConfig.diagnostic_price}. Let me connect you to our emergency dispatch right away.`
    } else if (speech.includes('appointment') || speech.includes('schedule') || speech.includes('book')) {
      responseText = `I'd be happy to help you schedule an appointment. Our diagnostic fee is $${aiConfig.diagnostic_price}. Let me transfer you to our scheduling team who can check availability and book your appointment.`
      nextAction = 'TRANSFER_TO_AGENT'
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
            nextAction = 'TRANSFER_TO_AGENT'
          }
        } catch (error) {
          console.error('Error calling OpenAI:', error)
          responseText = 'I understand. Let me connect you with a team member who can help you.'
          nextAction = 'TRANSFER_TO_AGENT'
        }
      } else {
        responseText = 'Thank you for calling. Let me transfer you to a team member who can assist you with your request.'
        nextAction = 'TRANSFER_TO_AGENT'
      }
    }

    // Update Amazon Connect call log with customer intent
    try {
      await supabaseClient
        .from('amazon_connect_calls')
        .update({
          appointment_scheduled: !isEmergency && (speech.includes('appointment') || speech.includes('schedule')),
          ai_transcript: `Customer said: "${speechData.speechResult}" | AI responded: "${responseText}"`,
          call_status: isEmergency ? 'emergency_transfer' : 'ai_handled',
          ended_at: nextAction === 'TRANSFER_TO_AGENT' ? new Date().toISOString() : undefined
        })
        .eq('contact_id', speechData.contactId)
    } catch (updateError) {
      console.error('Error updating Amazon Connect call log:', updateError)
    }

    const connectResponse = {
      statusCode: 200,
      body: JSON.stringify({
        response: responseText,
        nextAction: nextAction,
        isEmergency: isEmergency,
        speechConfig: nextAction === 'CONTINUE_CONVERSATION' ? {
          timeout: 8,
          endSilenceTimeout: 3,
          maxSpeechDuration: 30
        } : undefined
      })
    }

    console.log('Generated Amazon Connect response:', connectResponse)

    return new Response(JSON.stringify(connectResponse), {
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json' 
      }
    })

  } catch (error) {
    console.error('Error processing Amazon Connect speech:', error)
    
    const errorResponse = {
      statusCode: 500,
      body: JSON.stringify({
        response: 'I apologize, but I\'m having technical difficulties. Let me transfer you to a team member.',
        nextAction: 'TRANSFER_TO_AGENT'
      })
    }

    return new Response(JSON.stringify(errorResponse), {
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json' 
      }
    })
  }
})
