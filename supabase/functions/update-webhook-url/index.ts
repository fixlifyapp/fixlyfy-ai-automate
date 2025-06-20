
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

    const { phone_number, new_webhook_url } = await req.json()
    
    console.log('Updating webhook URL for phone number:', phone_number)
    console.log('New webhook URL:', new_webhook_url)

    const telnyxApiKey = Deno.env.get('TELNYX_API_KEY')
    if (!telnyxApiKey) {
      console.error('TELNYX_API_KEY not configured')
      throw new Error('Telnyx API key not configured')
    }

    // Get the phone number record from our database
    const { data: phoneNumberRecord, error: phoneError } = await supabaseClient
      .from('telnyx_phone_numbers')
      .select('*')
      .eq('phone_number', phone_number)
      .eq('user_id', user.id)
      .single()

    if (phoneError || !phoneNumberRecord) {
      console.error('Phone number not found:', phoneError)
      throw new Error('Phone number not found in your account')
    }

    console.log('Found phone number record:', phoneNumberRecord)

    // First, get all phone numbers from Telnyx to find the correct ID
    const listResponse = await fetch('https://api.telnyx.com/v2/phone_numbers', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${telnyxApiKey}`,
        'Content-Type': 'application/json'
      }
    })

    const listResult = await listResponse.json()
    console.log('Telnyx phone numbers response:', listResult)

    if (!listResponse.ok) {
      console.error('Failed to fetch phone numbers from Telnyx:', listResult)
      throw new Error('Failed to fetch phone numbers from Telnyx')
    }

    // Find the phone number in the list
    const telnyxPhoneNumber = listResult.data?.find((num: any) => 
      num.phone_number === phone_number
    )

    if (!telnyxPhoneNumber) {
      console.error('Phone number not found in Telnyx:', phone_number)
      throw new Error('Phone number not found in Telnyx account')
    }

    console.log('Found Telnyx phone number:', telnyxPhoneNumber)

    // Update the webhook URL for this specific phone number
    const updateResponse = await fetch(`https://api.telnyx.com/v2/phone_numbers/${telnyxPhoneNumber.id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${telnyxApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        webhook_url: new_webhook_url
      })
    })

    const updateResult = await updateResponse.json()
    console.log('Telnyx webhook update response:', updateResult)

    if (!updateResponse.ok) {
      console.error('Failed to update webhook URL in Telnyx:', updateResult)
      throw new Error(updateResult.errors?.[0]?.detail || 'Failed to update webhook URL in Telnyx')
    }

    // Update our database record
    const { error: dbUpdateError } = await supabaseClient
      .from('telnyx_phone_numbers')
      .update({
        webhook_url: new_webhook_url,
        telnyx_phone_number_id: telnyxPhoneNumber.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', phoneNumberRecord.id)

    if (dbUpdateError) {
      console.error('Failed to update database record:', dbUpdateError)
      // Don't throw error here as Telnyx was updated successfully
    }

    console.log('Webhook URL updated successfully')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Webhook URL updated successfully',
        data: updateResult.data
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error updating webhook URL:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to update webhook URL'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
