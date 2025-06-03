
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

interface TelnyxPhoneNumberRequest {
  action: 'search' | 'purchase' | 'list' | 'configure' | 'add_existing';
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

    // Search available numbers (including our test number)
    if (action === 'search') {
      console.log(`Searching for numbers with area_code: ${area_code}`)
      
      // First, get available numbers from our database (like the test number)
      const { data: localAvailableNumbers, error: localError } = await supabaseClient
        .from('telnyx_phone_numbers')
        .select('*')
        .eq('status', 'available')
        .is('user_id', null)

      if (localError) {
        console.error('Error fetching local numbers:', localError)
      }

      console.log('Local available numbers:', localAvailableNumbers)

      // Filter by area code if provided
      const filteredLocalNumbers = localAvailableNumbers?.filter(num => 
        !area_code || num.area_code === area_code
      ) || []

      // Also search Telnyx API for real numbers if API key is available
      let telnyxNumbers = []
      if (telnyxApiKey) {
        try {
          const searchParams = new URLSearchParams({
            'filter[country_code]': country_code || 'US',
            'filter[features][]': 'sms',
            'page[size]': '10'
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
          console.log('Telnyx API error (continuing with local numbers):', error)
        }
      }

      // Combine local and Telnyx numbers
      const localNumbers = filteredLocalNumbers?.map(num => ({
        phone_number: num.phone_number,
        region_information: [{
          region_name: num.region || 'Test Region',
          rate_center: num.locality || 'Test Center'
        }],
        features: ['sms', 'voice'],
        cost_information: {
          monthly_cost: num.monthly_cost || 0,
          setup_cost: num.setup_cost || 0
        },
        source: 'local'
      })) || []

      const allNumbers = [...localNumbers, ...telnyxNumbers]

      console.log(`Found ${allNumbers.length} total numbers (${localNumbers.length} local + ${telnyxNumbers.length} telnyx)`)

      return new Response(JSON.stringify({
        success: true,
        available_numbers: allNumbers
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Purchase number (works for both local test numbers and real Telnyx numbers)
    else if (action === 'purchase') {
      if (!phone_number) {
        throw new Error('Phone number is required for purchase')
      }

      if (!currentUserId) {
        throw new Error('User authentication required for purchase')
      }

      console.log(`Purchasing number ${phone_number} for user ${currentUserId}`)

      // Check if this is a local test number
      const { data: localNumber } = await supabaseClient
        .from('telnyx_phone_numbers')
        .select('*')
        .eq('phone_number', phone_number)
        .eq('status', 'available')
        .is('user_id', null)
        .single()

      if (localNumber) {
        console.log('Purchasing local test number')
        // This is a local test number, just assign it to the user
        const { error: updateError } = await supabaseClient
          .from('telnyx_phone_numbers')
          .update({
            user_id: currentUserId,
            status: 'active',
            purchased_at: new Date().toISOString()
          })
          .eq('phone_number', phone_number)

        if (updateError) {
          throw updateError
        }

        return new Response(JSON.stringify({
          success: true,
          message: 'Test number purchased successfully',
          phone_number: phone_number,
          type: 'test'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      } else if (telnyxApiKey) {
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
            user_id: currentUserId
          })

        if (insertError) {
          console.error('Error saving to database:', insertError)
        }

        return new Response(JSON.stringify({
          success: true,
          message: 'Number ordered successfully',
          order_id: purchaseData.data.id,
          phone_number: phone_number,
          type: 'real'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      } else {
        throw new Error('Cannot purchase number: no API key configured and number not found in local database')
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
          user_id: currentUserId
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

    // List user's numbers
    else if (action === 'list') {
      if (!currentUserId) {
        return new Response(JSON.stringify({
          success: true,
          phone_numbers: []
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      console.log(`Fetching numbers for user: ${currentUserId}`)

      const { data: userNumbers, error } = await supabaseClient
        .from('telnyx_phone_numbers')
        .select('*')
        .eq('user_id', currentUserId)
        .order('purchased_at', { ascending: false })

      if (error) {
        console.error('Error fetching user numbers:', error)
        throw error
      }

      console.log(`Found ${userNumbers?.length || 0} numbers for user`)

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
