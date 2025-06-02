
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
    const speechResult = webhookData.SpeechResult || webhookData.TranscriptionText
    const recordingStatus = webhookData.RecordingStatus

    if (!callSid) {
      console.error('No CallSid found in webhook data')
      return new Response('Missing CallSid', { status: 400 })
    }

    // Handle new incoming call
    if (callStatus === 'ringing' || (!callStatus && from && to)) {
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
      
      return new Response(createGreetingTeXML(greeting), {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/xml' 
        }
      })
    }

    // Handle recording completion or transcription
    if (recordingUrl || speechResult || recordingStatus === 'completed') {
      console.log('Processing recording/speech:', { recordingUrl, speechResult, recordingStatus })

      let userMessage = speechResult || ''
      
      // If we have recording URL but no speech result, transcribe it with OpenAI
      if (recordingUrl && !speechResult) {
        userMessage = await transcribeAudio(recordingUrl, openaiApiKey)
      }

      // Handle empty or unclear input
      if (!userMessage || userMessage.trim().length < 3) {
        console.log('No clear input received, asking again')
        return new Response(createClarificationTeXML(), {
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/xml' 
          }
        })
      }

      // Get business configuration for AI response
      const businessConfig = await getBusinessConfig(supabaseClient)

      // Generate AI response using GPT
      const aiResponse = await generateAIResponse(userMessage, businessConfig, openaiApiKey)

      // Update call record with conversation
      await updateCallStatus(supabaseClient, callSid, 'connected', {
        ai_transcript: `User: ${userMessage}\nAI: ${aiResponse}`
      })

      // Check if user wants to schedule appointment
      const wantsToSchedule = checkForSchedulingIntent(userMessage, aiResponse)

      if (wantsToSchedule) {
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

        return new Response(createAppointmentTeXML(aiResponse), {
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/xml' 
          }
        })
      } else {
        // Continue conversation
        return new Response(createResponseTeXML(aiResponse), {
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
      
      await updateCallStatus(supabaseClient, callSid, 'completed')

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
    
    return new Response(createErrorTeXML(), {
      headers: { ...corsHeaders, 'Content-Type': 'application/xml' },
      status: 200 // Always return 200 for TeXML
    })
  }
})
