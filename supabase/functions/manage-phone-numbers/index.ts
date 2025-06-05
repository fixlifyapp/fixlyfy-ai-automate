
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

    const { action, phone_number_id, phone_number } = await req.json()
    
    console.log('Phone number management action:', { action, phone_number_id, phone_number })

    const telnyxApiKey = Deno.env.get('TELNYX_API_KEY')
    if (!telnyxApiKey) {
      console.error('TELNYX_API_KEY not configured')
      throw new Error('Telnyx API key not configured')
    }

    if (action === 'configure_webhooks') {
      // Configure webhooks for the phone number
      console.log('Configuring webhooks for:', phone_number)
      
      // Get the Telnyx number ID
      const { data: phoneData, error: phoneError } = await supabaseClient
        .from('telnyx_phone_numbers')
        .select('telnyx_number_id')
        .eq('id', phone_number_id)
        .eq('user_id', user.id)
        .single()

      if (phoneError || !phoneData) {
        throw new Error('Phone number not found or not owned by user')
      }

      // Configure SMS and Voice webhooks with correct URLs
      const smsWebhookUrl = 'https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-sms-webhook'
      const voiceWebhookUrl = 'https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-voice-webhook'

      // Update the phone number configuration in Telnyx for Voice
      if (phoneData.telnyx_number_id) {
        console.log('Configuring Voice webhooks for Telnyx number:', phoneData.telnyx_number_id)
        
        const response = await fetch(`https://api.telnyx.com/v2/phone_numbers/${phoneData.telnyx_number_id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${telnyxApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_profile_id: "4001972b-8bcb-40d6-afe4-363fd5ccada1", // Your messaging profile ID
            connection_id: "2467892542", // Your connection ID for voice
            voice_url: voiceWebhookUrl,
            voice_failover_url: voiceWebhookUrl,
            voice_method: "POST"
          })
        })

        const result = await response.json()
        
        if (!response.ok) {
          console.error('Telnyx configuration error:', result)
          throw new Error(result.errors?.[0]?.detail || 'Failed to configure webhooks')
        }

        console.log('Phone number configuration result:', result)

        // Configure the messaging profile to ensure SMS webhook is set to v2
        console.log('Configuring messaging profile webhook for v2...')
        const messagingResponse = await fetch('https://api.telnyx.com/v2/messaging_profiles/4001972b-8bcb-40d6-afe4-363fd5ccada1', {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${telnyxApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            webhook_url: smsWebhookUrl,
            webhook_failover_url: smsWebhookUrl,
            webhook_api_version: "v2"  // Changed from "2" to "v2"
          })
        })

        const messagingResult = await messagingResponse.json()
        
        if (!messagingResponse.ok) {
          console.error('Messaging profile configuration error:', messagingResult)
          throw new Error(messagingResult.errors?.[0]?.detail || 'Failed to configure messaging profile')
        }

        console.log('Messaging profile configured successfully for v2:', messagingResult)
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'SMS and Voice webhooks configured successfully for v2'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    if (action === 'test_webhook') {
      // Test webhook connectivity with proper v2 format
      console.log('Testing webhook for phone number:', phone_number)
      
      // Create a proper test payload that matches Telnyx v2 format
      const testPayload = {
        record_type: "event",
        event_type: "message.received",
        id: 'test-event-' + Date.now(),
        occurred_at: new Date().toISOString(),
        payload: {
          id: 'test-message-' + Date.now(),
          record_type: "message",
          direction: "inbound",
          from: { 
            phone_number: "+1234567890",
            carrier: "Test Carrier"
          },
          to: [{ 
            phone_number: phone_number,
            carrier: "Telnyx"
          }],
          text: "🧪 Test message from webhook configuration - this is a test!",
          completed_at: new Date().toISOString(),
          received_at: new Date().toISOString(),
          sent_at: new Date().toISOString(),
          webhook_url: "https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-sms-webhook"
        }
      }

      console.log('Sending test payload to webhook:', JSON.stringify(testPayload, null, 2))

      const webhookResponse = await fetch('https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-sms-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'TelnyxWebhookTest/1.0'
        },
        body: JSON.stringify(testPayload)
      })

      const webhookResult = await webhookResponse.text()
      
      console.log('Webhook response status:', webhookResponse.status)
      console.log('Webhook response body:', webhookResult)
      
      let webhookData
      try {
        webhookData = JSON.parse(webhookResult)
      } catch (e) {
        webhookData = { raw_response: webhookResult }
      }

      const success = webhookResponse.ok && (webhookData?.success !== false)
      
      return new Response(
        JSON.stringify({ 
          success: success,
          message: success ? 'Webhook test completed successfully' : 'Webhook test completed with issues',
          details: {
            status: webhookResponse.status,
            response: webhookData,
            test_phone: phone_number,
            webhook_url: 'https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-sms-webhook'
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    throw new Error('Invalid action specified')

  } catch (error) {
    console.error('Error in phone number management:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to manage phone number'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
