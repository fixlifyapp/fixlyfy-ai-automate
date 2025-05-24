
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')!
const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')!
const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER')!

serve(async (req) => {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    const { automationId, triggerData } = await req.json()
    
    console.log('Executing automation:', automationId, 'with trigger data:', triggerData)

    // Get automation with triggers and actions
    const { data: automation, error: automationError } = await supabase
      .from('automations')
      .select(`
        *,
        triggers:automation_triggers(*),
        actions:automation_actions(*)
      `)
      .eq('id', automationId)
      .eq('status', 'active')
      .single()

    if (automationError || !automation) {
      console.error('Automation not found:', automationError)
      return new Response('Automation not found', { status: 404 })
    }

    // Create automation run record
    const { data: automationRun, error: runError } = await supabase
      .from('automation_runs')
      .insert({
        automation_id: automationId,
        trigger_data: triggerData,
        status: 'running'
      })
      .select()
      .single()

    if (runError) {
      console.error('Failed to create automation run:', runError)
      return new Response('Failed to create run record', { status: 500 })
    }

    let actionsExecuted = 0
    let hasError = false
    let errorMessage = ''

    // Execute actions in sequence
    const sortedActions = automation.actions.sort((a: any, b: any) => a.sequence_order - b.sequence_order)
    
    for (const action of sortedActions) {
      try {
        // Add delay if specified
        if (action.delay_minutes > 0) {
          await new Promise(resolve => setTimeout(resolve, action.delay_minutes * 60 * 1000))
        }

        await executeAction(action, triggerData, supabase)
        actionsExecuted++
        
        console.log(`Executed action ${action.id} of type ${action.action_type}`)
      } catch (actionError) {
        console.error(`Failed to execute action ${action.id}:`, actionError)
        hasError = true
        errorMessage = actionError.message
        break
      }
    }

    // Update automation run status
    await supabase
      .from('automation_runs')
      .update({
        status: hasError ? 'failed' : 'completed',
        completed_at: new Date().toISOString(),
        actions_executed: actionsExecuted,
        error_message: hasError ? errorMessage : null
      })
      .eq('id', automationRun.id)

    // Update automation stats
    await supabase
      .from('automations')
      .update({
        run_count: automation.run_count + 1,
        success_count: hasError ? automation.success_count : automation.success_count + 1,
        last_run_at: new Date().toISOString()
      })
      .eq('id', automationId)

    return new Response(JSON.stringify({
      success: !hasError,
      runId: automationRun.id,
      actionsExecuted,
      error: hasError ? errorMessage : null
    }), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Automation execution error:', error)
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})

async function executeAction(action: any, triggerData: any, supabase: any) {
  const { action_type, action_config } = action

  switch (action_type) {
    case 'send_sms':
      await sendSMS(action_config, triggerData)
      break
    case 'send_email':
      await sendEmail(action_config, triggerData)
      break
    case 'make_call':
      await makeCall(action_config, triggerData)
      break
    case 'create_task':
      await createTask(action_config, triggerData, supabase)
      break
    case 'webhook':
      await callWebhook(action_config, triggerData)
      break
    default:
      throw new Error(`Unknown action type: ${action_type}`)
  }
}

async function sendSMS(config: any, triggerData: any) {
  const { message, to_number } = config
  
  if (!to_number || !message) {
    throw new Error('SMS action requires to_number and message')
  }

  const processedMessage = processVariables(message, triggerData)
  
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      From: twilioPhoneNumber,
      To: to_number,
      Body: processedMessage
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Twilio SMS error: ${error}`)
  }

  console.log('SMS sent successfully to:', to_number)
}

async function sendEmail(config: any, triggerData: any) {
  const { subject, body, to_email } = config
  
  if (!to_email || !subject || !body) {
    throw new Error('Email action requires to_email, subject, and body')
  }

  const processedSubject = processVariables(subject, triggerData)
  const processedBody = processVariables(body, triggerData)
  
  // Here you would integrate with your email service (SendGrid, Resend, etc.)
  console.log('Email would be sent to:', to_email, 'Subject:', processedSubject)
}

async function makeCall(config: any, triggerData: any) {
  const { to_number, message } = config
  
  if (!to_number) {
    throw new Error('Call action requires to_number')
  }

  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Calls.json`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      From: twilioPhoneNumber,
      To: to_number,
      Url: 'http://demo.twilio.com/docs/voice.xml' // You can customize this TwiML URL
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Twilio Call error: ${error}`)
  }

  console.log('Call initiated to:', to_number)
}

async function createTask(config: any, triggerData: any, supabase: any) {
  const { title, description, assigned_to } = config
  
  if (!title) {
    throw new Error('Task creation requires title')
  }

  const processedTitle = processVariables(title, triggerData)
  const processedDescription = processVariables(description || '', triggerData)
  
  // Create task in your tasks table
  const { error } = await supabase
    .from('tasks')
    .insert({
      title: processedTitle,
      description: processedDescription,
      assigned_to,
      job_id: triggerData?.job_id,
      created_by: triggerData?.user_id
    })

  if (error) {
    throw new Error(`Failed to create task: ${error.message}`)
  }

  console.log('Task created:', processedTitle)
}

async function callWebhook(config: any, triggerData: any) {
  const { url, method = 'POST', headers = {}, body } = config
  
  if (!url) {
    throw new Error('Webhook action requires URL')
  }

  const processedBody = body ? processVariables(JSON.stringify(body), triggerData) : null
  
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: processedBody
  })

  if (!response.ok) {
    throw new Error(`Webhook error: ${response.status} ${response.statusText}`)
  }

  console.log('Webhook called successfully:', url)
}

function processVariables(text: string, triggerData: any): string {
  if (!text || !triggerData) return text
  
  // Replace variables like {ClientName}, {JobDate}, etc.
  return text.replace(/\{(\w+)\}/g, (match, variable) => {
    return triggerData[variable] || match
  })
}
