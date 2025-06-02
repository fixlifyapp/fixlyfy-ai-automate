
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

interface TelnyxPhoneNumberRequest {
  action: 'search' | 'purchase' | 'list' | 'configure';
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

    const telnyxApiKey = Deno.env.get('TELNYX_API_KEY')
    if (!telnyxApiKey) {
      throw new Error('TELNYX_API_KEY not configured')
    }

    const { action, area_code, country_code, phone_number, webhook_url }: TelnyxPhoneNumberRequest = await req.json()

    // Search available numbers
    if (action === 'search') {
      const searchParams = new URLSearchParams({
        'filter[country_code]': country_code || 'US',
        'filter[features][]': 'sms',
        'filter[features][]': 'voice',
        'page[size]': '20'
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

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(`Telnyx search error: ${JSON.stringify(data)}`)
      }

      return new Response(JSON.stringify({
        success: true,
        available_numbers: data.data?.map((num: any) => ({
          phone_number: num.phone_number,
          region_information: num.region_information,
          features: num.features,
          cost_information: num.cost_information
        })) || []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Purchase number
    else if (action === 'purchase') {
      if (!phone_number) {
        throw new Error('Phone number is required for purchase')
      }

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

      // Save to our database
      const { error: insertError } = await supabaseClient
        .from('telnyx_phone_numbers')
        .insert({
          phone_number: phone_number,
          order_id: purchaseData.data.id,
          status: 'pending',
          country_code: country_code || 'US',
          purchased_at: new Date().toISOString()
        })

      if (insertError) {
        console.error('Error saving to database:', insertError)
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'Number ordered successfully',
        order_id: purchaseData.data.id,
        phone_number: phone_number
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Add existing number (for numbers you already own)
    else if (action === 'add_existing') {
      if (!phone_number) {
        throw new Error('Phone number is required')
      }

      // Add to our database as active
      const { error: insertError } = await supabaseClient
        .from('telnyx_phone_numbers')
        .upsert({
          phone_number: phone_number,
          status: 'active',
          country_code: country_code || 'US',
          area_code: phone_number.slice(-10, -7), // Extract area code
          purchased_at: new Date().toISOString()
        })

      if (insertError) {
        console.error('Error saving to database:', insertError)
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

    // List our numbers
    else if (action === 'list') {
      const { data: localNumbers } = await supabaseClient
        .from('telnyx_phone_numbers')
        .select('*')
        .order('purchased_at', { ascending: false })

      // Also get current status from Telnyx
      const telnyxResponse = await fetch('https://api.telnyx.com/v2/phone_numbers', {
        headers: {
          'Authorization': `Bearer ${telnyxApiKey}`,
          'Content-Type': 'application/json',
        }
      })

      const telnyxData = await telnyxResponse.json()
      const telnyxNumbers = telnyxData.data || []

      // Combine data
      const combinedNumbers = localNumbers?.map(localNum => {
        const telnyxNum = telnyxNumbers.find((tn: any) => tn.phone_number === localNum.phone_number)
        return {
          ...localNum,
          telnyx_status: telnyxNum?.status,
          messaging_profile_id: telnyxNum?.messaging_profile_id,
          connection_id: telnyxNum?.connection_id
        }
      }) || []

      return new Response(JSON.stringify({
        success: true,
        phone_numbers: combinedNumbers
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Configure number for webhooks
    else if (action === 'configure') {
      if (!phone_number) {
        throw new Error('Phone number is required for configuration')
      }

      const baseUrl = Deno.env.get('SUPABASE_URL')?.replace('https://', 'https://')
      const voiceWebhookUrl = webhook_url || `${baseUrl}/functions/v1/telnyx-voice-webhook`
      const smsWebhookUrl = `${baseUrl}/functions/v1/telnyx-sms`

      // Configure number for voice calls and SMS
      const configResponse = await fetch(`https://api.telnyx.com/v2/phone_numbers/${phone_number}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${telnyxApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          webhook_url: voiceWebhookUrl,
          webhook_failover_url: voiceWebhookUrl,
          connection_name: 'AI Voice Assistant'
        })
      })

      if (!configResponse.ok) {
        const errorData = await configResponse.json()
        console.error('Configuration error:', errorData)
      }

      // Update status in database
      await supabaseClient
        .from('telnyx_phone_numbers')
        .update({
          status: 'active',
          webhook_url: voiceWebhookUrl,
          configured_at: new Date().toISOString()
        })
        .eq('phone_number', phone_number)

      return new Response(JSON.stringify({
        success: true,
        message: 'Number configured for AI calls',
        voice_webhook: voiceWebhookUrl,
        sms_webhook: smsWebhookUrl
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
