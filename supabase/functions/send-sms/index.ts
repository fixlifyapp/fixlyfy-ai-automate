
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendSMSRequest {
  to: string;
  body: string;
}

interface IncomingSMS {
  From: string;
  To: string;
  Body: string;
  MessageSid: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Check if this is a webhook from Twilio with incoming SMS
  const contentType = req.headers.get('content-type') || '';
  
  try {
    // Handle incoming SMS from Twilio webhook
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      const payload: IncomingSMS = {
        From: formData.get('From')?.toString() || '',
        To: formData.get('To')?.toString() || '',
        Body: formData.get('Body')?.toString() || '',
        MessageSid: formData.get('MessageSid')?.toString() || ''
      };

      console.log('Incoming SMS received:', payload);

      if (!payload.From || !payload.Body) {
        throw new Error('Missing required parameters in the incoming SMS');
      }

      // Store the incoming message in the database
      const { data: supabaseClient } = await (await fetch(
        Deno.env.get('SUPABASE_URL') + '/rest/v1/clients?phone=eq.' + 
        encodeURIComponent(payload.From.replace(/\+1/, '')),
        {
          headers: {
            'Content-Type': 'application/json',
            'apiKey': Deno.env.get('SUPABASE_ANON_KEY') || '',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
          }
        }
      )).json();

      let clientId = null;
      if (supabaseClient && supabaseClient.length > 0) {
        clientId = supabaseClient[0].id;
      }

      // Find or create a conversation
      let conversationId = null;
      let conversation = null;

      if (clientId) {
        // Check for existing conversation
        const { data: existingConversation } = await (await fetch(
          Deno.env.get('SUPABASE_URL') + '/rest/v1/conversations?client_id=eq.' + clientId,
          {
            headers: {
              'Content-Type': 'application/json',
              'apiKey': Deno.env.get('SUPABASE_ANON_KEY') || '',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
            }
          }
        )).json();

        if (existingConversation && existingConversation.length > 0) {
          conversationId = existingConversation[0].id;
          conversation = existingConversation[0];
        } else {
          // Create new conversation
          const { data: newConversation } = await (await fetch(
            Deno.env.get('SUPABASE_URL') + '/rest/v1/conversations',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apiKey': Deno.env.get('SUPABASE_ANON_KEY') || '',
                'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
              },
              body: JSON.stringify({
                client_id: clientId,
                status: 'active',
                last_message_at: new Date().toISOString()
              })
            }
          )).json();
          
          conversationId = newConversation?.id;
        }
      }

      // Store the message
      if (conversationId) {
        await fetch(
          Deno.env.get('SUPABASE_URL') + '/rest/v1/messages',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apiKey': Deno.env.get('SUPABASE_ANON_KEY') || '',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
            },
            body: JSON.stringify({
              conversation_id: conversationId,
              body: payload.Body,
              direction: 'inbound',
              sender: payload.From,
              recipient: payload.To,
              message_sid: payload.MessageSid,
              status: 'received'
            })
          }
        );
      }

      // Respond with a TwiML message (this would be displayed to the sender if we want to autorespond)
      return new Response(
        `<?xml version="1.0" encoding="UTF-8"?>
        <Response></Response>`,
        {
          headers: {
            'Content-Type': 'text/xml',
            ...corsHeaders,
          },
        }
      );
    } 
    // Handle outgoing SMS requests from our application
    else {
      const { to, body }: SendSMSRequest = await req.json();

      if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
        throw new Error('Missing Twilio credentials');
      }

      if (!to || !body) {
        throw new Error('Missing required parameters: to and body');
      }

      // Format phone number to E.164 format if not already
      const formattedTo = to.startsWith('+') ? to : `+1${to.replace(/\D/g, '')}`;

      // Call Twilio API to send SMS
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
            Body: body,
          }).toString(),
        }
      );

      const twilioData = await twilioResponse.json();

      if (!twilioResponse.ok) {
        throw new Error(`Twilio API error: ${JSON.stringify(twilioData)}`);
      }

      console.log('SMS sent successfully:', twilioData.sid);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'SMS sent successfully',
          sid: twilioData.sid,
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }
  } catch (error) {
    console.error('Error in send-sms function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to process SMS' 
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
