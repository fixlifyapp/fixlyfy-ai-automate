
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CallRequest {
  action: 'initiate' | 'answer' | 'hangup' | 'status';
  fromNumber?: string;
  toNumber?: string;
  callSid?: string;
}

serve(async (req) => {
  console.log(`${req.method} ${req.url}`)
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER')

    if (!twilioAccountSid || !twilioAuthToken) {
      return new Response(JSON.stringify({ 
        error: 'Twilio credentials not configured' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    const twilioAuth = btoa(`${twilioAccountSid}:${twilioAuthToken}`)

    if (req.method === 'POST') {
      const contentType = req.headers.get('content-type') || ''
      
      if (contentType.includes('application/x-www-form-urlencoded')) {
        // Handle Twilio webhook
        return await handleTwilioWebhook(req, supabaseClient)
      } else {
        // Handle API requests
        const body: CallRequest = await req.json()
        return await handleCallAction(body, twilioAuth, supabaseClient, twilioPhoneNumber)
      }
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405,
    })
  } catch (error) {
    console.error('Error in twilio-calls:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

async function handleCallAction(params: CallRequest, twilioAuth: string, supabaseClient: any, twilioPhoneNumber: string) {
  const { action, fromNumber, toNumber, callSid } = params

  switch (action) {
    case 'initiate':
      return await initiateCall(fromNumber || twilioPhoneNumber, toNumber!, twilioAuth, supabaseClient)
    case 'hangup':
      return await hangupCall(callSid!, twilioAuth, supabaseClient)
    case 'status':
      return await getCallStatus(callSid!, twilioAuth)
    default:
      return new Response(JSON.stringify({ error: 'Invalid action' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
  }
}

async function initiateCall(fromNumber: string, toNumber: string, twilioAuth: string, supabaseClient: any) {
  try {
    console.log(`Initiating call from ${fromNumber} to ${toNumber}`)
    
    // Create call via Twilio API
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${Deno.env.get('TWILIO_ACCOUNT_SID')}/Calls.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${twilioAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: fromNumber,
        To: toNumber,
        Url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/twilio-calls/webhook`,
        StatusCallback: `${Deno.env.get('SUPABASE_URL')}/functions/v1/twilio-calls/status`,
        StatusCallbackEvent: 'initiated,ringing,answered,completed',
        Record: 'false'
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Twilio API error:', error)
      throw new Error(`Failed to initiate call: ${error}`)
    }

    const callData = await response.json()
    console.log('Call initiated:', callData)

    // Store call in database
    const { error: dbError } = await supabaseClient
      .from('calls')
      .insert({
        call_sid: callData.sid,
        phone_number: toNumber,
        direction: 'outgoing',
        status: callData.status,
        started_at: new Date().toISOString(),
      })

    if (dbError) {
      console.error('Error storing call:', dbError)
    }

    return new Response(JSON.stringify({ 
      success: true,
      callSid: callData.sid,
      status: callData.status 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error initiating call:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
}

async function hangupCall(callSid: string, twilioAuth: string, supabaseClient: any) {
  try {
    console.log(`Hanging up call: ${callSid}`)
    
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${Deno.env.get('TWILIO_ACCOUNT_SID')}/Calls/${callSid}.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${twilioAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        Status: 'completed',
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to hangup call: ${error}`)
    }

    // Update call status in database
    const { error: dbError } = await supabaseClient
      .from('calls')
      .update({ 
        status: 'completed',
        ended_at: new Date().toISOString()
      })
      .eq('call_sid', callSid)

    if (dbError) {
      console.error('Error updating call status:', dbError)
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error hanging up call:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
}

async function getCallStatus(callSid: string, twilioAuth: string) {
  try {
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${Deno.env.get('TWILIO_ACCOUNT_SID')}/Calls/${callSid}.json`, {
      headers: {
        'Authorization': `Basic ${twilioAuth}`,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to get call status: ${error}`)
    }

    const callData = await response.json()
    
    return new Response(JSON.stringify({ 
      success: true,
      status: callData.status,
      duration: callData.duration
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error getting call status:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
}

async function handleTwilioWebhook(req: Request, supabaseClient: any) {
  try {
    const formData = await req.formData()
    const callSid = formData.get('CallSid')
    const from = formData.get('From')
    const to = formData.get('To')
    const callStatus = formData.get('CallStatus')
    const direction = formData.get('Direction')

    console.log('Twilio webhook received:', { 
      callSid, 
      from, 
      to, 
      callStatus, 
      direction,
      url: req.url 
    })

    // Handle incoming calls by storing them and triggering real-time updates
    if (direction === 'inbound' && callStatus === 'ringing') {
      const { error: dbError } = await supabaseClient
        .from('calls')
        .insert({
          call_sid: callSid,
          phone_number: from,
          direction: 'incoming',
          status: 'ringing',
          started_at: new Date().toISOString(),
        })

      if (dbError) {
        console.error('Error storing incoming call:', dbError)
      }
    } else {
      // Update existing call status
      const { error: dbError } = await supabaseClient
        .from('calls')
        .update({
          status: callStatus,
          ...(callStatus === 'completed' && { ended_at: new Date().toISOString() })
        })
        .eq('call_sid', callSid)

      if (dbError) {
        console.error('Error updating call status:', dbError)
      }
    }

    // Generate TwiML response for call handling
    const twiml = generateTwiML(callStatus, direction)

    return new Response(twiml, {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/xml' 
      },
    })
  } catch (error) {
    console.error('Error handling webhook:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
}

function generateTwiML(callStatus: string, direction: string) {
  if (direction === 'inbound') {
    return `<?xml version="1.0" encoding="UTF-8"?>
    <Response>
      <Say voice="alice">Thank you for calling. Please hold while we connect you to an available representative.</Say>
      <Play>https://www.soundjay.com/misc/sounds/bell-ringing-05.wav</Play>
      <Pause length="2"/>
      <Say voice="alice">We will be with you shortly.</Say>
    </Response>`
  }
  
  return `<?xml version="1.0" encoding="UTF-8"?>
  <Response>
    <Say voice="alice">Call connected successfully.</Say>
  </Response>`
}
