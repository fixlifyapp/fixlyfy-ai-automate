
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

// AWS Signature Version 4 implementation
class AwsV4Signer {
  private accessKeyId: string;
  private secretAccessKey: string;
  private region: string;
  private service: string;

  constructor(accessKeyId: string, secretAccessKey: string, region: string, service: string) {
    this.accessKeyId = accessKeyId;
    this.secretAccessKey = secretAccessKey;
    this.region = region;
    this.service = service;
  }

  private async sha256(message: string): Promise<ArrayBuffer> {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    return await crypto.subtle.digest('SHA-256', data);
  }

  private async hmac(key: ArrayBuffer | string, message: string): Promise<ArrayBuffer> {
    const encoder = new TextEncoder();
    const keyData = typeof key === 'string' ? encoder.encode(key) : key;
    const messageData = encoder.encode(message);
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    return await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  }

  private toHex(buffer: ArrayBuffer): string {
    return Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  async sign(method: string, url: string, headers: Record<string, string>, payload: string): Promise<Record<string, string>> {
    const now = new Date();
    const isoDateTime = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
    const date = isoDateTime.slice(0, 8);
    
    // Parse URL
    const urlObj = new URL(url);
    const host = urlObj.hostname;
    const path = urlObj.pathname;
    
    // Add required headers
    const signedHeaders = {
      ...headers,
      'host': host,
      'x-amz-date': isoDateTime,
    };

    // Create canonical request
    const sortedHeaderNames = Object.keys(signedHeaders).sort();
    const canonicalHeaders = sortedHeaderNames
      .map(name => `${name.toLowerCase()}:${signedHeaders[name]}\n`)
      .join('');
    const signedHeadersString = sortedHeaderNames.map(name => name.toLowerCase()).join(';');
    
    const payloadHash = this.toHex(await this.sha256(payload));
    
    const canonicalRequest = [
      method,
      path,
      '', // query string (empty for our use case)
      canonicalHeaders,
      signedHeadersString,
      payloadHash
    ].join('\n');

    // Create string to sign
    const credentialScope = `${date}/${this.region}/${this.service}/aws4_request`;
    const stringToSign = [
      'AWS4-HMAC-SHA256',
      isoDateTime,
      credentialScope,
      this.toHex(await this.sha256(canonicalRequest))
    ].join('\n');

    // Calculate signature
    const dateKey = await this.hmac(`AWS4${this.secretAccessKey}`, date);
    const regionKey = await this.hmac(dateKey, this.region);
    const serviceKey = await this.hmac(regionKey, this.service);
    const signingKey = await this.hmac(serviceKey, 'aws4_request');
    const signature = this.toHex(await this.hmac(signingKey, stringToSign));

    // Create authorization header
    const authorization = `AWS4-HMAC-SHA256 Credential=${this.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeadersString}, Signature=${signature}`;

    return {
      ...signedHeaders,
      'Authorization': authorization
    };
  }
}

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
  };

  const payloadString = JSON.stringify(payload);
  
  try {
    const signer = new AwsV4Signer(awsAccessKeyId, awsSecretAccessKey, region, 'connect');
    const signedHeaders = await signer.sign('POST', url, headers, payloadString);

    console.log(`Making Amazon Connect API call: ${action}`);
    console.log('Payload:', payloadString);

    const response = await fetch(url, {
      method: 'POST',
      headers: signedHeaders,
      body: payloadString
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Amazon Connect API Error:', response.status, errorText);
      throw new Error(`Amazon Connect API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Amazon Connect API Success:', result);
    return result;
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
          }

          console.log(`Searching for phone numbers in ${countryCode}, area codes: ${searchAreaCodes}`);

          // Use real Amazon Connect API call
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

          // Transform the Amazon Connect response to our format
          const phoneNumbers = (result.AvailableNumbersList || []).map((number: any) => ({
            phoneNumber: number.PhoneNumber,
            locality: number.PhoneNumberCountryCode === 'CA' ? 'Canada' : 'United States',
            region: number.PhoneNumberCountryCode === 'CA' ? 'ON' : 'CA',
            price: countryCode === 'CA' ? '2.50' : '2.00',
            capabilities: { voice: true, sms: true, mms: false }
          }));

          return new Response(JSON.stringify({
            success: true,
            phone_numbers: phoneNumbers
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        } catch (error) {
          console.error('Search error:', error);
          return new Response(JSON.stringify({
            success: false,
            error: 'Failed to search phone numbers: ' + error.message
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
          // Use real Amazon Connect API call
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
              connect_phone_number_arn: result.PhoneNumberArn,
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
            phone_number: result
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
