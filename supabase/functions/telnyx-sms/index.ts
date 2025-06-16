
import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the authorization header to determine the user
    const authHeader = req.headers.get('Authorization')
    console.log('Authorization header present:', !!authHeader)
    
    // Verify the user token
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader?.replace('Bearer ', '') || ''
    )
    
    if (authError || !user) {
      console.error('Authentication error:', authError)
      throw new Error('Authentication required')
    }
    
    console.log('Authenticated user:', user.id)

    const requestBody = await req.json()
    const { to, body, client_id, job_id, estimateId, recipientPhone, message } = requestBody
    
    // Handle both regular SMS and estimate SMS
    const phoneNumber = to || recipientPhone
    const messageBody = body || message
    const isEstimate = !!estimateId
    
    console.log('Sending SMS via Telnyx:', { 
      phoneNumber, 
      messageBody: messageBody?.substring(0, 50) + '...', 
      client_id, 
      job_id, 
      isEstimate,
      estimateId 
    })

    // Validate inputs
    if (!phoneNumber || !messageBody) {
      throw new Error('Phone number and message body are required')
    }

    // Clean and validate phone number
    const cleanPhone = phoneNumber.replace(/\D/g, '')
    if (cleanPhone.length < 10) {
      throw new Error('Valid phone number is required')
    }

    // Format phone number for Telnyx
    const formattedPhone = cleanPhone.length === 10 ? `+1${cleanPhone}` : `+${cleanPhone}`

    const telnyxApiKey = Deno.env.get('TELNYX_API_KEY')
    if (!telnyxApiKey) {
      console.error('TELNYX_API_KEY not configured')
      throw new Error('SMS service not configured. Please contact support.')
    }

    // Get user's active phone number from telnyx_phone_numbers
    console.log('Fetching user phone numbers for user:', user.id)
    const { data: phoneNumbers, error: phoneError } = await supabaseClient
      .from('telnyx_phone_numbers')
      .select('phone_number, status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .limit(1)

    if (phoneError) {
      console.error('Error fetching phone numbers:', phoneError)
      throw new Error('Failed to fetch phone numbers')
    }

    console.log('Found phone numbers:', phoneNumbers)

    if (!phoneNumbers || phoneNumbers.length === 0) {
      console.error('No active phone numbers found for user:', user.id)
      throw new Error('No active phone numbers configured. Please purchase a phone number first.')
    }

    const fromPhone = phoneNumbers[0].phone_number
    console.log('Using sender phone number:', fromPhone)

    // Ensure the phone number is properly formatted
    let formattedFromPhone = fromPhone
    if (!fromPhone.startsWith('+')) {
      const cleanFromPhone = fromPhone.replace(/\D/g, '')
      formattedFromPhone = cleanFromPhone.length === 10 ? `+1${cleanFromPhone}` : `+${cleanFromPhone}`
    }

    // Handle estimate-specific logic
    let finalMessage = messageBody
    if (isEstimate && estimateId && client_id) {
      console.log('Processing estimate SMS - generating portal link')
      
      // Generate portal access token for estimate with better error handling
      try {
        const { data: tokenData, error: tokenError } = await supabaseClient.rpc('generate_client_portal_access', {
          p_client_id: client_id,
          p_document_type: 'estimate',
          p_document_id: estimateId,
          p_hours_valid: 72
        });

        if (!tokenError && tokenData) {
          const portalLink = `https://hub.fixlify.app/client-portal?token=${tokenData}`;
          finalMessage = `${messageBody}\n\nView your estimate securely: ${portalLink}`;
          console.log('Portal link generated and added to message');
        } else {
          console.error('Failed to generate portal access token:', tokenError);
          // Continue without portal link - don't fail the SMS
          console.log('Continuing SMS send without portal link');
        }
      } catch (error) {
        console.warn('Portal access token generation failed:', error);
        // Continue without portal link - don't fail the SMS
        console.log('Continuing SMS send without portal link due to error');
      }
    }

    console.log('Sending SMS from:', formattedFromPhone, 'to:', formattedPhone)

    const response = await fetch('https://api.telnyx.com/v2/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${telnyxApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: formattedFromPhone,
        to: formattedPhone,
        text: finalMessage
      })
    })

    const result = await response.json()
    
    if (!response.ok) {
      console.error('Telnyx API error:', result)
      throw new Error(result.errors?.[0]?.detail || 'Failed to send SMS via Telnyx')
    }

    console.log('SMS sent successfully via Telnyx:', result)

    // Store the message in the database if we have conversation context
    if (client_id) {
      console.log('Storing message in database for client:', client_id)
      
      // Try to find or create a conversation
      let conversationId = null
      
      const { data: existingConversation } = await supabaseClient
        .from('conversations')
        .select('id')
        .eq('client_id', client_id)
        .eq('status', 'active')
        .limit(1)
        .maybeSingle()

      if (existingConversation) {
        conversationId = existingConversation.id
        console.log('Using existing conversation:', conversationId)
      } else {
        console.log('Creating new conversation for client:', client_id)
        const { data: newConversation, error: convError } = await supabaseClient
          .from('conversations')
          .insert({
            client_id: client_id,
            job_id: job_id || null,
            status: 'active',
            last_message_at: new Date().toISOString()
          })
          .select('id')
          .single()

        if (!convError && newConversation) {
          conversationId = newConversation.id
          console.log('Created new conversation:', conversationId)
        }
      }

      // Store the message
      if (conversationId) {
        const { error: msgError } = await supabaseClient
          .from('messages')
          .insert({
            conversation_id: conversationId,
            body: finalMessage,
            direction: 'outbound',
            sender: 'System',
            recipient: formattedPhone,
            status: 'delivered',
            message_sid: result.data?.id || 'telnyx-' + Date.now()
          })

        if (msgError) {
          console.error('Error storing message:', msgError)
          // Don't throw error here, message was sent successfully
        } else {
          console.log('Message stored successfully')
        }

        // Update conversation timestamp to trigger real-time updates
        const { error: updateError } = await supabaseClient
          .from('conversations')
          .update({ 
            last_message_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', conversationId)

        if (updateError) {
          console.error('Error updating conversation timestamp:', updateError)
        } else {
          console.log('Conversation timestamp updated for real-time sync')
        }
      }
    }

    // Log estimate communication if this is an estimate SMS
    if (isEstimate && estimateId) {
      try {
        await supabaseClient
          .from('estimate_communications')
          .insert({
            estimate_id: estimateId,
            communication_type: 'sms',
            recipient: formattedPhone,
            content: finalMessage,
            status: 'sent',
            provider_message_id: result.data?.id
          });
        console.log('Estimate communication logged');
      } catch (logError) {
        console.warn('Failed to log estimate communication:', logError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: result,
        message: 'Message sent successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error sending SMS:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to send message'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
