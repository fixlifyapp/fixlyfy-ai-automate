
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
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader?.replace('Bearer ', '') || ''
    )
    
    if (authError || !user) {
      console.error('Authentication error:', authError)
      throw new Error('Authentication required')
    }
    
    console.log('Authenticated user:', user.id)

    const { action, phone_number } = await req.json()
    
    console.log('Messaging profile action:', { action, phone_number })

    const telnyxApiKey = Deno.env.get('TELNYX_API_KEY')
    if (!telnyxApiKey) {
      console.error('TELNYX_API_KEY not configured')
      throw new Error('Telnyx API key not configured')
    }

    const smsWebhookUrl = 'https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/sms-receiver'
    const voiceWebhookUrl = 'https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-voice-webhook'

    if (action === 'setup_full_configuration') {
      console.log('Setting up full SMS + Voice configuration for:', phone_number)
      
      // Step 1: Create or update messaging profile for SMS
      console.log('Creating/updating messaging profile...')
      const messagingResponse = await fetch('https://api.telnyx.com/v2/messaging_profiles', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${telnyxApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: `Fixlyfy SMS Profile - ${phone_number}`,
          enabled: true,
          webhook_url: smsWebhookUrl,
          webhook_failover_url: smsWebhookUrl,
          webhook_api_version: "v2"
        })
      })

      let messagingProfileId = null
      const messagingResult = await messagingResponse.json()
      
      if (messagingResponse.ok) {
        messagingProfileId = messagingResult.data.id
        console.log('Created messaging profile:', messagingProfileId)
      } else if (messagingResult.errors?.[0]?.code === '40003') {
        // Profile might already exist, try to get existing profiles
        console.log('Profile might exist, fetching existing profiles...')
        const listResponse = await fetch('https://api.telnyx.com/v2/messaging_profiles', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${telnyxApiKey}`,
            'Content-Type': 'application/json'
          }
        })
        
        const listResult = await listResponse.json()
        if (listResponse.ok && listResult.data) {
          // Find a profile with our webhook URL or create a new one with unique name
          const existingProfile = listResult.data.find((profile: any) => 
            profile.webhook_url === smsWebhookUrl
          )
          
          if (existingProfile) {
            messagingProfileId = existingProfile.id
            console.log('Using existing messaging profile:', messagingProfileId)
          } else {
            // Try with a unique name
            const uniqueName = `Fixlyfy SMS Profile ${Date.now()}`
            const retryResponse = await fetch('https://api.telnyx.com/v2/messaging_profiles', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${telnyxApiKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                name: uniqueName,
                enabled: true,
                webhook_url: smsWebhookUrl,
                webhook_failover_url: smsWebhookUrl,
                webhook_api_version: "v2"
              })
            })
            
            const retryResult = await retryResponse.json()
            if (retryResponse.ok) {
              messagingProfileId = retryResult.data.id
              console.log('Created messaging profile with unique name:', messagingProfileId)
            }
          }
        }
      }

      if (!messagingProfileId) {
        console.error('Failed to create or find messaging profile:', messagingResult)
        throw new Error('Failed to create messaging profile')
      }

      // Step 2: Get the phone number details from Telnyx
      console.log('Getting phone number details from Telnyx...')
      const phoneListResponse = await fetch('https://api.telnyx.com/v2/phone_numbers', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${telnyxApiKey}`,
          'Content-Type': 'application/json'
        }
      })

      const phoneListResult = await phoneListResponse.json()
      if (!phoneListResponse.ok) {
        console.error('Failed to get phone numbers:', phoneListResult)
        throw new Error('Failed to get phone numbers from Telnyx')
      }

      const telnyxPhoneNumber = phoneListResult.data?.find((num: any) => 
        num.phone_number === phone_number
      )

      if (!telnyxPhoneNumber) {
        console.error('Phone number not found in Telnyx:', phone_number)
        throw new Error('Phone number not found in Telnyx account')
      }

      console.log('Found Telnyx phone number:', telnyxPhoneNumber.id)

      // Step 3: Update phone number with both messaging profile and voice configuration
      console.log('Updating phone number configuration...')
      const updateResponse = await fetch(`https://api.telnyx.com/v2/phone_numbers/${telnyxPhoneNumber.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${telnyxApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_profile_id: messagingProfileId,
          connection_id: "2467892542", // Your connection ID for voice
          voice_url: voiceWebhookUrl,
          voice_failover_url: voiceWebhookUrl,
          voice_method: "POST"
        })
      })

      const updateResult = await updateResponse.json()
      
      if (!updateResponse.ok) {
        console.error('Failed to update phone number configuration:', updateResult)
        throw new Error(updateResult.errors?.[0]?.detail || 'Failed to update phone number configuration')
      }

      console.log('Phone number configuration updated successfully:', updateResult.data)

      // Step 4: Update our database record
      const { error: dbUpdateError } = await supabaseClient
        .from('telnyx_phone_numbers')
        .update({
          webhook_url: smsWebhookUrl,
          messaging_profile_id: messagingProfileId,
          telnyx_number_id: telnyxPhoneNumber.id,
          updated_at: new Date().toISOString()
        })
        .eq('phone_number', phone_number)
        .eq('user_id', user.id)

      if (dbUpdateError) {
        console.error('Failed to update database record:', dbUpdateError)
        // Don't throw error here as Telnyx was updated successfully
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Full SMS + Voice configuration completed successfully',
          details: {
            messaging_profile_id: messagingProfileId,
            sms_webhook: smsWebhookUrl,
            voice_webhook: voiceWebhookUrl,
            phone_number_id: telnyxPhoneNumber.id
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
    console.error('Error in messaging profile management:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to manage messaging profile'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
