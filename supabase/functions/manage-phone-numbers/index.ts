
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PhoneNumberRequest {
  action: 'search' | 'purchase' | 'list-owned';
  areaCode?: string;
  contains?: string;
  country?: string;
  phoneNumber?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { action, areaCode, contains, country, phoneNumber }: PhoneNumberRequest = await req.json();

    // Get Twilio credentials
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');

    if (!twilioAccountSid || !twilioAuthToken) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Twilio credentials not configured' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const basicAuth = btoa(`${twilioAccountSid}:${twilioAuthToken}`);

    switch (action) {
      case 'search':
        // Search for available phone numbers
        let searchUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/AvailablePhoneNumbers/${country || 'US'}/Local.json?`;
        const params = new URLSearchParams();
        if (areaCode) params.append('AreaCode', areaCode);
        if (contains) params.append('Contains', contains);
        params.append('Limit', '20');
        
        const searchResponse = await fetch(searchUrl + params.toString(), {
          headers: {
            'Authorization': `Basic ${basicAuth}`
          }
        });

        if (!searchResponse.ok) {
          throw new Error('Failed to search phone numbers');
        }

        const searchData = await searchResponse.json();
        
        return new Response(JSON.stringify({
          success: true,
          phone_numbers: searchData.available_phone_numbers || []
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      case 'purchase':
        if (!phoneNumber) {
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Phone number is required for purchase' 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Purchase the phone number
        const purchaseResponse = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/IncomingPhoneNumbers.json`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${basicAuth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            PhoneNumber: phoneNumber,
            SmsUrl: `${Deno.env.get('SUPABASE_URL')}/functions/v1/twilio-webhook`,
            VoiceUrl: `${Deno.env.get('SUPABASE_URL')}/functions/v1/twilio-webhook`
          })
        });

        if (!purchaseResponse.ok) {
          const errorData = await purchaseResponse.json();
          throw new Error(errorData.message || 'Failed to purchase phone number');
        }

        const purchaseData = await purchaseResponse.json();

        // Get user from auth header
        const { data: { user }, error: authError } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''));
        if (authError || !user) {
          throw new Error('Invalid authentication');
        }

        // Store in our database
        const { error: dbError } = await supabaseClient
          .from('phone_numbers')
          .insert({
            phone_number: phoneNumber,
            twilio_sid: purchaseData.sid,
            friendly_name: purchaseData.friendly_name,
            status: 'owned',
            purchased_by: user.id,
            purchased_at: new Date().toISOString(),
            capabilities: {
              voice: purchaseData.capabilities?.voice || true,
              sms: purchaseData.capabilities?.sms || true,
              mms: purchaseData.capabilities?.mms || false
            },
            locality: purchaseData.locality,
            region: purchaseData.region,
            price: 1.00,
            monthly_price: 1.00
          });

        if (dbError) {
          console.error('Error storing phone number:', dbError);
        }

        return new Response(JSON.stringify({
          success: true,
          phone_number: purchaseData
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      case 'list-owned':
        // Get user from auth header
        const { data: { user: listUser }, error: listAuthError } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''));
        if (listAuthError || !listUser) {
          throw new Error('Invalid authentication');
        }

        const { data: ownedNumbers, error: listError } = await supabaseClient
          .from('phone_numbers')
          .select('*')
          .eq('status', 'owned')
          .order('purchased_at', { ascending: false });

        if (listError) throw listError;

        return new Response(JSON.stringify({
          success: true,
          phone_numbers: ownedNumbers || []
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      default:
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Invalid action' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

  } catch (error) {
    console.error('Error in manage-phone-numbers function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
