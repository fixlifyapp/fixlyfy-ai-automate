
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'
import { getBusinessConfig } from './utils/businessConfig.ts'
import { findOrCreatePhoneNumber, logCallToDatabase, updateCallStatus } from './utils/callHandling.ts'

interface TelnyxWebhookData {
  CallSid?: string;
  From?: string;
  To?: string;
  CallStatus?: string;
  Direction?: string;
  AccountSid?: string;
  ConnectionId?: string;
  [key: string]: any;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const createRealtimeTeXML = (websocketUrl: string): string => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">Hello! Connecting you to our AI assistant. Please hold on.</Say>
    <Stream url="${websocketUrl}" />
</Response>`
}

serve(async (req) => {
  console.log(`=== Telnyx Realtime Webhook START ===`)
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
    const connectionId = webhookData.ConnectionId

    if (!callSid) {
      console.error('No CallSid found in webhook data')
      return new Response('Missing CallSid', { status: 400 })
    }

    console.log(`=== PROCESSING CALL ${callSid} ===`)
    console.log(`Status: ${callStatus}`)
    console.log(`From: ${from} -> To: ${to}`)
    console.log(`Connection ID: ${connectionId}`)

    // Handle new incoming call
    if (callStatus === 'ringing' || (!callStatus && from && to)) {
      console.log('=== NEW INCOMING CALL - REALTIME MODE ===')
      console.log('Setting up realtime voice connection...')

      // Find or create phone number entry
      const phoneNumberData = await findOrCreatePhoneNumber(supabaseClient, to)

      // Get business configuration
      const businessConfig = await getBusinessConfig(supabaseClient)

      // Log the call in database
      await logCallToDatabase(supabaseClient, callSid, from, to, phoneNumberData)

      // Create WebSocket URL for real-time connection
      const websocketUrl = `wss://mqppvcrlvsgrsqelglod.functions.supabase.co/realtime-voice-dispatch`
      
      console.log('Returning TeXML for realtime connection')
      console.log('WebSocket URL:', websocketUrl)
      
      const texmlResponse = createRealtimeTeXML(websocketUrl)
      console.log('=== REALTIME TEXML RESPONSE ===')
      console.log(texmlResponse)
      
      return new Response(texmlResponse, {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/xml' 
        }
      })
    }

    // Handle call events (media, connected, etc.)
    if (callStatus === 'connected' || webhookData.Event === 'media') {
      console.log('=== CALL MEDIA/CONNECTED EVENT ===')
      
      await updateCallStatus(supabaseClient, callSid, 'connected', {
        connection_id: connectionId,
        realtime_mode: true
      })

      return new Response('OK', {
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
      })
    }

    // Handle call completion
    if (callStatus === 'completed' || callStatus === 'hangup') {
      console.log('=== CALL COMPLETED ===')
      console.log('Call completed:', callSid)
      
      await updateCallStatus(supabaseClient, callSid, 'completed', {
        ended_at: new Date().toISOString()
      })

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
    console.error('=== ERROR IN REALTIME WEBHOOK ===')
    console.error('Error processing Telnyx realtime webhook:', error)
    
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  } finally {
    console.log(`=== Telnyx Realtime Webhook END ===`)
  }
})
