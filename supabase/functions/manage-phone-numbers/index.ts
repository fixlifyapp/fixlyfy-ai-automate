import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TwilioPhoneNumber {
  phoneNumber: string;
  friendlyName: string;
  region: string;
  locality: string;
  rateCenter: string;
  latitude: string;
  longitude: string;
  capabilities: {
    voice: boolean;
    SMS: boolean;
    MMS: boolean;
  };
  phoneNumberType: string;
  priceUnit: string;
  price: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token)
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    const { action, ...body } = await req.json()

    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')

    if (!twilioAccountSid || !twilioAuthToken) {
      return new Response(JSON.stringify({ 
        error: 'Twilio credentials not configured' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    const twilioAuth = btoa(`${twilioAccountSid}:${twilioAuthToken}`)

    switch (action) {
      case 'search':
        return await searchPhoneNumbers(body, twilioAuth, supabaseClient)
      case 'purchase':
        return await purchasePhoneNumber(body, twilioAuth, supabaseClient, userData.user.id)
      case 'release':
        return await releasePhoneNumber(body, twilioAuth, supabaseClient, userData.user.id)
      case 'list-owned':
        return await listOwnedNumbers(supabaseClient, userData.user.id)
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        })
    }
  } catch (error) {
    console.error('Error in manage-phone-numbers:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

async function searchPhoneNumbers(params: any, twilioAuth: string, supabaseClient: any) {
  const { areaCode, locality, region, contains } = params
  
  console.log('Search params:', { areaCode, locality, region, contains })
  
  let allNumbers: TwilioPhoneNumber[] = []
  const numberTypes = ['Local', 'Mobile', 'TollFree']
  
  // Try each number type to get more results
  for (const numberType of numberTypes) {
    try {
      let searchUrl = `https://api.twilio.com/2010-04-01/Accounts/${Deno.env.get('TWILIO_ACCOUNT_SID')}/AvailablePhoneNumbers/US/${numberType}.json?`
      
      const searchParams = new URLSearchParams()
      
      // Add limit to get more results
      searchParams.append('Limit', '20')
      
      if (areaCode) {
        searchParams.append('AreaCode', areaCode)
      } else if (locality) {
        searchParams.append('InLocality', locality)
      } else if (region) {
        searchParams.append('InRegion', region)
      } else if (contains) {
        searchParams.append('Contains', contains)
      } else {
        // If no specific criteria, search for popular area codes
        const popularAreaCodes = ['415', '650', '510', '925', '408', '669', '831']
        const randomAreaCode = popularAreaCodes[Math.floor(Math.random() * popularAreaCodes.length)]
        searchParams.append('AreaCode', randomAreaCode)
      }
      
      searchUrl += searchParams.toString()
      console.log(`Searching ${numberType} numbers:`, searchUrl)

      const response = await fetch(searchUrl, {
        headers: {
          'Authorization': `Basic ${twilioAuth}`,
        },
      })

      if (!response.ok) {
        console.error(`Twilio ${numberType} API error:`, response.statusText)
        continue
      }

      const data = await response.json()
      console.log(`${numberType} search results:`, data.available_phone_numbers?.length || 0)
      
      if (data.available_phone_numbers && data.available_phone_numbers.length > 0) {
        allNumbers = allNumbers.concat(data.available_phone_numbers)
      }
      
    } catch (error) {
      console.error(`Error searching ${numberType} numbers:`, error)
      continue
    }
  }
  
  console.log('Total numbers found:', allNumbers.length)
  
  // If we still have no results, try a broader search
  if (allNumbers.length === 0) {
    console.log('No results found, trying broader search...')
    try {
      const broadSearchUrl = `https://api.twilio.com/2010-04-01/Accounts/${Deno.env.get('TWILIO_ACCOUNT_SID')}/AvailablePhoneNumbers/US/Local.json?Limit=20`
      
      const response = await fetch(broadSearchUrl, {
        headers: {
          'Authorization': `Basic ${twilioAuth}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Broad search results:', data.available_phone_numbers?.length || 0)
        allNumbers = data.available_phone_numbers || []
      }
    } catch (error) {
      console.error('Error in broad search:', error)
    }
  }
  
  // Store available numbers in database for caching
  if (allNumbers.length > 0) {
    const numbersToInsert = allNumbers.map((num: TwilioPhoneNumber) => ({
      phone_number: num.phoneNumber,
      friendly_name: num.friendlyName,
      region: num.region || 'Unknown',
      locality: num.locality || 'Unknown',
      rate_center: num.rateCenter || 'Unknown',
      latitude: parseFloat(num.latitude) || null,
      longitude: parseFloat(num.longitude) || null,
      capabilities: {
        voice: num.capabilities.voice,
        sms: num.capabilities.SMS,
        mms: num.capabilities.MMS
      },
      phone_number_type: num.phoneNumberType || 'local',
      price_unit: num.priceUnit || 'USD',
      price: parseFloat(num.price) || 1.00,
      monthly_price: 1.00,
      status: 'available'
    }))

    try {
      await supabaseClient
        .from('phone_numbers')
        .upsert(numbersToInsert, { 
          onConflict: 'phone_number',
          ignoreDuplicates: true 
        })
      console.log('Cached numbers in database')
    } catch (dbError) {
      console.error('Error caching numbers:', dbError)
    }
  }

  return new Response(JSON.stringify({ 
    available_phone_numbers: allNumbers,
    search_info: {
      total_found: allNumbers.length,
      search_criteria: { areaCode, locality, region, contains },
      number_types_searched: numberTypes
    }
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

async function purchasePhoneNumber(params: any, twilioAuth: string, supabaseClient: any, userId: string) {
  const { phoneNumber } = params

  // Purchase from Twilio
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${Deno.env.get('TWILIO_ACCOUNT_SID')}/IncomingPhoneNumbers.json`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${twilioAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      PhoneNumber: phoneNumber,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to purchase phone number: ${error}`)
  }

  const purchaseData = await response.json()

  // Update database
  const { data: phoneData, error: updateError } = await supabaseClient
    .from('phone_numbers')
    .update({
      status: 'purchased',
      twilio_sid: purchaseData.sid,
      purchased_by: userId,
      purchased_at: new Date().toISOString(),
    })
    .eq('phone_number', phoneNumber)
    .select()
    .single()

  if (updateError) {
    console.error('Error updating phone number:', updateError)
    throw new Error('Failed to update database')
  }

  // Create purchase record
  const { error: purchaseError } = await supabaseClient
    .from('phone_number_purchases')
    .insert({
      phone_number_id: phoneData.id,
      user_id: userId,
      purchase_price: phoneData.price,
      monthly_cost: phoneData.monthly_price,
      twilio_account_sid: Deno.env.get('TWILIO_ACCOUNT_SID'),
      twilio_phone_number_sid: purchaseData.sid,
      status: 'active'
    })

  if (purchaseError) {
    console.error('Error creating purchase record:', purchaseError)
  }

  return new Response(JSON.stringify({ 
    success: true,
    phone_number: phoneData,
    twilio_data: purchaseData 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

async function releasePhoneNumber(params: any, twilioAuth: string, supabaseClient: any, userId: string) {
  const { phoneNumberId } = params

  // Get phone number details
  const { data: phoneData, error: fetchError } = await supabaseClient
    .from('phone_numbers')
    .select('*')
    .eq('id', phoneNumberId)
    .eq('purchased_by', userId)
    .single()

  if (fetchError || !phoneData) {
    throw new Error('Phone number not found or not owned by user')
  }

  // Release from Twilio
  if (phoneData.twilio_sid) {
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${Deno.env.get('TWILIO_ACCOUNT_SID')}/IncomingPhoneNumbers/${phoneData.twilio_sid}.json`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Basic ${twilioAuth}`,
      },
    })

    if (!response.ok) {
      console.error('Failed to release from Twilio:', await response.text())
    }
  }

  // Update database
  const { error: updateError } = await supabaseClient
    .from('phone_numbers')
    .update({
      status: 'released',
      purchased_by: null,
      assigned_to: null,
    })
    .eq('id', phoneNumberId)

  if (updateError) {
    throw new Error('Failed to update database')
  }

  // Update purchase record
  await supabaseClient
    .from('phone_number_purchases')
    .update({ status: 'released' })
    .eq('phone_number_id', phoneNumberId)
    .eq('user_id', userId)

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

async function listOwnedNumbers(supabaseClient: any, userId: string) {
  const { data, error } = await supabaseClient
    .from('phone_numbers')
    .select(`
      *,
      phone_number_purchases!inner(*)
    `)
    .eq('purchased_by', userId)
    .eq('status', 'purchased')

  if (error) {
    throw new Error('Failed to fetch owned numbers')
  }

  return new Response(JSON.stringify({ phone_numbers: data }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
