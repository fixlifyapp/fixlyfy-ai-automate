
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

interface TelnyxPhoneNumberRequest {
  action: 'search' | 'purchase' | 'list' | 'configure' | 'add_existing' | 'remove_test_numbers';
  area_code?: string;
  country_code?: string;
  phone_number?: string;
  webhook_url?: string;
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
      console.log('TELNYX_API_KEY not configured, working with local numbers only')
    }

    const { action, area_code, country_code, phone_number, webhook_url }: TelnyxPhoneNumberRequest = await req.json()

    // Remove test numbers from user account
    if (action === 'remove_test_numbers') {
      if (!currentUserId) {
        throw new Error('User authentication required')
      }

      console.log('Removing test numbers from user account')
      
      // Remove test numbers (those with monthly_cost = 0 and setup_cost = 0)
      const { error: removeError } = await supabaseClient
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

      if (removeError) {
        throw removeError
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'Test numbers removed from account'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Search available numbers (only real Telnyx numbers, no local test numbers)
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
        // This is a real Telnyx number, purchase it
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

        // Save to our database with user association
        const { error: insertError } = await supabaseClient
          .from('telnyx_phone_numbers')
          .insert({
            phone_number: phone_number,
            telnyx_phone_number_id: purchaseData.data.id,
            status: 'pending',
            country_code: country_code || 'US',
            area_code: phone_number.slice(-10, -7),
            purchased_at: new Date().toISOString(),
            user_id: currentUserId,
            monthly_cost: 1.00, // Real number cost
            setup_cost: 1.00    // Real number cost
          })

        if (insertError) {
          console.error('Error saving to database:', insertError)
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

      const { error: insertError } = await supabaseClient
        .from('telnyx_phone_numbers')
        .upsert({
          phone_number: phone_number,
          status: 'active',
          country_code: country_code || 'US',
          area_code: phone_number.slice(-10, -7),
          purchased_at: new Date().toISOString(),
          user_id: currentUserId,
          monthly_cost: 1.00, // Real number cost
          setup_cost: 1.00    // Real number cost
        })

      if (insertError) {
        throw insertError
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'Number added successfully',
        phone_number: phone_number
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // List user's numbers - only real numbers, not test numbers
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

      // Get user's real numbers (exclude test numbers with monthly_cost = 0)
      const { data: userNumbers, error } = await supabaseClient
        .from('telnyx_phone_numbers')
        .select('*')
        .eq('user_id', currentUserId)
        .not('status', 'eq', 'available')
        .or('monthly_cost.gt.0,setup_cost.gt.0') // Only real numbers with cost
        .order('purchased_at', { ascending: false })

      if (error) {
        console.error('Error fetching user numbers from telnyx_phone_numbers:', error)
        
        // Fallback to phone_numbers table
        const { data: fallbackNumbers, error: fallbackError } = await supabaseClient
          .from('phone_numbers')
          .select('*')
          .eq('purchased_by', currentUserId)
          .order('purchased_at', { ascending: false })

        if (fallbackError) {
          console.error('Error fetching from fallback table:', fallbackError)
          throw fallbackError
        }

        console.log(`Found ${fallbackNumbers?.length || 0} numbers in fallback table`)
        
        const convertedNumbers = fallbackNumbers?.map(num => ({
          id: num.id,
          phone_number: num.phone_number,
          status: num.status || 'active',
          country_code: 'US',
          area_code: num.phone_number.replace(/\D/g, '').slice(-10, -7),
          purchased_at: num.purchased_at || num.created_at,
          configured_at: num.ai_dispatcher_enabled ? num.updated_at : null,
          webhook_url: null,
          user_id: currentUserId,
          monthly_cost: num.monthly_price || 1.00,
          setup_cost: num.price || 1.00
        })) || []

        return new Response(JSON.stringify({
          success: true,
          phone_numbers: convertedNumbers
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      console.log(`Found ${userNumbers?.length || 0} real numbers for user`)

      return new Response(JSON.stringify({
        success: true,
        phone_numbers: userNumbers || []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Configure number for AI
    else if (action === 'configure') {
      if (!phone_number || !currentUserId) {
        throw new Error('Phone number and user authentication required')
      }

      const baseUrl = Deno.env.get('SUPABASE_URL')?.replace('https://', 'https://')
      const voiceWebhookUrl = webhook_url || `${baseUrl}/functions/v1/telnyx-voice-webhook`

      // Update status in database
      const { error: updateError } = await supabaseClient
        .from('telnyx_phone_numbers')
        .update({
          status: 'active',
          webhook_url: voiceWebhookUrl,
          configured_at: new Date().toISOString()
        })
        .eq('phone_number', phone_number)
        .eq('user_id', currentUserId)

      if (updateError) {
        throw updateError
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
