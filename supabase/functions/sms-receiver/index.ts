import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

export const config = {
  auth: false,
}

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
  data?: {
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
  };
  // Legacy format support
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

// Telnyx signature verification function
const verifyTelnyxSignature = async (rawBody: string, signature: string, timestamp: string): Promise<boolean> => {
  try {
    // Get Telnyx public key from environment
    const telnyxPublicKey = Deno.env.get('TELNYX_PUBLIC_KEY') || 'e5jeBd2E62zcfqhmsfbYrlIgfP06y1KjlgRg2cGRg84=';
    
    console.log('🔐 Using Telnyx public key for verification:', telnyxPublicKey.substring(0, 10) + '...');
    
    // Verify timestamp is within acceptable range (±30 seconds)
    const now = Math.floor(Date.now() / 1000);
    const webhookTimestamp = parseInt(timestamp);
    if (Math.abs(now - webhookTimestamp) > 30) {
      console.error('❌ Webhook timestamp too old or too new:', {
        now,
        webhookTimestamp,
        difference: Math.abs(now - webhookTimestamp)
      });
      return false;
    }
    
    // Build the message to verify: timestamp + "." + body
    const message = `${timestamp}.${rawBody}`;
    
    try {
      // Decode the signature from base64
      const signatureBytes = new Uint8Array(
        atob(signature).split('').map(char => char.charCodeAt(0))
      );
      
      // Decode the public key from base64
      const publicKeyBytes = new Uint8Array(
        atob(telnyxPublicKey).split('').map(char => char.charCodeAt(0))
      );
      
      // Import the Ed25519 public key
      const publicKey = await crypto.subtle.importKey(
        'raw',
        publicKeyBytes,
        {
          name: 'Ed25519',
          namedCurve: 'Ed25519'
        },
        false,
        ['verify']
      );
      
      // Verify the signature
      const isValid = await crypto.subtle.verify(
        'Ed25519',
        publicKey,
        signatureBytes,
        new TextEncoder().encode(message)
      );
      
      console.log('🔐 Signature verification result:', isValid);
      return isValid;
      
    } catch (decodeError) {
      console.error('❌ Failed to decode signature:', decodeError);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Signature verification error:', error);
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
  
  // Normalize the phone number to remove any formatting
  const normalizePhone = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    // Remove leading 1 for US numbers if it's 11 digits
    if (cleaned.startsWith('1') && cleaned.length === 11) {
      return cleaned.substring(1);
    }
    return cleaned;
  };
  
  const baseNumber = normalizePhone(toPhone);
  
  // Try to find with ILIKE pattern matching for flexibility
      const { data: phoneNumber, error } = await supabase
        .from('telnyx_phone_numbers')
        .select('user_id, phone_number')
    .or(`phone_number.ilike.%${baseNumber},phone_number.ilike.+1${baseNumber},phone_number.ilike.+${baseNumber}`)
        .eq('status', 'active')
        .single();

      if (!error && phoneNumber) {
    console.log('Found phone number owner:', phoneNumber.user_id);
        return phoneNumber.user_id;
  }

  console.log('No active phone number found for any format variations of:', toPhone);
  console.log('Available active phone numbers:');
  
  // Debug: List all active phone numbers to help troubleshoot
  try {
    const { data: allActiveNumbers, error: debugError } = await supabase
      .from('telnyx_phone_numbers')
      .select('phone_number, user_id')
      .eq('status', 'active');
    
    if (!debugError && allActiveNumbers) {
      allActiveNumbers.forEach(num => {
        console.log(' - Available:', num.phone_number, 'for user:', num.user_id);
      });
    }
  } catch (debugErr) {
    console.error('Error fetching debug info:', debugErr);
  }
  
  return null;
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
  console.log('=== SMS RECEIVER WEBHOOK CALLED ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('=== PROCESSING SMS WEBHOOK ===');
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the raw body
    const rawBody = await req.text();
    console.log('Raw webhook body received, length:', rawBody.length);
    console.log('Raw webhook body preview:', rawBody.substring(0, 500) + '...');

    // CRITICAL: Verify Telnyx webhook signature for security
    const signature = req.headers.get('telnyx-signature-ed25519');
    const timestamp = req.headers.get('telnyx-timestamp');
    
    console.log('🔐 Webhook signature headers:', {
      hasSignature: !!signature,
      hasTimestamp: !!timestamp,
      signaturePreview: signature ? signature.substring(0, 20) + '...' : 'none',
      timestamp: timestamp
    });
    
    if (signature && timestamp) {
      console.log('🔐 Verifying Telnyx webhook signature...');
      const isValid = await verifyTelnyxSignature(rawBody, signature, timestamp);
      if (!isValid) {
        console.error('❌ Invalid webhook signature - rejecting webhook');
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Invalid webhook signature' 
        }), { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      console.log('✅ Webhook signature verified successfully');
    } else {
      console.warn('⚠️ No signature headers found - this might be a test webhook or misconfigured endpoint');
      console.warn('⚠️ In production, you should require signature verification');
    }

    // Parse the webhook data
    let webhookData: TelnyxSMSWebhook;
    try {
      webhookData = JSON.parse(rawBody);
      console.log('✅ Webhook data parsed successfully');
      console.log('Full webhook structure:', JSON.stringify(webhookData, null, 2));
    } catch (parseError) {
      console.error('❌ Failed to parse webhook JSON:', parseError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid JSON payload' 
      }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      });
    }

    // Extract data from the webhook payload - handle both new and legacy formats
    let eventType: string | undefined;
    let messageId: string | undefined;
    let fromPhone: string | undefined;
    let toPhone: string | undefined;
    let messageText: string | undefined;
    let direction: string | undefined;

    // Try new format first (data.event_type and data.payload)
    if (webhookData.data?.event_type && webhookData.data?.payload) {
      console.log('📋 Using NEW Telnyx webhook format (data.event_type)');
      eventType = webhookData.data.event_type;
      messageId = webhookData.data.payload.id;
      fromPhone = webhookData.data.payload.from?.phone_number;
      toPhone = webhookData.data.payload.to?.[0]?.phone_number;
      messageText = webhookData.data.payload.text;
      direction = webhookData.data.payload.direction;
    }
    // Try legacy format (direct event_type and payload)
    else if (webhookData.event_type && webhookData.payload) {
      console.log('📋 Using LEGACY Telnyx webhook format (direct event_type)');
      eventType = webhookData.event_type;
      messageId = webhookData.payload.id;
      fromPhone = webhookData.payload.from?.phone_number;
      toPhone = webhookData.payload.to?.[0]?.phone_number;
      messageText = webhookData.payload.text;
      direction = webhookData.payload.direction;
    }
    // Try top-level format 
    else if (webhookData.event_type) {
      console.log('📋 Using TOP-LEVEL Telnyx webhook format');
      eventType = webhookData.event_type;
      // For top-level format, the message data might be directly in the webhook
      messageId = webhookData.id;
      // We'll need to extract other data differently for this format
    }
    else {
      console.log('❓ Unknown webhook format, logging full structure for debugging');
      console.log('Webhook keys:', Object.keys(webhookData));
    }

    console.log('=== SMS EVENT DETAILS ===');
    console.log('Event Type:', eventType);
    console.log('Message ID:', messageId);
    console.log('From Phone:', fromPhone);
    console.log('To Phone:', toPhone);
    console.log('Direction:', direction);
    console.log('Message Text:', messageText);

    // Only process received messages (incoming SMS)
    if (eventType === 'message.received' && direction === 'inbound' && fromPhone && toPhone && messageText) {
      console.log('✅ Processing inbound SMS...');

      // STEP 1: Find which user owns the receiving phone number
      const userId = await findUserByReceivingNumber(supabaseAdmin, toPhone);
      if (!userId) {
        console.error('❌ No user found for receiving number:', toPhone);
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Receiving number not associated with any user'
        }), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404 
        });
      }

      console.log('✅ Found user:', userId, 'for phone:', toPhone);

      // STEP 2: Find client by phone number within that user's clients
      let client = await findClientByPhone(supabaseAdmin, fromPhone, userId);
      
      // STEP 3: If no client found, create one for this user
      if (!client) {
        console.log('📝 Creating new client for user:', userId);
        client = await createClientForUser(supabaseAdmin, fromPhone, userId);
        if (!client) {
          console.error('❌ Failed to create client');
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Error creating client'
          }), { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          });
        }
      }

      console.log('✅ Using client:', client.id, client.name);

      // STEP 4: Find or create job for this client and user
      let job;
      const { data: existingJob, error: jobError } = await supabaseAdmin
        .from('jobs')
        .select('*')
        .eq('client_id', client.id)
        .eq('created_by', userId)
        .in('status', ['open', 'scheduled'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (jobError) {
        console.error('❌ Error finding job:', jobError);
      }

      if (existingJob) {
        job = existingJob;
        console.log('✅ Using existing job:', job.id);
      } else {
        console.log('📝 Creating new job for client:', client.id, 'and user:', userId);
        // Get the next job ID in the correct format
        const { data: lastJob } = await supabaseAdmin
          .from('jobs')
          .select('id')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        let nextJobNumber = 1;
        if (lastJob && lastJob.id) {
          const match = lastJob.id.match(/J-(\d+)/);
          if (match) {
            nextJobNumber = parseInt(match[1]) + 1;
          }
        }
        const newJobId = `J-${nextJobNumber}`;

        const { data: newJob, error: newJobError } = await supabaseAdmin
          .from('jobs')
          .insert({
            id: newJobId,
            client_id: client.id,
            created_by: userId,
            title: `SMS Communication with ${client.name}`,
            description: 'Auto-created job for SMS communication',
            job_type: 'Communication',
            lead_source: 'SMS',
            status: 'open',
            date: new Date().toISOString(),
            revenue: '0'
          })
          .select()
          .single();

        if (newJobError) {
          console.error('❌ Error creating job:', newJobError);
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Error creating job'
          }), { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          });
        }

        job = newJob;
        console.log('✅ Created new job:', job.id);
      }

      // STEP 5: Find or create conversation for this client and job
      let conversation;
      const { data: existingConversation, error: convError } = await supabaseAdmin
        .from('conversations')
        .select('*')
        .eq('client_id', client.id)
        .eq('job_id', job.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (convError) {
        console.error('❌ Error finding conversation:', convError);
      }

      if (existingConversation) {
        conversation = existingConversation;
        console.log('✅ Using existing conversation:', conversation.id);
        
        // Update last_message_at
        await supabaseAdmin
          .from('conversations')
          .update({ 
            last_message_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', conversation.id);
      } else {
        console.log('📝 Creating new conversation for client:', client.id, 'and job:', job.id);
        const { data: newConversation, error: newConvError } = await supabaseAdmin
          .from('conversations')
          .insert({
            client_id: client.id,
            job_id: job.id,
            status: 'active',
            last_message_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (newConvError) {
          console.error('❌ Error creating conversation:', newConvError);
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Error creating conversation'
          }), { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          });
        }

        conversation = newConversation;
        console.log('✅ Created new conversation:', conversation.id);
      }

      // STEP 6: Store the message
      console.log('📝 Storing message in conversation:', conversation.id);
      const { data: savedMessage, error: messageError } = await supabaseAdmin
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
        })
        .select()
        .single();

      if (messageError) {
        console.error('❌ Error storing message:', messageError);
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Error storing message'
        }), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        });
      }

      console.log('✅ SMS message stored successfully!', savedMessage);
      console.log('=== WEBHOOK PROCESSING COMPLETE ===');
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'SMS webhook processed successfully',
        details: {
          user_id: userId,
          client_id: client.id,
          conversation_id: conversation.id,
          message_id: messageId,
          saved_message_id: savedMessage.id,
          from: fromPhone,
          to: toPhone,
          format_detected: webhookData.data?.event_type ? 'new_format' : 'legacy_format'
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } else {
      console.log('⏭️ Skipping event - not an inbound message or missing required data');
      console.log('Event details for debugging:', {
        eventType,
        direction,
        hasFromPhone: !!fromPhone,
        hasToPhone: !!toPhone,
        hasMessageText: !!messageText,
        webhookKeys: Object.keys(webhookData)
      });
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Event skipped - not an inbound message',
        details: {
          eventType,
          direction,
          hasFromPhone: !!fromPhone,
          hasToPhone: !!toPhone,
          hasMessageText: !!messageText,
          format_attempted: webhookData.data?.event_type ? 'new_format' : 'legacy_format'
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('💥 CRITICAL ERROR processing SMS webhook:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'Unknown error processing webhook'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  } finally {
    console.log('=== SMS RECEIVER WEBHOOK END ===');
  }
});
