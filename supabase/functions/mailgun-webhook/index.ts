
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'
import { createHmac } from 'https://deno.land/std@0.177.0/node/crypto.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const mailgunApiKey = Deno.env.get('MAILGUN_API_KEY')
    if (!mailgunApiKey) {
      throw new Error('Mailgun API key not configured')
    }

    const formData = await req.formData()
    const eventData = JSON.parse(formData.get('event-data') as string)
    
    // Verify webhook signature
    const timestamp = formData.get('timestamp') as string
    const token = formData.get('token') as string
    const signature = formData.get('signature') as string
    
    const expectedSignature = createHmac('sha256', mailgunApiKey)
      .update(timestamp + token)
      .digest('hex')
    
    if (signature !== expectedSignature) {
      console.error('Invalid webhook signature')
      return new Response('Unauthorized', { status: 401 })
    }

    console.log('Mailgun webhook event:', eventData['event-type'])

    switch (eventData['event-type']) {
      case 'delivered':
      case 'opened':
      case 'clicked':
      case 'bounced':
      case 'failed':
        await handleDeliveryEvent(supabaseClient, eventData)
        break
      
      case 'stored':
        await handleInboundEmail(supabaseClient, eventData)
        break
    }

    return new Response('OK', { headers: corsHeaders })

  } catch (error) {
    console.error('Error in mailgun-webhook:', error)
    return new Response('Error', { status: 500, headers: corsHeaders })
  }
})

async function handleDeliveryEvent(supabaseClient: any, eventData: any) {
  const messageId = eventData.message?.headers?.['message-id']
  if (!messageId) return

  const updateData: any = {
    delivery_status: eventData['event-type']
  }

  if (eventData['event-type'] === 'opened') {
    updateData.opened_at = new Date(eventData.timestamp * 1000).toISOString()
  }

  if (eventData['event-type'] === 'clicked') {
    updateData.clicked_at = new Date(eventData.timestamp * 1000).toISOString()
  }

  await supabaseClient
    .from('email_messages')
    .update(updateData)
    .eq('mailgun_message_id', messageId)
}

async function handleInboundEmail(supabaseClient: any, eventData: any) {
  const message = eventData.message
  if (!message) return

  // Extract domain from recipient to find company
  const recipientDomain = message.headers.to.split('@')[1]
  
  const { data: companySettings } = await supabaseClient
    .from('company_settings')
    .select('*, id')
    .eq('mailgun_domain', recipientDomain)
    .single()

  if (!companySettings) {
    console.log('No company found for domain:', recipientDomain)
    return
  }

  // Find or create conversation
  const subject = message.headers.subject || 'No Subject'
  const threadId = message.headers['in-reply-to'] || message.headers['message-id']
  
  let conversationId
  
  // Try to find existing conversation by thread ID
  const { data: existingConversation } = await supabaseClient
    .from('email_conversations')
    .select('id')
    .eq('company_id', companySettings.id)
    .eq('thread_id', threadId)
    .single()

  if (existingConversation) {
    conversationId = existingConversation.id
  } else {
    // Create new conversation
    const { data: newConversation, error } = await supabaseClient
      .from('email_conversations')
      .insert({
        company_id: companySettings.id,
        subject,
        thread_id: threadId,
        status: 'active'
      })
      .select('id')
      .single()

    if (error) {
      console.error('Error creating conversation:', error)
      return
    }
    
    conversationId = newConversation.id
  }

  // Store the inbound email
  await supabaseClient
    .from('email_messages')
    .insert({
      conversation_id: conversationId,
      mailgun_message_id: message.headers['message-id'],
      direction: 'inbound',
      sender_email: message.headers.from,
      recipient_email: message.headers.to,
      subject,
      body_html: message['body-html'] || '',
      body_text: message['body-plain'] || '',
      delivery_status: 'received'
    })

  console.log('Stored inbound email for conversation:', conversationId)
}
