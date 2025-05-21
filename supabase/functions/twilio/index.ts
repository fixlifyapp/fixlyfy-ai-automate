
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

// Set up CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');

interface TwilioNumberRequest {
  action: 'search' | 'purchase' | 'release' | 'send-sms' | 'list';
  userId?: string;
  areaCode?: string;
  phoneNumberSid?: string;
  to?: string;
  from?: string;
  body?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Get the authorization header from the request
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: 'Authorization header is required' }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
  
  // Create a Supabase client to verify the user
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { action, userId, areaCode, phoneNumberSid, to, from, body } = await req.json() as TwilioNumberRequest;
    
    // Base64 encoded Twilio credentials
    const credentials = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
    
    switch (action) {
      case 'search': {
        // Search for available phone numbers
        if (!areaCode) {
          throw new Error('Area code is required for searching phone numbers');
        }
        
        const response = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/AvailablePhoneNumbers/US/Local.json?AreaCode=${areaCode}&SmsEnabled=true&VoiceEnabled=true`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Basic ${credentials}`,
              'Content-Type': 'application/json',
            },
          }
        );
        
        const data = await response.json();
        return new Response(
          JSON.stringify(data),
          { 
            status: 200, 
            headers: { 'Content-Type': 'application/json', ...corsHeaders } 
          }
        );
      }
      
      case 'purchase': {
        // Purchase a phone number
        if (!phoneNumberSid) {
          throw new Error('Phone number SID is required for purchasing');
        }
        
        const formData = new URLSearchParams();
        formData.append('PhoneNumber', phoneNumberSid);
        
        const response = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/IncomingPhoneNumbers.json`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${credentials}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString(),
          }
        );
        
        const data = await response.json();
        
        // Store the purchased number in the database
        if (userId && data.sid) {
          // Format the phone number properly
          const phoneNumber = data.phone_number;
          
          // Store in the database
          await supabase
            .from('user_phone_numbers')
            .insert({
              user_id: userId,
              phone_number: phoneNumber,
              twilio_sid: data.sid,
              status: 'active',
              capabilities: JSON.stringify({
                sms: data.capabilities.sms,
                voice: data.capabilities.voice,
                mms: data.capabilities.mms
              })
            });
        }
        
        return new Response(
          JSON.stringify(data),
          { 
            status: 200, 
            headers: { 'Content-Type': 'application/json', ...corsHeaders } 
          }
        );
      }
      
      case 'release': {
        // Release a phone number
        if (!phoneNumberSid) {
          throw new Error('Phone number SID is required for releasing');
        }
        
        const response = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/IncomingPhoneNumbers/${phoneNumberSid}.json`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Basic ${credentials}`,
              'Content-Type': 'application/json',
            },
          }
        );
        
        // Update the database
        if (phoneNumberSid) {
          await supabase
            .from('user_phone_numbers')
            .update({ status: 'released' })
            .eq('twilio_sid', phoneNumberSid);
        }
        
        return new Response(
          JSON.stringify({ success: true, message: 'Phone number released' }),
          { 
            status: 200, 
            headers: { 'Content-Type': 'application/json', ...corsHeaders } 
          }
        );
      }
      
      case 'list': {
        // List all numbers for a user
        if (!userId) {
          throw new Error('User ID is required for listing phone numbers');
        }
        
        const { data, error } = await supabase
          .from('user_phone_numbers')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'active');
          
        if (error) throw error;
        
        return new Response(
          JSON.stringify({ numbers: data }),
          { 
            status: 200, 
            headers: { 'Content-Type': 'application/json', ...corsHeaders } 
          }
        );
      }

      case 'send-sms': {
        // Send an SMS message
        if (!to || !from || !body) {
          throw new Error('To, from, and body are required for sending SMS');
        }
        
        const formData = new URLSearchParams();
        formData.append('To', to);
        formData.append('From', from);
        formData.append('Body', body);
        
        const response = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${credentials}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString(),
          }
        );
        
        const data = await response.json();
        return new Response(
          JSON.stringify(data),
          { 
            status: 200, 
            headers: { 'Content-Type': 'application/json', ...corsHeaders } 
          }
        );
      }
      
      default:
        throw new Error('Invalid action specified');
    }
  } catch (error) {
    console.error('Error handling Twilio request:', error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
});
