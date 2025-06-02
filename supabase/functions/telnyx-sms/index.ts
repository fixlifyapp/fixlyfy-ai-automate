
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

interface TelnyxSMSRequest {
  to: string;
  body: string;
  from?: string;
  client_id?: string;
  job_id?: string;
}

interface TelnyxSMSWebhook {
  data: {
    event_type: string;
    payload: {
      id: string;
      from: { phone_number: string };
      to: { phone_number: string };
      text: string;
      received_at: string;
    };
  };
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log(`=== Telnyx SMS Function START ===`)
  console.log(`Method: ${req.method}`)
  console.log(`URL: ${req.url}`)
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const telnyxApiKey = Deno.env.get('TELNYX_API_KEY')
    if (!telnyxApiKey) {
      throw new Error('TELNYX_API_KEY not configured')
    }

    // Handle incoming SMS (webhook)
    if (req.headers.get('content-type')?.includes('application/json')) {
      console.log('=== PROCESSING INCOMING SMS WEBHOOK ===')
      const webhookData: TelnyxSMSWebhook = await req.json()
      
      if (webhookData.data.event_type === 'message.received') {
        console.log('Incoming SMS:', webhookData.data.payload)
        
        const { from, to, text } = webhookData.data.payload
        
        // Find or create client
        const phoneNumber = from.phone_number.replace(/^\+/, '')
        let { data: clients } = await supabaseClient
          .from('clients')
          .select('id, name')
          .eq('phone', phoneNumber)
          .limit(1)

        let clientId = clients?.[0]?.id
        if (!clientId) {
          // Create new client
          const { data: newClient } = await supabaseClient
            .from('clients')
            .insert({
              name: `Client ${phoneNumber}`,
              phone: phoneNumber,
              type: 'Residential'
            })
            .select('id')
            .single()
          clientId = newClient?.id
          console.log('Created new client:', clientId)
        }

        if (clientId) {
          // Find or create conversation
          let { data: conversations } = await supabaseClient
            .from('conversations')
            .select('id')
            .eq('client_id', clientId)
            .limit(1)

          let conversationId = conversations?.[0]?.id
          if (!conversationId) {
            const { data: newConv } = await supabaseClient
              .from('conversations')
              .insert({
                client_id: clientId,
                status: 'active',
                last_message_at: new Date().toISOString()
              })
              .select('id')
              .single()
            conversationId = newConv?.id
            console.log('Created new conversation:', conversationId)
          }

          // Store message
          await supabaseClient
            .from('messages')
            .insert({
              conversation_id: conversationId,
              body: text,
              direction: 'inbound',
              sender: from.phone_number,
              recipient: to.phone_number,
              status: 'received',
              message_sid: webhookData.data.payload.id
            })

          // Update conversation timestamp
          await supabaseClient
            .from('conversations')
            .update({ last_message_at: new Date().toISOString() })
            .eq('id', conversationId)

          console.log('Incoming SMS processed successfully')
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    // Handle outgoing SMS
    console.log('=== PROCESSING OUTGOING SMS ===')
    const { to, body, from, client_id, job_id }: TelnyxSMSRequest = await req.json()

    if (!to || !body) {
      throw new Error('Required parameters: to and body')
    }

    // Format phone number for Telnyx
    const formattedTo = to.startsWith('+') ? to : `+${to.replace(/\D/g, '')}`
    console.log('Formatted recipient:', formattedTo)
    
    // Get sender phone number from Telnyx phone numbers
    let fromNumber = from
    if (!fromNumber) {
      const { data: phoneNumbers } = await supabaseClient
        .from('phone_numbers')
        .select('phone_number')
        .eq('status', 'active')
        .limit(1)
      
      fromNumber = phoneNumbers?.[0]?.phone_number
      if (!fromNumber) {
        throw new Error('No active Telnyx phone numbers available for sending')
      }
    }

    console.log('Sending SMS from:', fromNumber, 'to:', formattedTo)

    // Send SMS via Telnyx API
    const response = await fetch('https://api.telnyx.com/v2/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${telnyxApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromNumber,
        to: formattedTo,
        text: body,
        type: 'SMS'
      })
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Telnyx API error:', data)
      throw new Error(`Telnyx API error: ${JSON.stringify(data)}`)
    }

    console.log('SMS sent successfully:', data.data.id)

    // Store outgoing message in database if client_id provided
    if (client_id) {
      try {
        // Find or create conversation
        let { data: conversations } = await supabaseClient
          .from('conversations')
          .select('id')
          .eq('client_id', client_id)
          .limit(1)

        let conversationId = conversations?.[0]?.id
        if (!conversationId) {
          const { data: newConv } = await supabaseClient
            .from('conversations')
            .insert({
              client_id: client_id,
              job_id: job_id || null,
              status: 'active',
              last_message_at: new Date().toISOString()
            })
            .select('id')
            .single()
          conversationId = newConv?.id
        }

        if (conversationId) {
          // Store outgoing message
          await supabaseClient
            .from('messages')
            .insert({
              conversation_id: conversationId,
              body: body,
              direction: 'outbound',
              sender: fromNumber,
              recipient: formattedTo,
              status: 'sent',
              message_sid: data.data.id
            })

          // Update conversation timestamp
          await supabaseClient
            .from('conversations')
            .update({ last_message_at: new Date().toISOString() })
            .eq('id', conversationId)
        }
      } catch (dbError) {
        console.error('Error storing message in database:', dbError)
        // Don't fail the SMS send if database storage fails
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'SMS sent successfully',
      id: data.data.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in telnyx-sms function:', error)
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'Failed to process SMS' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } finally {
    console.log(`=== Telnyx SMS Function END ===`)
  }
})
