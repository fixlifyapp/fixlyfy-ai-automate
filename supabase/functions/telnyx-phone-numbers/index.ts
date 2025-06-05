
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

    const { action, phone_number, phone_number_id } = await req.json()
    
    console.log('Telnyx phone numbers action:', { action, phone_number, phone_number_id })

    const telnyxApiKey = Deno.env.get('TELNYX_API_KEY')
    if (!telnyxApiKey) {
      console.error('TELNYX_API_KEY not configured')
      throw new Error('Telnyx API key not configured')
    }

    if (action === 'get_telnyx_numbers') {
      // Get all phone numbers from Telnyx API
      console.log('Fetching phone numbers from Telnyx API...')
      
      const response = await fetch('https://api.telnyx.com/v2/phone_numbers', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${telnyxApiKey}`,
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()
      
      if (!response.ok) {
        console.error('Telnyx API error:', result)
        throw new Error(result.errors?.[0]?.detail || 'Failed to fetch phone numbers from Telnyx')
      }

      console.log('Telnyx phone numbers response:', JSON.stringify(result, null, 2))

      return new Response(
        JSON.stringify({ 
          success: true, 
          telnyx_numbers: result.data || [],
          pagination: result.meta
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    if (action === 'get_messaging_profiles') {
      // Get messaging profiles from Telnyx API
      console.log('Fetching messaging profiles from Telnyx API...')
      
      const response = await fetch('https://api.telnyx.com/v2/messaging_profiles', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${telnyxApiKey}`,
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()
      
      if (!response.ok) {
        console.error('Telnyx messaging profiles error:', result)
        throw new Error(result.errors?.[0]?.detail || 'Failed to fetch messaging profiles')
      }

      console.log('Telnyx messaging profiles response:', JSON.stringify(result, null, 2))

      return new Response(
        JSON.stringify({ 
          success: true, 
          messaging_profiles: result.data || []
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    if (action === 'list') {
      // Get numbers from our database
      const { data: phoneNumbers, error: phoneError } = await supabaseClient
        .from('telnyx_phone_numbers')
        .select('*')
        .eq('user_id', user.id)

      if (phoneError) {
        console.error('Database error:', phoneError)
        throw new Error('Failed to fetch phone numbers from database')
      }

      console.log('Database phone numbers:', phoneNumbers)

      return new Response(
        JSON.stringify({ 
          success: true, 
          phone_numbers: phoneNumbers || []
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    if (action === 'configure') {
      // Configure a phone number for AI
      console.log('Configuring phone number for AI:', phone_number)
      
      // Check if this number exists in our database
      const { data: existingNumber, error: checkError } = await supabaseClient
        .from('telnyx_phone_numbers')
        .select('*')
        .eq('phone_number', phone_number)
        .eq('user_id', user.id)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing number:', checkError)
        throw new Error('Failed to check existing number')
      }

      if (!existingNumber) {
        throw new Error('Phone number not found in your account')
      }

      // Update the number as configured for AI
      const { error: updateError } = await supabaseClient
        .from('telnyx_phone_numbers')
        .update({
          configured_for_ai: true,
          configured_at: new Date().toISOString(),
          ai_dispatcher_enabled: true
        })
        .eq('id', existingNumber.id)

      if (updateError) {
        console.error('Error updating number configuration:', updateError)
        throw new Error('Failed to update number configuration')
      }

      console.log('Phone number configured successfully for AI')

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Phone number configured for AI successfully'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    if (action === 'get_config') {
      // Check if Telnyx API key is configured
      const apiKeyConfigured = !!telnyxApiKey

      return new Response(
        JSON.stringify({ 
          success: true, 
          config: {
            api_key_configured: apiKeyConfigured
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
    console.error('Error in telnyx-phone-numbers:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to process request'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
