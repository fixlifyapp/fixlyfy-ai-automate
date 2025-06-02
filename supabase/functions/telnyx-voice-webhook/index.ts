
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

interface TelnyxWebhookData {
  CallSid?: string;
  From?: string;
  To?: string;
  CallStatus?: string;
  Direction?: string;
  RecordingUrl?: string;
  RecordingSid?: string;
  Digits?: string;
  SpeechResult?: string;
  AccountSid?: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log(`Telnyx TeXML Webhook: ${req.method} ${req.url}`)
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    
    if (!openaiApiKey) {
      console.error('OPENAI_API_KEY not configured')
      throw new Error('OPENAI_API_KEY not configured')
    }

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    // Parse form data from Telnyx
    const formData = await req.formData()
    const webhookData: TelnyxWebhookData = {}
    
    for (const [key, value] of formData.entries()) {
      webhookData[key as keyof TelnyxWebhookData] = value as string
    }
    
    console.log('Telnyx TeXML webhook data:', JSON.stringify(webhookData, null, 2))

    const callSid = webhookData.CallSid
    const from = webhookData.From
    const to = webhookData.To
    const callStatus = webhookData.CallStatus
    const recordingUrl = webhookData.RecordingUrl
    const speechResult = webhookData.SpeechResult

    if (!callSid) {
      console.error('No CallSid found in webhook data')
      return new Response('Missing CallSid', { status: 400 })
    }

    // Handle new incoming call
    if (callStatus === 'ringing' || (!callStatus && from && to)) {
      console.log('Processing new incoming call from:', from, 'to:', to)

      // Find or create phone number entry
      let phoneNumberData
      const { data: existingNumber } = await supabaseClient
        .from('telnyx_phone_numbers')
        .select('*')
        .eq('phone_number', to)
        .single()

      if (existingNumber) {
        phoneNumberData = existingNumber
        console.log('Found existing phone number data')
      } else {
        console.log('Phone number not found, creating entry for:', to)
        const { data: newNumber, error: createError } = await supabaseClient
          .from('telnyx_phone_numbers')
          .insert({
            phone_number: to,
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

      // Get AI configuration
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
          call_control_id: callSid,
          call_session_id: callSid,
          phone_number: from,
          to_number: to,
          call_status: 'initiated',
          direction: 'incoming',
          started_at: new Date().toISOString(),
          user_id: phoneNumberData?.user_id || null,
          appointment_scheduled: false,
          appointment_data: null
        })
        .select()
        .single()

      if (logError && logError.code !== '23505') { // Ignore duplicate key errors
        console.error('Error logging call to database:', logError)
      } else {
        console.log('Call logged to database successfully')
      }

      // Return TeXML to answer call and start conversation
      const greeting = `Hello! This is ${aiConfig.agent_name} from ${aiConfig.company_name}. How can I help you today?`
      
      const texml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">${greeting}</Say>
    <Record 
        action="https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-voice-webhook"
        method="POST"
        maxLength="30"
        finishOnKey="#"
        timeout="5"
        transcribe="true"
        transcribeCallback="https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-voice-webhook"
    />
</Response>`

      console.log('Returning TeXML greeting:', texml)
      
      return new Response(texml, {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/xml' 
        }
      })
    }

    // Handle recording/transcription callback
    if (recordingUrl || speechResult) {
      console.log('Processing recording/speech:', { recordingUrl, speechResult })

      let userMessage = speechResult || ''
      
      // If we have recording URL but no speech result, we need to transcribe it
      if (recordingUrl && !speechResult) {
        try {
          console.log('Transcribing recording from URL:', recordingUrl)
          
          // Download the recording
          const recordingResponse = await fetch(recordingUrl)
          const audioBuffer = await recordingResponse.arrayBuffer()
          
          // Transcribe with OpenAI Whisper
          const formData = new FormData()
          const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' })
          formData.append('file', audioBlob, 'recording.wav')
          formData.append('model', 'whisper-1')

          const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openaiApiKey}`,
            },
            body: formData,
          })

          if (transcriptionResponse.ok) {
            const transcription = await transcriptionResponse.json()
            userMessage = transcription.text || ''
            console.log('Transcribed message:', userMessage)
          } else {
            console.error('Transcription failed:', await transcriptionResponse.text())
            userMessage = 'Sorry, I could not understand what you said.'
          }
        } catch (error) {
          console.error('Error transcribing recording:', error)
          userMessage = 'Sorry, I had trouble processing your message.'
        }
      }

      if (!userMessage.trim()) {
        // No input received, ask again
        const texml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">I didn't catch that. Could you please repeat what you need help with?</Say>
    <Record 
        action="https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-voice-webhook"
        method="POST"
        maxLength="30"
        finishOnKey="#"
        timeout="5"
        transcribe="true"
        transcribeCallback="https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-voice-webhook"
    />
</Response>`

        return new Response(texml, {
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/xml' 
          }
        })
      }

      // Get AI config for this call
      const { data: aiConfigs } = await supabaseClient
        .from('ai_agent_configs')
        .select('*')
        .eq('is_active', true)
        .limit(1)

      let aiConfig = aiConfigs?.[0]
      if (!aiConfig) {
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

      // Generate AI response using GPT
      const systemPrompt = `You are ${aiConfig.agent_name} for ${aiConfig.company_name}, a ${aiConfig.business_niche} business.

IMPORTANT INSTRUCTIONS:
1. Be helpful, professional, and conversational
2. If they need service, offer to schedule an appointment
3. Ask for their name, phone number, and what service they need
4. Keep responses under 100 words for phone conversation
5. If they want to schedule, say you'll transfer them to book the appointment

Your diagnostic service costs $${aiConfig.diagnostic_price} with a $${aiConfig.emergency_surcharge} emergency surcharge for after-hours calls.

Service areas: ${aiConfig.service_areas?.join(', ') || 'All areas'}
Services offered: ${aiConfig.service_types?.join(', ') || 'HVAC, Plumbing, Electrical, General Repair'}

${aiConfig.custom_prompt_additions || ''}`

      try {
        const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userMessage }
            ],
            temperature: 0.7,
            max_tokens: 200
          })
        })

        let aiResponse = "I'm sorry, I'm having trouble right now. Please try calling back in a few minutes."
        
        if (gptResponse.ok) {
          const gptData = await gptResponse.json()
          aiResponse = gptData.choices[0]?.message?.content || aiResponse
          console.log('AI Response:', aiResponse)
        } else {
          console.error('GPT API error:', await gptResponse.text())
        }

        // Update call record with conversation
        await supabaseClient
          .from('telnyx_calls')
          .update({
            ai_transcript: `User: ${userMessage}\nAI: ${aiResponse}`,
            call_status: 'connected'
          })
          .eq('call_control_id', callSid)

        // Check if user wants to schedule appointment
        const scheduleKeywords = ['schedule', 'appointment', 'book', 'when can', 'available', 'come out']
        const wantsToSchedule = scheduleKeywords.some(keyword => 
          userMessage.toLowerCase().includes(keyword) || aiResponse.toLowerCase().includes('schedule')
        )

        if (wantsToSchedule) {
          // End call with scheduling message
          const texml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">${aiResponse} Please hold while I connect you to our scheduling system. Thank you for calling!</Say>
    <Hangup/>
</Response>`

          // Mark as appointment scheduled
          await supabaseClient
            .from('telnyx_calls')
            .update({
              appointment_scheduled: true,
              appointment_data: { needs_scheduling: true, user_message: userMessage },
              call_status: 'completed'
            })
            .eq('call_control_id', callSid)

          return new Response(texml, {
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/xml' 
            }
          })
        } else {
          // Continue conversation
          const texml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">${aiResponse}</Say>
    <Record 
        action="https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-voice-webhook"
        method="POST"
        maxLength="30"
        finishOnKey="#"
        timeout="5"
        transcribe="true"
        transcribeCallback="https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-voice-webhook"
    />
</Response>`

          return new Response(texml, {
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/xml' 
            }
          })
        }

      } catch (error) {
        console.error('Error generating AI response:', error)
        
        const texml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">I'm sorry, I'm having technical difficulties. Please try calling back later. Thank you!</Say>
    <Hangup/>
</Response>`

        return new Response(texml, {
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/xml' 
          }
        })
      }
    }

    // Handle call completion
    if (callStatus === 'completed' || callStatus === 'hangup') {
      console.log('Call completed:', callSid)
      
      await supabaseClient
        .from('telnyx_calls')
        .update({
          call_status: 'completed',
          ended_at: new Date().toISOString()
        })
        .eq('call_control_id', callSid)

      return new Response('OK', {
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
      })
    }

    // Default response for unhandled events
    console.log('Unhandled webhook event:', webhookData)
    return new Response('OK', {
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
    })

  } catch (error) {
    console.error('Error processing Telnyx TeXML webhook:', error)
    
    // Return error TeXML
    const errorTexml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">I'm sorry, we're experiencing technical difficulties. Please try calling back later.</Say>
    <Hangup/>
</Response>`

    return new Response(errorTexml, {
      headers: { ...corsHeaders, 'Content-Type': 'application/xml' },
      status: 200 // Always return 200 for TeXML
    })
  }
})
