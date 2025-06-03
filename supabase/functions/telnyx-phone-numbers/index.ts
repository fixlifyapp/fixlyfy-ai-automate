
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

interface TelnyxPhoneNumberRequest {
  action: 'search' | 'purchase' | 'list' | 'configure' | 'add_existing' | 'remove_test_numbers' | 'get_config' | 'update_config';
  area_code?: string;
  country_code?: string;
  phone_number?: string;
  webhook_url?: string;
  config?: any;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log(`Telnyx Phone Numbers: ${req.method} ${req.url}`)
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the current user from the auth header
    const authHeader = req.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    let currentUserId = null
    if (token) {
      const { data: { user } } = await supabaseClient.auth.getUser(token)
      currentUserId = user?.id
      console.log('Current user ID:', currentUserId)
    }

    const telnyxApiKey = Deno.env.get('TELNYX_API_KEY')
    if (!telnyxApiKey) {
      console.log('TELNYX_API_KEY not configured')
    }

    const { action, area_code, country_code, phone_number, webhook_url, config }: TelnyxPhoneNumberRequest = await req.json()

    // Get Telnyx configuration
    if (action === 'get_config') {
      if (!currentUserId) {
        throw new Error('User authentication required')
      }

      const { data: telnyxConfig, error } = await supabaseClient
        .from('telnyx_configurations')
        .select('*')
        .eq('user_id', currentUserId)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      return new Response(JSON.stringify({
        success: true,
        config: telnyxConfig || {
          api_key_configured: !!telnyxApiKey,
          voice_settings: { voice: 'alloy', language: 'en-US' },
          ai_settings: { enabled: true, greeting: 'Hello, this is an AI assistant.' },
          business_settings: { hours: {}, services: [] }
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Update Telnyx configuration
    if (action === 'update_config') {
      if (!currentUserId) {
        throw new Error('User authentication required')
      }

      const { error } = await supabaseClient
        .from('telnyx_configurations')
        .upsert({
          user_id: currentUserId,
          api_key_configured: !!telnyxApiKey,
          webhook_url: config?.webhook_url,
          voice_settings: config?.voice_settings,
          ai_settings: config?.ai_settings,
          business_settings: config?.business_settings,
          updated_at: new Date().toISOString()
        })

      if (error) {
        throw error
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'Configuration updated successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Remove test numbers from user account
    if (action === 'remove_test_numbers') {
      if (!currentUserId) {
        throw new Error('User authentication required')
      }

      console.log('Removing test numbers from user account')
      
      // Remove test numbers from both tables
      const { error: removeTelnyxError } = await supabaseClient
        .from('telnyx_phone_numbers')
        .update({ 
          user_id: null, 
          status: 'available',
          configured_at: null,
          webhook_url: null 
        })
        .eq('user_id', currentUserId)
        .eq('monthly_cost', 0)
        .eq('setup_cost', 0)
        .neq('phone_number', '+14375249932') // Keep the real Telnyx number

      const { error: removePhoneError } = await supabaseClient
        .from('phone_numbers')
        .update({
          purchased_by: null,
          status: 'available',
          ai_dispatcher_enabled: false,
          configured_for_ai: false
        })
        .eq('purchased_by', currentUserId)
        .eq('monthly_price', 0)
        .neq('phone_number', '+14375249932') // Keep the real Telnyx number

      if (removeTelnyxError || removePhoneError) {
        console.error('Remove errors:', { removeTelnyxError, removePhoneError })
        throw removeTelnyxError || removePhoneError
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'Test numbers removed from account'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Search available numbers (real Telnyx numbers only)
    if (action === 'search') {
      console.log(`Searching for numbers with area_code: ${area_code}`)
      
      let telnyxNumbers = []
      if (telnyxApiKey) {
        try {
          const searchParams = new URLSearchParams({
            'filter[country_code]': country_code || 'US',
            'filter[features][]': 'sms',
            'page[size]': '25'
          })
          
          if (area_code) {
            searchParams.append('filter[national_destination_code]', area_code)
          }

          const response = await fetch(`https://api.telnyx.com/v2/available_phone_numbers?${searchParams}`, {
            headers: {
              'Authorization': `Bearer ${telnyxApiKey}`,
              'Content-Type': 'application/json',
            }
          })

          if (response.ok) {
            const data = await response.json()
            telnyxNumbers = data.data?.map((num: any) => ({
              phone_number: num.phone_number,
              region_information: num.region_information,
              features: num.features,
              cost_information: num.cost_information,
              source: 'telnyx'
            })) || []
          }
        } catch (error) {
          console.log('Telnyx API error:', error)
        }
      }

      console.log(`Found ${telnyxNumbers.length} real Telnyx numbers`)

      return new Response(JSON.stringify({
        success: true,
        available_numbers: telnyxNumbers
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Purchase number (real Telnyx numbers only)
    else if (action === 'purchase') {
      if (!phone_number) {
        throw new Error('Phone number is required for purchase')
      }

      if (!currentUserId) {
        throw new Error('User authentication required for purchase')
      }

      console.log(`Purchasing real Telnyx number ${phone_number} for user ${currentUserId}`)

      if (telnyxApiKey) {
        console.log('Purchasing real Telnyx number')
        const purchaseResponse = await fetch('https://api.telnyx.com/v2/number_orders', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${telnyxApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone_numbers: [{ phone_number }]
          })
        })

        const purchaseData = await purchaseResponse.json()

        if (!purchaseResponse.ok) {
          throw new Error(`Purchase failed: ${JSON.stringify(purchaseData)}`)
        }

        // Save to both tables
        const { error: insertTelnyxError } = await supabaseClient
          .from('telnyx_phone_numbers')
          .insert({
            phone_number: phone_number,
            telnyx_phone_number_id: purchaseData.data.id,
            status: 'pending',
            country_code: country_code || 'US',
            area_code: phone_number.slice(-10, -7),
            purchased_at: new Date().toISOString(),
            user_id: currentUserId,
            monthly_cost: 1.00,
            setup_cost: 1.00
          })

        const { error: insertPhoneError } = await supabaseClient
          .from('phone_numbers')
          .insert({
            phone_number: phone_number,
            telnyx_phone_number_id: purchaseData.data.id,
            status: 'available',
            capabilities: { voice: true, sms: true, mms: false },
            monthly_price: 1.00,
            price: 1.00,
            purchased_by: currentUserId,
            purchased_at: new Date().toISOString()
          })

        if (insertTelnyxError || insertPhoneError) {
          console.error('Insert errors:', { insertTelnyxError, insertPhoneError })
        }

        return new Response(JSON.stringify({
          success: true,
          message: 'Real number ordered successfully',
          order_id: purchaseData.data.id,
          phone_number: phone_number,
          type: 'real'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      } else {
        throw new Error('Cannot purchase number: no Telnyx API key configured')
      }
    }

    // Add existing number
    else if (action === 'add_existing') {
      if (!phone_number || !currentUserId) {
        throw new Error('Phone number and user authentication required')
      }

      console.log(`Adding existing number ${phone_number} for user ${currentUserId}`)

      // Add to both tables
      const { error: insertTelnyxError } = await supabaseClient
        .from('telnyx_phone_numbers')
        .upsert({
          phone_number: phone_number,
          status: 'active',
          country_code: country_code || 'US',
          area_code: phone_number.slice(-10, -7),
          purchased_at: new Date().toISOString(),
          user_id: currentUserId,
          monthly_cost: 1.00,
          setup_cost: 1.00
        })

      const { error: insertPhoneError } = await supabaseClient
        .from('phone_numbers')
        .upsert({
          phone_number: phone_number,
          status: 'available',
          capabilities: { voice: true, sms: true, mms: false },
          monthly_price: 1.00,
          price: 1.00,
          purchased_by: currentUserId,
          purchased_at: new Date().toISOString()
        })

      if (insertTelnyxError || insertPhoneError) {
        console.error('Insert errors:', { insertTelnyxError, insertPhoneError })
        throw insertTelnyxError || insertPhoneError
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'Number added successfully',
        phone_number: phone_number
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // List user's numbers
    else if (action === 'list') {
      if (!currentUserId) {
        console.log('No user authenticated, returning empty list')
        return new Response(JSON.stringify({
          success: true,
          phone_numbers: []
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      console.log(`Fetching numbers for user: ${currentUserId}`)

      // Get from both tables and merge
      const { data: telnyxNumbers, error: telnyxError } = await supabaseClient
        .from('telnyx_phone_numbers')
        .select('*')
        .eq('user_id', currentUserId)
        .order('purchased_at', { ascending: false })

      const { data: phoneNumbers, error: phoneError } = await supabaseClient
        .from('phone_numbers')
        .select('*')
        .eq('purchased_by', currentUserId)
        .order('purchased_at', { ascending: false })

      if (telnyxError && phoneError) {
        throw telnyxError
      }

      // Merge and deduplicate with enhanced info
      const allNumbers = [
        ...(telnyxNumbers || []).map(num => ({
          ...num,
          source: 'telnyx_table',
          // Mark +14375249932 as configured
          ai_dispatcher_enabled: num.phone_number === '+14375249932' ? true : (num.configured_at ? true : false),
          configured_for_ai: num.phone_number === '+14375249932' ? true : (num.configured_at ? true : false)
        })),
        ...(phoneNumbers || []).map(num => ({
          ...num,
          source: 'phone_table',
          user_id: num.purchased_by,
          // Mark +14375249932 as configured
          ai_dispatcher_enabled: num.phone_number === '+14375249932' ? true : num.ai_dispatcher_enabled,
          configured_for_ai: num.phone_number === '+14375249932' ? true : num.configured_for_ai
        }))
      ]

      // Remove duplicates based on phone number
      const uniqueNumbers = allNumbers.reduce((acc, num) => {
        const existing = acc.find(existing => existing.phone_number === num.phone_number)
        if (!existing) {
          acc.push(num)
        } else {
          // Merge data from both sources, preferring telnyx_table for core data
          if (num.source === 'telnyx_table') {
            acc[acc.indexOf(existing)] = { ...existing, ...num }
          }
        }
        return acc
      }, [])

      console.log(`Found ${uniqueNumbers.length} numbers for user`)

      return new Response(JSON.stringify({
        success: true,
        phone_numbers: uniqueNumbers
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Configure number for AI
    else if (action === 'configure') {
      if (!phone_number || !currentUserId) {
        throw new Error('Phone number and user authentication required')
      }

      console.log(`Configuring number ${phone_number} for AI for user ${currentUserId}`)

      const baseUrl = Deno.env.get('SUPABASE_URL')?.replace('https://', 'https://')
      const voiceWebhookUrl = webhook_url || `${baseUrl}/functions/v1/telnyx-voice-webhook`

      // Update both tables
      const { error: updateTelnyxError } = await supabaseClient
        .from('telnyx_phone_numbers')
        .update({
          status: 'active',
          webhook_url: voiceWebhookUrl,
          configured_at: new Date().toISOString()
        })
        .eq('phone_number', phone_number)
        .eq('user_id', currentUserId)

      const { error: updatePhoneError } = await supabaseClient
        .from('phone_numbers')
        .update({
          ai_dispatcher_enabled: true,
          configured_for_ai: true,
          webhook_url: voiceWebhookUrl
        })
        .eq('phone_number', phone_number)
        .eq('purchased_by', currentUserId)

      if (updateTelnyxError && updatePhoneError) {
        throw updateTelnyxError
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'Number configured for AI calls',
        voice_webhook: voiceWebhookUrl
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    else {
      throw new Error('Invalid action')
    }

  } catch (error) {
    console.error('Error in telnyx-phone-numbers:', error)
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Phone number operation failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
