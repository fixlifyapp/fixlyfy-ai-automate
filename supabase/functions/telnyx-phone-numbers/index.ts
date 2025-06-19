
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
    console.log('📞 Telnyx phone numbers request received');
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the authorization header to determine the user
    const authHeader = req.headers.get('Authorization')
    console.log('Authorization header present:', !!authHeader)
    
    // Verify the user token for authenticated requests
    let user = null;
    if (authHeader) {
      const { data: userData, error: authError } = await supabaseAdmin.auth.getUser(
        authHeader?.replace('Bearer ', '') || ''
      )
      
      if (authError) {
        console.error('Authentication error:', authError)
      } else {
        user = userData.user;
        console.log('Authenticated user:', user?.id)
      }
    }

    const requestBody = await req.json()
    console.log('📞 Request body:', { action: requestBody.action, ...Object.fromEntries(Object.entries(requestBody).filter(([k]) => k !== 'action')) });
    
    const { action } = requestBody;

    const telnyxApiKey = Deno.env.get('TELNYX_API_KEY')
    if (!telnyxApiKey) {
      console.error('❌ TELNYX_API_KEY not configured')
      throw new Error('Telnyx API key not configured')
    }

    // Handle different actions
    switch (action) {
      case 'search': {
        console.log('🔍 Searching for available phone numbers...');
        
        const { 
          country_code = 'US', 
          area_code, 
          locality, 
          administrative_area,
          number_type = 'local'
        } = requestBody;

        // Build Telnyx search parameters
        const searchParams = new URLSearchParams({
          'filter[country_code]': country_code,
          'filter[phone_number_type]': number_type,
          'page[size]': '10'
        });

        if (area_code) {
          searchParams.append('filter[area_code]', area_code);
        }
        if (locality) {
          searchParams.append('filter[locality]', locality);
        }
        if (administrative_area) {
          searchParams.append('filter[administrative_area]', administrative_area);
        }

        console.log('🔍 Telnyx search params:', searchParams.toString());

        const searchResponse = await fetch(`https://api.telnyx.com/v2/available_phone_numbers?${searchParams}`, {
          headers: {
            'Authorization': `Bearer ${telnyxApiKey}`,
            'Content-Type': 'application/json'
          }
        });

        const searchResult = await searchResponse.json();
        console.log('🔍 Telnyx search response status:', searchResponse.status);

        if (!searchResponse.ok) {
          console.error('❌ Telnyx search error:', searchResult);
          throw new Error(searchResult.errors?.[0]?.detail || 'Failed to search for phone numbers');
        }

        const availableNumbers = searchResult.data?.map((number: any) => ({
          phone_number: number.phone_number,
          region_information: number.region_information,
          features: number.features,
          cost_information: number.cost_information,
          source: 'telnyx'
        })) || [];

        console.log('✅ Found available numbers:', availableNumbers.length);

        return new Response(
          JSON.stringify({ 
            success: true, 
            available_numbers: availableNumbers,
            total: availableNumbers.length
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      }

      case 'purchase': {
        if (!user) {
          throw new Error('Authentication required for purchasing phone numbers');
        }

        console.log('💰 Purchasing phone number...');
        
        const { phone_number, country_code = 'US' } = requestBody;

        if (!phone_number) {
          throw new Error('Phone number is required for purchase');
        }

        console.log('💰 Purchasing:', phone_number);

        // Reserve the phone number with Telnyx
        const purchaseResponse = await fetch('https://api.telnyx.com/v2/phone_number_orders', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${telnyxApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            phone_numbers: [{ phone_number }],
            messaging_profile_id: "4001972b-8bcb-40d6-afe4-363fd5ccada1", // Default messaging profile
            connection_id: "2467892542" // Default connection
          })
        });

        const purchaseResult = await purchaseResponse.json();
        console.log('💰 Telnyx purchase response status:', purchaseResponse.status);
        console.log('💰 Telnyx purchase result:', purchaseResult);

        if (!purchaseResponse.ok) {
          console.error('❌ Telnyx purchase error:', purchaseResult);
          throw new Error(purchaseResult.errors?.[0]?.detail || 'Failed to purchase phone number');
        }

        // Store the purchased number in our database
        const { data: insertedNumber, error: insertError } = await supabaseAdmin
          .from('telnyx_phone_numbers')
          .insert({
            user_id: user.id,
            phone_number: phone_number,
            telnyx_number_id: purchaseResult.data?.phone_numbers?.[0]?.id,
            country_code: country_code,
            area_code: phone_number.replace(/\D/g, '').slice(1, 4),
            status: 'active',
            purchased_at: new Date().toISOString(),
            monthly_cost: 0.00, // Free for now
            setup_cost: 0.00 // Free for now
          })
          .select()
          .single();

        if (insertError) {
          console.error('❌ Database insert error:', insertError);
          throw new Error('Failed to save phone number to database');
        }

        console.log('✅ Phone number purchased and saved:', insertedNumber);

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Phone number purchased successfully',
            phone_number: insertedNumber.phone_number,
            id: insertedNumber.id
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      }

      case 'claim_existing': {
        if (!user) {
          throw new Error('Authentication required for claiming phone numbers');
        }

        console.log('🎁 Claiming existing phone number...');
        
        const { phone_number } = requestBody;

        if (!phone_number) {
          throw new Error('Phone number is required for claiming');
        }

        // Check if this is the special claimable number
        if (phone_number !== '+14375249932') {
          throw new Error('This phone number is not available for claiming');
        }

        console.log('🎁 Claiming special number:', phone_number);

        // Store the claimed number in our database
        const { data: claimedNumber, error: claimError } = await supabaseAdmin
          .from('telnyx_phone_numbers')
          .insert({
            user_id: user.id,
            phone_number: phone_number,
            telnyx_number_id: 'existing-telnyx-number',
            country_code: 'CA',
            area_code: '437',
            status: 'active',
            purchased_at: new Date().toISOString(),
            configured_at: new Date().toISOString(),
            monthly_cost: 0.00,
            setup_cost: 0.00
          })
          .select()
          .single();

        if (claimError) {
          console.error('❌ Database claim error:', claimError);
          
          if (claimError.code === '23505') { // Unique constraint violation
            throw new Error('This phone number has already been claimed');
          }
          
          throw new Error('Failed to claim phone number');
        }

        console.log('✅ Phone number claimed successfully:', claimedNumber);

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Phone number claimed successfully',
            phone_number: claimedNumber.phone_number,
            id: claimedNumber.id
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      }

      case 'check_claimable': {
        console.log('🔍 Checking if number is claimable...');
        
        const { phone_number } = requestBody;

        // Check if this specific number is claimable and not already claimed
        const { data: existingNumber, error: checkError } = await supabaseAdmin
          .from('telnyx_phone_numbers')
          .select('id, user_id')
          .eq('phone_number', phone_number)
          .maybeSingle();

        if (checkError) {
          console.error('❌ Database check error:', checkError);
          throw new Error('Failed to check phone number availability');
        }

        const isClaimable = phone_number === '+14375249932' && !existingNumber;

        console.log('🔍 Claimable check result:', { phone_number, isClaimable, existingNumber: !!existingNumber });

        return new Response(
          JSON.stringify({ 
            success: true, 
            claimable: isClaimable,
            already_claimed: !!existingNumber
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      }

      case 'list': {
        console.log('📋 Listing user phone numbers...');
        
        // Get phone numbers for the authenticated user or all if no user
        let query = supabaseAdmin
          .from('telnyx_phone_numbers')
          .select('*')
          .order('purchased_at', { ascending: false });

        if (user) {
          query = query.eq('user_id', user.id);
        }

        const { data: phoneNumbers, error: listError } = await query;

        if (listError) {
          console.error('❌ Database list error:', listError);
          throw new Error('Failed to retrieve phone numbers');
        }

        console.log('📋 Found phone numbers:', phoneNumbers?.length || 0);

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

      case 'configure': {
        if (!user) {
          throw new Error('Authentication required for configuring phone numbers');
        }

        console.log('⚙️ Configuring phone number for AI...');
        
        const { phone_number } = requestBody;

        if (!phone_number) {
          throw new Error('Phone number is required for configuration');
        }

        // Update the phone number as configured
        const { data: configuredNumber, error: configError } = await supabaseAdmin
          .from('telnyx_phone_numbers')
          .update({
            configured_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('phone_number', phone_number)
          .eq('user_id', user.id)
          .select()
          .single();

        if (configError) {
          console.error('❌ Configuration error:', configError);
          throw new Error('Failed to configure phone number');
        }

        console.log('✅ Phone number configured:', configuredNumber);

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Phone number configured for AI calls',
            phone_number: configuredNumber.phone_number
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      }

      case 'get_config': {
        console.log('🔧 Getting Telnyx configuration...');
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            config: {
              api_key_configured: !!telnyxApiKey,
              messaging_profile_id: "4001972b-8bcb-40d6-afe4-363fd5ccada1",
              connection_id: "2467892542"
            }
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      }

      default:
        throw new Error(`Invalid action: ${action}`);
    }

  } catch (error) {
    console.error('❌ Error in telnyx-phone-numbers function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to process phone number request'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
