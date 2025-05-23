
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CallRequest {
  action: 'initiate' | 'answer' | 'hangup' | 'webhook';
  phoneNumber?: string;
  fromNumber?: string;
  toNumber?: string;
  callSid?: string;
}

serve(async (req) => {
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
        return await handleCallAction(body, twilioAuth, supabaseClient)
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

async function handleCallAction(params: CallRequest, twilioAuth: string, supabaseClient: any) {
  const { action, phoneNumber, fromNumber, toNumber, callSid } = params

  switch (action) {
    case 'initiate':
      return await initiateCall(fromNumber!, toNumber!, twilioAuth, supabaseClient)
    case 'hangup':
      return await hangupCall(callSid!, twilioAuth, supabaseClient)
    default:
      return new Response(JSON.stringify({ error: 'Invalid action' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
  }
}

async function initiateCall(fromNumber: string, toNumber: string, twilioAuth: string, supabaseClient: any) {
  try {
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
        Url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/twilio-calls?action=webhook`,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to initiate call: ${error}`)
    }

    const callData = await response.json()

    // Store call in database
    const { error: dbError } = await supabaseClient
      .from('calls')
      .insert({
        phone_number: toNumber,
        direction: 'outgoing',
        status: 'initiated',
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

async function handleTwilioWebhook(req: Request, supabaseClient: any) {
  try {
    const formData = await req.formData()
    const callSid = formData.get('CallSid')
    const from = formData.get('From')
    const to = formData.get('To')
    const callStatus = formData.get('CallStatus')
    const direction = formData.get('Direction')

    console.log('Twilio webhook:', { callSid, from, to, callStatus, direction })

    // Store or update call in database
    const { error: dbError } = await supabaseClient
      .from('calls')
      .upsert({
        phone_number: from,
        direction: direction === 'inbound' ? 'incoming' : 'outgoing',
        status: callStatus,
        started_at: new Date().toISOString(),
      }, {
        onConflict: 'phone_number,started_at'
      })

    if (dbError) {
      console.error('Error storing webhook call:', dbError)
    }

    // Generate TwiML response
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
    <Response>
      <Say>Hello! You have reached our system. Please hold while we connect you.</Say>
      <Dial timeout="30">
        <Number>${to}</Number>
      </Dial>
    </Response>`

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
