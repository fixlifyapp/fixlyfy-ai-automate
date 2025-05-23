
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { automationId, triggerData, actionType, actionConfig } = await req.json()

    console.log('Executing automation:', { automationId, actionType })

    let result

    switch (actionType) {
      case 'sms':
        result = await executeSMSAction(actionConfig, triggerData)
        break
      case 'call':
        result = await executeCallAction(actionConfig, triggerData)
        break
      case 'email':
        result = await executeEmailAction(actionConfig, triggerData)
        break
      default:
        result = { success: false, error: `Unknown action type: ${actionType}` }
    }

    return new Response(JSON.stringify({
      success: true,
      automationId,
      result,
      executedAt: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in automation-executor:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

async function executeSMSAction(config: any, triggerData: any) {
  const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
  const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')
  const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER')

  if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
    throw new Error('Twilio credentials not configured')
  }

  // Replace template variables in message
  let message = config.message || ''
  let phoneNumber = config.phoneNumber || ''

  if (triggerData) {
    message = message.replace(/{(\w+)}/g, (match: string, key: string) => {
      return triggerData[key] || match
    })
    phoneNumber = phoneNumber.replace(/{(\w+)}/g, (match: string, key: string) => {
      return triggerData[key] || match
    })
  }

  // Format phone number
  const toNumber = phoneNumber.startsWith('+') ? phoneNumber : `+1${phoneNumber.replace(/\D/g, '')}`

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
        },
        body: new URLSearchParams({
          To: toNumber,
          From: twilioPhoneNumber,
          Body: message,
        }).toString(),
      }
    )

    const result = await response.json()

    if (!response.ok) {
      throw new Error(`Twilio API error: ${JSON.stringify(result)}`)
    }

    return {
      success: true,
      messageSid: result.sid,
      to: toNumber,
      message: message
    }

  } catch (error) {
    console.error('SMS sending error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

async function executeCallAction(config: any, triggerData: any) {
  const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
  const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')
  const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER')

  if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
    throw new Error('Twilio credentials not configured')
  }

  let phoneNumber = config.phoneNumber || ''
  if (triggerData) {
    phoneNumber = phoneNumber.replace(/{(\w+)}/g, (match: string, key: string) => {
      return triggerData[key] || match
    })
  }

  const toNumber = phoneNumber.startsWith('+') ? phoneNumber : `+1${phoneNumber.replace(/\D/g, '')}`

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Calls.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
        },
        body: new URLSearchParams({
          To: toNumber,
          From: twilioPhoneNumber,
          Url: `https://handler.twilio.com/twiml/EHaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`, // Basic TwiML bin
        }).toString(),
      }
    )

    const result = await response.json()

    if (!response.ok) {
      throw new Error(`Twilio API error: ${JSON.stringify(result)}`)
    }

    return {
      success: true,
      callSid: result.sid,
      to: toNumber
    }

  } catch (error) {
    console.error('Call initiation error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

async function executeEmailAction(config: any, triggerData: any) {
  // Email functionality placeholder
  console.log('Email action would be executed here:', config)
  
  return {
    success: true,
    message: 'Email action simulated (not implemented)'
  }
}
