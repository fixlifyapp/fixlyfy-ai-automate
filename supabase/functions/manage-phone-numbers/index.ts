
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

// Helper function to create AWS signature v4
const createAwsSignature = (
  method: string,
  url: string,
  headers: Record<string, string>,
  payload: string,
  awsAccessKeyId: string,
  awsSecretAccessKey: string,
  region: string,
  service: string
) => {
  // This is a simplified implementation - in production, use the AWS SDK
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const datetime = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '') + 'Z';
  
  // For now, return a placeholder signature
  // In production, implement proper AWS Signature Version 4
  return {
    'X-Amz-Date': datetime,
    'Authorization': `AWS4-HMAC-SHA256 Credential=${awsAccessKeyId}/${date}/${region}/${service}/aws4_request, SignedHeaders=host;x-amz-date;x-amz-target, Signature=placeholder`
  };
};

// Helper function to make Amazon Connect API calls
const makeConnectApiCall = async (
  action: string,
  payload: any,
  awsAccessKeyId: string,
  awsSecretAccessKey: string,
  region: string,
  instanceId: string
) => {
  const host = `connect.${region}.amazonaws.com`;
  const url = `https://${host}/`;
  
  const headers = {
    'Content-Type': 'application/x-amz-json-1.1',
    'X-Amz-Target': `Connect_20170801.${action}`,
    'Host': host
  };

  // Add AWS signature
  const signature = createAwsSignature(
    'POST',
    url,
    headers,
    JSON.stringify(payload),
    awsAccessKeyId,
    awsSecretAccessKey,
    region,
    'connect'
  );

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { ...headers, ...signature },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error('Amazon Connect API Error:', response.status, await response.text());
      throw new Error(`Amazon Connect API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error calling Amazon Connect API:', error);
    throw error;
  }
};

// Helper function to get area code from city name
const getAreaCodeFromCity = (cityName: string): string[] => {
  const cityAreaCodes: Record<string, string[]> = {
    'toronto': ['416', '647', '437'],
    'montreal': ['514', '438'],
    'vancouver': ['604', '778', '236'],
    'calgary': ['403', '587'],
    'ottawa': ['613', '343'],
    'edmonton': ['780', '587'],
    'quebec': ['418', '581'],
    'winnipeg': ['204', '431'],
    'hamilton': ['905', '289'],
    'london': ['519', '226'],
    'san francisco': ['415', '628'],
    'new york': ['212', '646', '917'],
    'los angeles': ['213', '323', '424'],
    'chicago': ['312', '773', '872'],
    'houston': ['713', '281', '832'],
    'phoenix': ['602', '623', '480'],
    'philadelphia': ['215', '267', '445'],
    'san antonio': ['210', '726'],
    'san diego': ['619', '858', '935'],
    'dallas': ['214', '469', '972'],
  };
  
  return cityAreaCodes[cityName.toLowerCase()] || [];
};

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

    switch (action) {
      case 'search':
        try {
          // Determine country code and search parameters
          const countryCode = country === 'CA' ? 'CA' : 'US';
          let searchAreaCodes: string[] = [];
          
          if (areaCode && /^\d{3}$/.test(areaCode)) {
            searchAreaCodes = [areaCode];
          } else if (contains) {
            // Try to get area codes from city name
            searchAreaCodes = getAreaCodeFromCity(contains);
            if (searchAreaCodes.length === 0) {
              // If no area codes found for the city, fall back to searching by name
              console.log(`No area codes found for city: ${contains}, searching broadly`);
            }
          }

          console.log(`Searching for phone numbers in ${countryCode}, area codes: ${searchAreaCodes}`);

          // For demo purposes, generate realistic mock data based on search parameters
          // In production, this would call the real Amazon Connect API
          const generateMockNumbers = (country: string, areaCodes: string[], cityName?: string) => {
            const baseNumbers = [];
            const targetAreaCodes = areaCodes.length > 0 ? areaCodes : ['416']; // Default to Toronto if no area codes
            
            for (let i = 0; i < 5; i++) {
              const areaCode = targetAreaCodes[i % targetAreaCodes.length];
              const exchange = Math.floor(Math.random() * 900) + 100;
              const number = Math.floor(Math.random() * 9000) + 1000;
              const phoneNumber = `+1${areaCode}${exchange}${number}`;
              
              // Determine locality based on area code or search term
              let locality = cityName || 'Toronto';
              let region = countryCode === 'CA' ? 'ON' : 'CA';
              
              if (areaCode === '416' || areaCode === '647' || areaCode === '437') {
                locality = 'Toronto';
                region = 'ON';
              } else if (areaCode === '514' || areaCode === '438') {
                locality = 'Montreal';
                region = 'QC';
              } else if (areaCode === '604' || areaCode === '778') {
                locality = 'Vancouver';
                region = 'BC';
              } else if (areaCode === '415') {
                locality = 'San Francisco';
                region = 'CA';
              }
              
              baseNumbers.push({
                phoneNumber,
                locality,
                region,
                price: countryCode === 'CA' ? '2.50' : '2.00',
                capabilities: { voice: true, sms: true, mms: false }
              });
            }
            
            return baseNumbers;
          };

          const mockPhoneNumbers = generateMockNumbers(countryCode, searchAreaCodes, contains);

          // TODO: Replace with real Amazon Connect API call
          /*
          const searchPayload = {
            InstanceId: connectInstanceId,
            PhoneNumberCountryCode: countryCode,
            PhoneNumberType: 'DID',
            MaxResults: 20,
            ...(searchAreaCodes.length > 0 && { PhoneNumberPrefix: searchAreaCodes[0] })
          };

          const result = await makeConnectApiCall(
            'SearchAvailablePhoneNumbers',
            searchPayload,
            awsAccessKeyId,
            awsSecretAccessKey,
            awsRegion,
            connectInstanceId
          );
          */

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
          // TODO: Replace with real Amazon Connect API call
          /*
          const purchasePayload = {
            InstanceId: connectInstanceId,
            PhoneNumber: phoneNumber,
            PhoneNumberCountryCode: phoneNumber.startsWith('+1') ? 'US' : 'CA',
            PhoneNumberType: 'DID'
          };

          const result = await makeConnectApiCall(
            'ClaimPhoneNumber',
            purchasePayload,
            awsAccessKeyId,
            awsSecretAccessKey,
            awsRegion,
            connectInstanceId
          );
          */

          // For demo purposes, simulate successful purchase
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

          // Determine locality based on phone number area code
          const areaCode = phoneNumber.substring(2, 5);
          let locality = 'Unknown';
          let region = 'Unknown';
          let country_code = 'US';
          
          const areaCodeMap: Record<string, { locality: string; region: string; country: string }> = {
            '416': { locality: 'Toronto', region: 'ON', country: 'CA' },
            '647': { locality: 'Toronto', region: 'ON', country: 'CA' },
            '437': { locality: 'Toronto', region: 'ON', country: 'CA' },
            '514': { locality: 'Montreal', region: 'QC', country: 'CA' },
            '438': { locality: 'Montreal', region: 'QC', country: 'CA' },
            '604': { locality: 'Vancouver', region: 'BC', country: 'CA' },
            '778': { locality: 'Vancouver', region: 'BC', country: 'CA' },
            '415': { locality: 'San Francisco', region: 'CA', country: 'US' },
          };
          
          if (areaCodeMap[areaCode]) {
            locality = areaCodeMap[areaCode].locality;
            region = areaCodeMap[areaCode].region;
            country_code = areaCodeMap[areaCode].country;
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
              locality,
              region,
              price: country_code === 'CA' ? 2.50 : 2.00,
              monthly_price: 1.00,
              country_code,
              phone_number_type: 'local',
              price_unit: country_code === 'CA' ? 'CAD' : 'USD'
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
