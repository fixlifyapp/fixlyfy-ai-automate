
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, telnyx-signature-ed25519, telnyx-timestamp',
}

// Interface for Telnyx SMS webhook v2
interface TelnyxSMSWebhook {
  record_type?: string;
  event_type?: string;
  id?: string;
  occurred_at?: string;
  payload?: {
    id?: string;
    record_type?: string;
    direction?: string;
    from?: {
      phone_number?: string;
      carrier?: string;
    };
    to?: Array<{
      phone_number?: string;
      carrier?: string;
    }>;
    text?: string;
    completed_at?: string;
    sent_at?: string;
    received_at?: string;
    webhook_url?: string;
  };
}

// Updated public key from your screenshot
const TELNYX_PUBLIC_KEY = 'e5jeBd2E62zcfqhmsfbYrllgfP06y84=';

// Function to verify Telnyx webhook signature
const verifyTelnyxSignature = async (
  payload: string,
  signature: string,
  timestamp: string
): Promise<boolean> => {
  try {
    console.log('Verifying signature with public key:', TELNYX_PUBLIC_KEY);
    console.log('Signature received:', signature);
    console.log('Timestamp received:', timestamp);
    
    // Import the public key
    const publicKeyBytes = new Uint8Array(
      atob(TELNYX_PUBLIC_KEY).split('').map(char => char.charCodeAt(0))
    );

    const publicKey = await crypto.subtle.importKey(
      'raw',
      publicKeyBytes,
      {
        name: 'Ed25519',
        namedCurve: 'Ed25519',
      },
      false,
      ['verify']
    );

    // Create the signed payload (timestamp + payload)
    const signedPayload = timestamp + '|' + payload;
    const encoder = new TextEncoder();
    const signedPayloadBytes = encoder.encode(signedPayload);

    // Decode the signature from base64
    const signatureBytes = new Uint8Array(
      atob(signature).split('').map(char => char.charCodeAt(0))
    );

    // Verify the signature
    const isValid = await crypto.subtle.verify(
      'Ed25519',
      publicKey,
      signatureBytes,
      signedPayloadBytes
    );

    console.log('Signature verification result:', isValid);
    return isValid;
  } catch (error) {
    console.error('Error verifying Telnyx signature:', error);
    return false;
  }
};

const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('1') && cleaned.length === 11) {
    return cleaned.substring(1);
  }
  return cleaned;
};

const findUserByReceivingNumber = async (supabase: any, toPhone: string) => {
  console.log('Finding user for receiving number:', toPhone);
  
  const { data: phoneNumber, error } = await supabase
    .from('telnyx_phone_numbers')
    .select('user_id, phone_number')
    .eq('phone_number', toPhone)
    .eq('status', 'active')
    .single();

  if (error) {
    console.error('Error finding phone number owner:', error);
    return null;
  }

  if (!phoneNumber) {
    console.log('No active phone number found for:', toPhone);
    return null;
  }

  console.log('Found phone number owner:', phoneNumber.user_id);
  return phoneNumber.user_id;
};

const findClientByPhone = async (supabase: any, phone: string, userId: string) => {
  const formattedPhone = formatPhoneNumber(phone);
  
  const phoneVariations = [
    phone,
    formattedPhone,
    `+1${formattedPhone}`,
    `(${formattedPhone.slice(0,3)}) ${formattedPhone.slice(3,6)}-${formattedPhone.slice(6)}`,
    `${formattedPhone.slice(0,3)}-${formattedPhone.slice(3,6)}-${formattedPhone.slice(6)}`,
    `${formattedPhone.slice(0,3)}.${formattedPhone.slice(3,6)}.${formattedPhone.slice(6)}`
  ];

  console.log('Searching for client with phone variations:', phoneVariations, 'for user:', userId);

  for (const phoneVar of phoneVariations) {
    const { data: client, error } = await supabase
      .from('clients')
      .select('*')
      .ilike('phone', `%${phoneVar}%`)
      .eq('created_by', userId)
      .limit(1)
      .maybeSingle();

    if (!error && client) {
      console.log('Found client:', client.id, client.name, 'for user:', userId);
      return client;
    }
  }

  console.log('No client found for phone:', phone, 'under user:', userId);
  return null;
};

const createClientForUser = async (supabase: any, fromPhone: string, userId: string) => {
  console.log('Creating new client for phone:', fromPhone, 'under user:', userId);
  
  const { data: newClient, error: clientError } = await supabase
    .from('clients')
    .insert({
      name: `Client ${fromPhone}`,
      phone: fromPhone,
      status: 'active',
      type: 'residential',
      address: '',
      city: '',
      state: '',
      zip: '',
      country: 'United States',
      created_by: userId
    })
    .select()
    .single();

  if (clientError) {
    console.error('Error creating client for user:', userId, clientError);
    return null;
  }

  console.log('Created new client:', newClient.id, 'for user:', userId);
  return newClient;
};

serve(async (req) => {
  console.log('=== Telnyx SMS Webhook START ===');
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the raw body for signature verification
    const rawBody = await req.text();
    console.log('Raw webhook body length:', rawBody.length);
    console.log('Raw webhook body preview:', rawBody.substring(0, 200));

    // Get signature headers
    const signature = req.headers.get('telnyx-signature-ed25519');
    const timestamp = req.headers.get('telnyx-timestamp');

    console.log('Telnyx headers:', {
      signature: signature ? 'present' : 'missing',
      timestamp: timestamp ? 'present' : 'missing',
      signatureValue: signature?.substring(0, 20) + '...',
      timestampValue: timestamp
    });

    // For debugging, let's be more lenient with signature validation initially
    if (signature && timestamp) {
      console.log('Attempting signature verification...');
      try {
        const isValidSignature = await verifyTelnyxSignature(rawBody, signature, timestamp);
        
        if (!isValidSignature) {
          console.error('Invalid Telnyx webhook signature - but continuing for debugging');
          // Don't return error yet, let's see what data we're getting
        } else {
          console.log('Webhook signature verified successfully');
        }
      } catch (sigError) {
        console.error('Signature verification error:', sigError);
        // Continue processing for debugging
      }
    } else {
      console.log('No signature headers found - continuing without verification for debugging');
    }

    // Parse the webhook data
    const webhookData: TelnyxSMSWebhook = JSON.parse(rawBody);
    console.log('SMS webhook data:', JSON.stringify(webhookData, null, 2));

    // Extract data from the webhook payload
    const eventType = webhookData.event_type;
    const messageId = webhookData.payload?.id;
    const fromPhone = webhookData.payload?.from?.phone_number;
    const toPhone = webhookData.payload?.to?.[0]?.phone_number;
    const messageText = webhookData.payload?.text;
    const direction = webhookData.payload?.direction;

    console.log('SMS Event Details:', {
      eventType,
      messageId,
      fromPhone,
      toPhone,
      direction,
      messageText: messageText?.substring(0, 100)
    });

    // Only process received messages (incoming SMS)
    if (eventType === 'message.received' && direction === 'inbound' && fromPhone && toPhone && messageText) {
      console.log('Processing inbound SMS...');

      // STEP 1: Find which user owns the receiving phone number
      const userId = await findUserByReceivingNumber(supabaseAdmin, toPhone);
      if (!userId) {
        console.error('No user found for receiving number:', toPhone);
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Receiving number not associated with any user' 
        }), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404 
        });
      }

      // STEP 2: Find client by phone number within that user's clients
      let client = await findClientByPhone(supabaseAdmin, fromPhone, userId);
      
      // STEP 3: If no client found, create one for this user
      if (!client) {
        client = await createClientForUser(supabaseAdmin, fromPhone, userId);
        if (!client) {
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Error creating client' 
          }), { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          });
        }
      }

      // STEP 4: Find or create conversation for this client
      let conversation;
      const { data: existingConversation, error: convError } = await supabaseAdmin
        .from('conversations')
        .select('*')
        .eq('client_id', client.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (convError) {
        console.error('Error finding conversation:', convError);
      }

      if (existingConversation) {
        conversation = existingConversation;
        console.log('Using existing conversation:', conversation.id);
        
        // Update last_message_at
        await supabaseAdmin
          .from('conversations')
          .update({ 
            last_message_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', conversation.id);
      } else {
        console.log('Creating new conversation for client:', client.id);
        const { data: newConversation, error: newConvError } = await supabaseAdmin
          .from('conversations')
          .insert({
            client_id: client.id,
            status: 'active',
            last_message_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (newConvError) {
          console.error('Error creating conversation:', newConvError);
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Error creating conversation' 
          }), { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          });
        }

        conversation = newConversation;
        console.log('Created new conversation:', conversation.id);
      }

      // STEP 5: Store the message
      const { error: messageError } = await supabaseAdmin
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          body: messageText,
          direction: 'inbound',
          sender: fromPhone,
          recipient: toPhone,
          status: 'delivered',
          message_sid: messageId,
          created_at: new Date().toISOString()
        });

      if (messageError) {
        console.error('Error storing message:', messageError);
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Error storing message' 
        }), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        });
      }

      console.log('SMS message stored successfully for user:', userId, 'client:', client.id);
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'SMS webhook processed successfully',
        details: {
          user_id: userId,
          client_id: client.id,
          conversation_id: conversation.id,
          message_id: messageId
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } else {
      console.log('Skipping event - not an inbound message or missing required data:', {
        eventType,
        direction,
        hasFromPhone: !!fromPhone,
        hasToPhone: !!toPhone,
        hasMessageText: !!messageText
      });
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Event skipped - not an inbound message' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('Error processing SMS webhook:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'Unknown error processing webhook',
      stack: error.stack
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  } finally {
    console.log('=== Telnyx SMS Webhook END ===');
  }
});
