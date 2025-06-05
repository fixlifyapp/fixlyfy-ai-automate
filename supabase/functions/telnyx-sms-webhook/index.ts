
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TelnyxSMSEvent {
  data?: {
    event_type?: string;
    id?: string;
    payload?: {
      id?: string;
      from?: {
        phone_number?: string;
      };
      to?: Array<{
        phone_number?: string;
      }>;
      text?: string;
      direction?: string;
      completed_at?: string;
      sent_at?: string;
      received_at?: string;
      webhook_failover_url?: string;
    };
  };
}

const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('1') && cleaned.length === 11) {
    return cleaned.substring(1);
  }
  return cleaned;
};

const findUserByReceivingNumber = async (supabase: any, toPhone: string) => {
  console.log('Finding user for receiving number:', toPhone);
  
  // Find which user owns this Telnyx phone number
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
  
  // Try multiple phone format variations, but ONLY for this user's clients
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
      .eq('created_by', userId) // CRITICAL: Filter by user!
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
      created_by: userId // CRITICAL: Associate with the correct user!
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
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const webhookData: TelnyxSMSEvent = await req.json();
    console.log('SMS webhook data:', JSON.stringify(webhookData, null, 2));

    const payload = webhookData.data?.payload;
    if (!payload) {
      console.log('No payload in webhook data');
      return new Response('No payload', { status: 400 });
    }

    const eventType = webhookData.data?.event_type;
    const messageId = payload.id;
    const fromPhone = payload.from?.phone_number;
    const toPhone = payload.to?.[0]?.phone_number;
    const messageText = payload.text;
    const direction = payload.direction;

    console.log('SMS Event:', {
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
        return new Response('Receiving number not associated with any user', { status: 404 });
      }

      // STEP 2: Find client by phone number within that user's clients
      let client = await findClientByPhone(supabaseAdmin, fromPhone, userId);
      
      // STEP 3: If no client found, create one for this user
      if (!client) {
        client = await createClientForUser(supabaseAdmin, fromPhone, userId);
        if (!client) {
          return new Response('Error creating client', { status: 500 });
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
          return new Response('Error creating conversation', { status: 500 });
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
        return new Response('Error storing message', { status: 500 });
      }

      console.log('SMS message stored successfully for user:', userId, 'client:', client.id);
    } else {
      console.log('Skipping event - not an inbound message or missing required data');
    }

    return new Response(JSON.stringify({ success: true, message: 'SMS webhook processed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error processing SMS webhook:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  } finally {
    console.log('=== Telnyx SMS Webhook END ===');
  }
});
