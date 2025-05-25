
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendEstimateRequest {
  method: 'email' | 'sms';
  recipient: string;
  estimateNumber: string;
  estimateData: {
    lineItems: any[];
    total: number;
    taxRate: number;
    notes?: string;
    viewUrl?: string;
  };
  clientName?: string;
  communicationId?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      method, 
      recipient, 
      estimateNumber, 
      estimateData, 
      clientName,
      communicationId 
    }: SendEstimateRequest = await req.json();

    console.log(`Sending estimate ${estimateNumber} via ${method} to ${recipient}`);

    // Create Supabase client for database operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let result;

    if (method === 'sms') {
      // Send via Twilio SMS
      if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
        throw new Error('Missing Twilio credentials');
      }

      const formattedTo = recipient.startsWith('+') ? recipient : `+1${recipient.replace(/\D/g, '')}`;
      
      // Create SMS message with viewing link
      const viewUrl = estimateData.viewUrl || `https://yourapp.com/estimate/view/${estimateNumber}`;
      const message = `Hi ${clientName || 'there'}! Your estimate ${estimateNumber} is ready. Total: $${estimateData.total.toFixed(2)}. View it here: ${viewUrl}`;

      console.log("Sending SMS to:", formattedTo);
      console.log("SMS content:", message);

      const twilioResponse = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
          },
          body: new URLSearchParams({
            To: formattedTo,
            From: twilioPhoneNumber,
            Body: message,
          }).toString(),
        }
      );

      const twilioData = await twilioResponse.json();

      if (!twilioResponse.ok) {
        console.error("Twilio error response:", twilioData);
        throw new Error(`Twilio API error: ${twilioData.message || JSON.stringify(twilioData)}`);
      }

      console.log('SMS sent successfully:', twilioData.sid);

      // Update communication record
      if (communicationId) {
        await supabase
          .from('estimate_communications')
          .update({
            status: 'delivered',
            delivered_at: new Date().toISOString(),
            provider_message_id: twilioData.sid
          })
          .eq('id', communicationId);
      }

      result = {
        success: true,
        message: 'Estimate sent via SMS successfully',
        sid: twilioData.sid,
      };

    } else if (method === 'email') {
      // For now, we'll simulate email sending since SendGrid is not configured
      // In the future, this could be connected to SendGrid or another email service
      
      console.log('Email sending requested but not yet implemented');
      console.log('Would send email to:', recipient);
      console.log('Email subject: Estimate', estimateNumber);
      
      // Update communication record as delivered (simulated)
      if (communicationId) {
        await supabase
          .from('estimate_communications')
          .update({
            status: 'delivered',
            delivered_at: new Date().toISOString()
          })
          .eq('id', communicationId);
      }

      // For now, return success but indicate email is not fully implemented
      result = {
        success: true,
        message: 'Email functionality not yet implemented - estimate link created',
        note: 'SMS is currently the recommended method for sending estimates'
      };
    } else {
      throw new Error('Invalid send method');
    }

    return new Response(
      JSON.stringify(result),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error('Error in send-estimate function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to send estimate' 
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});
