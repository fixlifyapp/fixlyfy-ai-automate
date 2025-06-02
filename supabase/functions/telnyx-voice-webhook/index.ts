
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'
import { getBusinessConfig } from './utils/businessConfig.ts'
import { findOrCreatePhoneNumber, logCallToDatabase, updateCallStatus } from './utils/callHandling.ts'
import { transcribeAudio } from './utils/transcription.ts'
import { generateAIResponse, checkForSchedulingIntent } from './utils/aiResponse.ts'
import { 
  createGreetingTeXML, 
  createResponseTeXML, 
  createClarificationTeXML, 
  createErrorTeXML,
  createAppointmentTeXML 
} from './utils/texml.ts'

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
  TranscriptionText?: string;
  RecordingStatus?: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log(`=== Telnyx TeXML Webhook START ===`)
  console.log(`Method: ${req.method}`)
  console.log(`URL: ${req.url}`)
  console.log(`Headers:`, Object.fromEntries(req.headers.entries()))
  
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
      console.log('Method not allowed:', req.method)
      return new Response('Method not allowed', { status: 405 })
    }

    // Parse form data from Telnyx
    const formData = await req.formData()
    const webhookData: TelnyxWebhookData = {}
    
    console.log('=== RAW FORM DATA ===')
    for (const [key, value] of formData.entries()) {
      webhookData[key as keyof TelnyxWebhookData] = value as string
      console.log(`${key}: ${value}`)
    }
    
    console.log('=== PARSED WEBHOOK DATA ===')
    console.log(JSON.stringify(webhookData, null, 2))

    const callSid = webhookData.CallSid
    const from = webhookData.From
    const to = webhookData.To
    const callStatus = webhookData.CallStatus
    const recordingUrl = webhookData.RecordingUrl
    const speechResult = webhookData.SpeechResult || webhookData.TranscriptionText
    const recordingStatus = webhookData.RecordingStatus

    if (!callSid) {
      console.error('No CallSid found in webhook data')
      return new Response('Missing CallSid', { status: 400 })
    }

    console.log(`=== PROCESSING CALL ${callSid} ===`)
    console.log(`Status: ${callStatus}`)
    console.log(`From: ${from} -> To: ${to}`)
    console.log(`Recording URL: ${recordingUrl}`)
    console.log(`Speech Result: ${speechResult}`)
    console.log(`Recording Status: ${recordingStatus}`)

    // Handle new incoming call
    if (callStatus === 'ringing' || (!callStatus && from && to)) {
      console.log('=== NEW INCOMING CALL ===')
      console.log('Processing new incoming call from:', from, 'to:', to)

      // Find or create phone number entry
      const phoneNumberData = await findOrCreatePhoneNumber(supabaseClient, to)

      // Get business configuration
      const businessConfig = await getBusinessConfig(supabaseClient)

      // Log the call in database
      await logCallToDatabase(supabaseClient, callSid, from, to, phoneNumberData)

      // Return TeXML to answer call and start conversation
      const greeting = `Hello! This is ${businessConfig.agent_name} from ${businessConfig.company_name}. How can I help you today?`
      
      console.log('Returning TeXML greeting with company name:', businessConfig.company_name)
      console.log('Greeting:', greeting)
      
      const texmlResponse = createGreetingTeXML(greeting)
      console.log('=== TEXML RESPONSE ===')
      console.log(texmlResponse)
      
      return new Response(texmlResponse, {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/xml' 
        }
      })
    }

    // Handle recording completion or transcription
    if (recordingUrl || speechResult || recordingStatus === 'completed') {
      console.log('=== PROCESSING RECORDING/SPEECH ===')
      console.log('Recording URL:', recordingUrl)
      console.log('Speech Result:', speechResult)
      console.log('Recording Status:', recordingStatus)

      let userMessage = speechResult || ''
      
      // If we have recording URL but no speech result, transcribe it with OpenAI
      if (recordingUrl && !speechResult) {
        console.log('=== TRANSCRIBING WITH OPENAI WHISPER ===')
        userMessage = await transcribeAudio(recordingUrl, openaiApiKey)
        console.log('Transcribed message:', userMessage)
      }

      // Handle empty or unclear input
      if (!userMessage || userMessage.trim().length < 3) {
        console.log('=== NO CLEAR INPUT, ASKING AGAIN ===')
        const clarificationResponse = createClarificationTeXML()
        console.log('Clarification TeXML:', clarificationResponse)
        return new Response(clarificationResponse, {
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/xml' 
          }
        })
      }

      // Get business configuration for AI response
      const businessConfig = await getBusinessConfig(supabaseClient)

      // Generate AI response using GPT
      console.log('=== GENERATING AI RESPONSE ===')
      const aiResponse = await generateAIResponse(userMessage, businessConfig, openaiApiKey)
      console.log('AI Response:', aiResponse)

      // Update call record with conversation
      await updateCallStatus(supabaseClient, callSid, 'connected', {
        ai_transcript: `User: ${userMessage}\nAI: ${aiResponse}`
      })

      // Check if user wants to schedule appointment
      const wantsToSchedule = checkForSchedulingIntent(userMessage, aiResponse)
      console.log('Wants to schedule?', wantsToSchedule)

      if (wantsToSchedule) {
        console.log('=== SCHEDULING FLOW ===')
        // Mark as appointment in progress
        await updateCallStatus(supabaseClient, callSid, 'connected', {
          appointment_scheduled: true,
          appointment_data: { 
            scheduling_in_progress: true, 
            user_message: userMessage,
            company_name: businessConfig.company_name,
            step: 'collecting_contact_info'
          }
        })

        const appointmentResponse = createAppointmentTeXML(aiResponse)
        console.log('Appointment TeXML:', appointmentResponse)
        return new Response(appointmentResponse, {
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/xml' 
          }
        })
      } else {
        console.log('=== CONTINUING CONVERSATION ===')
        // Continue conversation
        const conversationResponse = createResponseTeXML(aiResponse)
        console.log('Conversation TeXML:', conversationResponse)
        return new Response(conversationResponse, {
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/xml' 
          }
        })
      }
    }

    // Handle call completion
    if (callStatus === 'completed' || callStatus === 'hangup') {
      console.log('=== CALL COMPLETED ===')
      console.log('Call completed:', callSid)
      
      await updateCallStatus(supabaseClient, callSid, 'completed')

      return new Response('OK', {
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
      })
    }

    // Default response for unhandled events
    console.log('=== UNHANDLED WEBHOOK EVENT ===')
    console.log('Unhandled webhook data:', webhookData)
    return new Response('OK', {
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
    })

  } catch (error) {
    console.error('=== ERROR IN WEBHOOK ===')
    console.error('Error processing Telnyx TeXML webhook:', error)
    
    const errorResponse = createErrorTeXML()
    console.log('Error TeXML:', errorResponse)
    
    return new Response(errorResponse, {
      headers: { ...corsHeaders, 'Content-Type': 'application/xml' },
      status: 200 // Always return 200 for TeXML
    })
  } finally {
    console.log(`=== Telnyx TeXML Webhook END ===`)
  }
})
