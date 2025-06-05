
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

      // First, configure the messaging profile to ensure SMS webhook is set properly
      console.log('Configuring messaging profile webhook...')
      const messagingResponse = await fetch('https://api.telnyx.com/v2/messaging_profiles/4001972b-8bcb-40d6-afe4-363fd5ccada1', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${telnyxApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          webhook_url: smsWebhookUrl,
          webhook_failover_url: smsWebhookUrl,
          webhook_api_version: "v2"
        })
      })

      const messagingResult = await messagingResponse.json()
      
      if (!messagingResponse.ok) {
        console.error('Messaging profile configuration error:', messagingResult)
        throw new Error(messagingResult.errors?.[0]?.detail || 'Failed to configure messaging profile')
      }

      console.log('Messaging profile configured successfully:', messagingResult)

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
            messaging_profile_id: "4001972b-8bcb-40d6-afe4-363fd5ccada1",
            connection_id: "2467892542",
            voice_url: voiceWebhookUrl,
            voice_failover_url: voiceWebhookUrl,
            voice_method: "POST"
          })
        })

        const result = await response.json()
        
        if (!response.ok) {
          console.error('Telnyx phone number configuration error:', result)
          throw new Error(result.errors?.[0]?.detail || 'Failed to configure phone number webhooks')
        }

        console.log('Phone number configuration result:', result)
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'SMS and Voice webhooks configured successfully',
          details: {
            messaging_profile: messagingResult,
            sms_webhook: smsWebhookUrl,
            voice_webhook: voiceWebhookUrl
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
