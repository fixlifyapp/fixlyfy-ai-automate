
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { action, query, phone_number } = await req.json();

    // Get Twilio credentials
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');

    if (!twilioAccountSid || !twilioAuthToken) {
      return new Response(
        JSON.stringify({ success: false, error: 'Twilio credentials not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const authString = btoa(`${twilioAccountSid}:${twilioAuthToken}`);

    switch (action) {
      case 'search':
        if (!query) {
          return new Response(
            JSON.stringify({ success: false, error: 'Search query is required' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }

        // Search for available phone numbers
        const searchUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/AvailablePhoneNumbers/US/Local.json?Contains=${encodeURIComponent(query)}`;
        
        const searchResponse = await fetch(searchUrl, {
          headers: {
            'Authorization': `Basic ${authString}`,
          },
        });

        const searchResult = await searchResponse.json();

        if (searchResponse.ok) {
          const phoneNumbers = searchResult.available_phone_numbers.map((num: any) => ({
            phone_number: num.phone_number,
            friendly_name: num.friendly_name,
            locality: num.locality || 'N/A',
            region: num.region || 'N/A',
            country_code: num.iso_country,
            price: '1.00',
            monthly_price: '1.00',
            capabilities: {
              voice: num.capabilities.voice,
              sms: num.capabilities.sms,
              mms: num.capabilities.mms,
            },
          }));

          return new Response(
            JSON.stringify({ success: true, phone_numbers: phoneNumbers }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          return new Response(
            JSON.stringify({ success: false, error: searchResult.message || 'Failed to search phone numbers' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }

      case 'purchase':
        if (!phone_number) {
          return new Response(
            JSON.stringify({ success: false, error: 'Phone number is required' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }

        // Purchase phone number
        const purchaseUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/IncomingPhoneNumbers.json`;
        
        const purchaseResponse = await fetch(purchaseUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${authString}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            PhoneNumber: phone_number,
          }),
        });

        const purchaseResult = await purchaseResponse.json();

        if (purchaseResponse.ok) {
          // Store in database
          const { error: dbError } = await supabaseClient
            .from('phone_number_purchases')
            .insert({
              phone_number_id: crypto.randomUUID(),
              twilio_phone_number_sid: purchaseResult.sid,
              twilio_account_sid: twilioAccountSid,
              purchase_price: 1.00,
              monthly_cost: 1.00,
              status: 'active',
              purchase_date: new Date().toISOString(),
            });

          if (dbError) {
            console.error('Error storing purchase record:', dbError);
          }

          return new Response(
            JSON.stringify({ success: true, phone_number_sid: purchaseResult.sid }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          return new Response(
            JSON.stringify({ success: false, error: purchaseResult.message || 'Failed to purchase phone number' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }

      case 'list-owned':
        // Get owned phone numbers from Twilio
        const listUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/IncomingPhoneNumbers.json`;
        
        const listResponse = await fetch(listUrl, {
          headers: {
            'Authorization': `Basic ${authString}`,
          },
        });

        const listResult = await listResponse.json();

        if (listResponse.ok) {
          const ownedNumbers = listResult.incoming_phone_numbers.map((num: any) => ({
            id: num.sid,
            phone_number: num.phone_number,
            friendly_name: num.friendly_name,
            status: 'active',
            purchase_date: num.date_created,
            monthly_cost: 1.00,
          }));

          return new Response(
            JSON.stringify({ success: true, phone_numbers: ownedNumbers }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          return new Response(
            JSON.stringify({ success: false, error: listResult.message || 'Failed to list phone numbers' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }

      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid action' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
    }

  } catch (error) {
    console.error('Error in manage-phone-numbers function:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
