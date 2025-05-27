
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

    // Get AWS credentials and Amazon Connect instance
    const awsAccessKeyId = Deno.env.get('AWS_ACCESS_KEY_ID');
    const awsSecretAccessKey = Deno.env.get('AWS_SECRET_ACCESS_KEY');
    const awsRegion = Deno.env.get('AWS_REGION') || 'us-east-1';
    const connectInstanceId = Deno.env.get('AMAZON_CONNECT_INSTANCE_ID');

    if (!awsAccessKeyId || !awsSecretAccessKey || !connectInstanceId) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'AWS credentials or Connect instance ID not configured' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Helper function to make AWS API calls
    const makeAwsRequest = async (service: string, action: string, payload: any) => {
      const host = `${service}.${awsRegion}.amazonaws.com`;
      const url = `https://${host}/`;
      
      // Simple AWS signature (for production, use proper AWS SDK)
      const headers = {
        'Content-Type': 'application/x-amz-json-1.1',
        'X-Amz-Target': `Connect_20170801.${action}`,
        'Authorization': `AWS4-HMAC-SHA256 Credential=${awsAccessKeyId}/${new Date().toISOString().slice(0, 10)}/${awsRegion}/${service}/aws4_request, SignedHeaders=host;x-amz-date, Signature=dummy`
      };

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      return response.json();
    };

    switch (action) {
      case 'search':
        // Search for available phone numbers using Amazon Connect
        try {
          const searchPayload = {
            InstanceId: connectInstanceId,
            PhoneNumberCountryCode: country || 'US',
            PhoneNumberType: 'DID',
            MaxResults: 20
          };

          // For demo purposes, return mock data that matches expected format
          // In production, you would call the actual Amazon Connect API
          const mockPhoneNumbers = [
            {
              phoneNumber: '+15551234567',
              locality: 'San Francisco',
              region: 'CA',
              price: '2.00',
              capabilities: { voice: true, sms: true, mms: false }
            },
            {
              phoneNumber: '+15551234568',
              locality: 'San Francisco',
              region: 'CA', 
              price: '2.00',
              capabilities: { voice: true, sms: true, mms: false }
            }
          ];

          return new Response(JSON.stringify({
            success: true,
            phone_numbers: mockPhoneNumbers
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        } catch (error) {
          console.error('Search error:', error);
          return new Response(JSON.stringify({
            success: false,
            error: 'Failed to search phone numbers'
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

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

        try {
          // Purchase the phone number using Amazon Connect
          const purchasePayload = {
            InstanceId: connectInstanceId,
            PhoneNumber: phoneNumber,
            PhoneNumberCountryCode: 'US',
            PhoneNumberType: 'DID'
          };

          // For demo purposes, simulate successful purchase
          // In production, you would call ClaimPhoneNumber API
          const mockPurchaseResult = {
            PhoneNumberId: `phone-${Date.now()}`,
            PhoneNumberArn: `arn:aws:connect:${awsRegion}:123456789:phone-number/${phoneNumber}`,
            PhoneNumber: phoneNumber
          };

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
              connect_instance_id: connectInstanceId,
              connect_phone_number_arn: mockPurchaseResult.PhoneNumberArn,
              status: 'owned',
              purchased_by: user.id,
              purchased_at: new Date().toISOString(),
              capabilities: {
                voice: true,
                sms: true,
                mms: false
              },
              locality: 'San Francisco',
              region: 'CA',
              price: 2.00,
              monthly_price: 1.00,
              country_code: 'US',
              phone_number_type: 'local',
              price_unit: 'USD'
            });

          if (dbError) {
            console.error('Error storing phone number:', dbError);
            throw new Error('Failed to store phone number in database');
          }

          return new Response(JSON.stringify({
            success: true,
            phone_number: mockPurchaseResult
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        } catch (error) {
          console.error('Purchase error:', error);
          return new Response(JSON.stringify({
            success: false,
            error: error.message || 'Failed to purchase phone number'
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

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
