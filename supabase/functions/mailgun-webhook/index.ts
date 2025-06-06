
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'
import { createHmac } from 'https://deno.land/std@0.177.0/node/crypto.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Email utility function to match send-email function
const formatCompanyNameForEmail = (companyName: string): string => {
  if (!companyName || typeof companyName !== 'string') {
    return 'support';
  }

  return companyName
    .toLowerCase()
    .trim()
    .replace(/[\s\-&+.,()]+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 30)
    || 'support';
};

const parseEmailAddress = (emailAddress: string) => {
  // Extract the local part (before @) from email address
  const localPart = emailAddress.split('@')[0];
  const domain = emailAddress.split('@')[1];
  
  return {
    localPart: localPart.toLowerCase(),
    domain: domain.toLowerCase(),
    isFixlifyDomain: domain === 'fixlify.app'
  };
};

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

  console.log('Processing inbound email:', {
    from: message.headers.from,
    to: message.headers.to,
    subject: message.headers.subject
  })

  // Parse recipient email to find company
  const recipientInfo = parseEmailAddress(message.headers.to)
  
  if (!recipientInfo.isFixlifyDomain) {
    console.log('Email not for fixlify.app domain:', message.headers.to)
    return
  }

  // Find company by matching email format
  const { data: companies } = await supabaseClient
    .from('company_settings')
    .select('*')

  let targetCompany = null
  
  for (const company of companies || []) {
    if (company.company_name) {
      const expectedLocalPart = formatCompanyNameForEmail(company.company_name)
      if (expectedLocalPart === recipientInfo.localPart) {
        targetCompany = company
        break
      }
    }
  }

  if (!targetCompany) {
    console.log('No company found for email address:', message.headers.to)
    return
  }

  console.log('Found target company:', targetCompany.company_name)

  // Extract sender email for client matching
  const senderEmail = message.headers.from
  const senderEmailOnly = senderEmail.includes('<') 
    ? senderEmail.split('<')[1].replace('>', '') 
    : senderEmail

  // Find or create client
  let clientId = null
  const { data: existingClient } = await supabaseClient
    .from('clients')
    .select('id')
    .eq('email', senderEmailOnly)
    .eq('created_by', targetCompany.user_id)
    .single()

  if (existingClient) {
    clientId = existingClient.id
  } else {
    // Create new client
    const senderName = senderEmail.includes('<') 
      ? senderEmail.split('<')[0].trim().replace(/"/g, '')
      : senderEmailOnly.split('@')[0]

    const { data: newClient, error: clientError } = await supabaseClient
      .from('clients')
      .insert({
        name: senderName,
        email: senderEmailOnly,
        created_by: targetCompany.user_id
      })
      .select('id')
      .single()

    if (clientError) {
      console.error('Error creating client:', clientError)
      return
    }

    clientId = newClient.id
    console.log('Created new client:', senderName)
  }

  // Look for existing conversation using threading headers
  const subject = message.headers.subject || 'No Subject'
  const inReplyTo = message.headers['in-reply-to']
  const references = message.headers.references
  const conversationId = message.headers['x-conversation-id']
  
  let targetConversationId = null

  // Try to find conversation by custom header first
  if (conversationId) {
    const { data: existingByHeader } = await supabaseClient
      .from('email_conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('company_id', targetCompany.id)
      .single()
    
    if (existingByHeader) {
      targetConversationId = existingByHeader.id
    }
  }

  // Try to find by Message-ID threading
  if (!targetConversationId && (inReplyTo || references)) {
    const threadingIds = [inReplyTo, references].filter(Boolean).join(' ')
    
    const { data: existingByThread } = await supabaseClient
      .from('email_messages')
      .select('conversation_id')
      .textSearch('mailgun_message_id', threadingIds.replace(/[<>]/g, ''))
      .limit(1)
      .single()
    
    if (existingByThread) {
      targetConversationId = existingByThread.conversation_id
    }
  }

  // Try to find by client and subject similarity
  if (!targetConversationId && clientId) {
    const cleanSubject = subject.replace(/^(re|fwd?):\s*/i, '').trim()
    
    const { data: existingBySubject } = await supabaseClient
      .from('email_conversations')
      .select('id')
      .eq('company_id', targetCompany.id)
      .eq('client_id', clientId)
      .ilike('subject', `%${cleanSubject}%`)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    if (existingBySubject) {
      targetConversationId = existingBySubject.id
    }
  }

  // Create new conversation if none found
  if (!targetConversationId) {
    const { data: newConversation, error: conversationError } = await supabaseClient
      .from('email_conversations')
      .insert({
        company_id: targetCompany.id,
        client_id: clientId,
        subject: subject,
        status: 'active'
      })
      .select('id')
      .single()

    if (conversationError) {
      console.error('Error creating conversation:', conversationError)
      return
    }
    
    targetConversationId = newConversation.id
    console.log('Created new conversation:', targetConversationId)
  } else {
    console.log('Using existing conversation:', targetConversationId)
  }

  // Store the inbound email
  const { error: messageError } = await supabaseClient
    .from('email_messages')
    .insert({
      conversation_id: targetConversationId,
      mailgun_message_id: message.headers['message-id'],
      direction: 'inbound',
      sender_email: senderEmailOnly,
      recipient_email: message.headers.to,
      subject: subject,
      body_html: message['body-html'] || '',
      body_text: message['body-plain'] || '',
      delivery_status: 'received'
    })

  if (messageError) {
    console.error('Error storing email message:', messageError)
    return
  }

  // Update conversation timestamp
  await supabaseClient
    .from('email_conversations')
    .update({ 
      last_message_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', targetConversationId)

  console.log('Successfully processed inbound email for:', targetCompany.company_name)
}
