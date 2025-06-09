
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const TELNYX_API_KEY = Deno.env.get('TELNYX_API_KEY')

interface TelnyxWebhookData {
  data?: {
    event_type?: string;
    payload?: {
      call_control_id?: string;
      from?: string;
      to?: string;
      direction?: string;
      state?: string;
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

const findClientByPhone = async (supabase: any, phone: string, userId: string) => {
  const formattedPhone = formatPhoneNumber(phone);
  
  const phoneVariations = [
    phone,
    formattedPhone,
    `+1${formattedPhone}`,
    `(${formattedPhone.slice(0,3)}) ${formattedPhone.slice(3,6)}-${formattedPhone.slice(6)}`,
    `${formattedPhone.slice(0,3)}-${formattedPhone.slice(3,6)}-${formattedPhone.slice(6)}`
  ];

  for (const phoneVar of phoneVariations) {
    const { data: client, error } = await supabase
      .from('clients')
      .select('*')
      .ilike('phone', `%${phoneVar}%`)
      .eq('created_by', userId)
      .limit(1)
      .maybeSingle();

    if (!error && client) {
      return client;
    }
  }
  return null;
};

const logBasicCall = async (supabaseClient: any, callControlId: string, from: string, to: string, phoneNumberData?: any) => {
  try {
    // Find client by phone number
    const client = phoneNumberData?.user_id 
      ? await findClientByPhone(supabaseClient, from, phoneNumberData.user_id)
      : null;
    
    const { error } = await supabaseClient
      .from('telnyx_calls')
      .insert({
        call_control_id: callControlId,
        from_number: from,
        to_number: to,
        direction: 'inbound',
        status: 'initiated',
        client_id: client?.id || null,
        started_at: new Date().toISOString(),
        phone_number_id: phoneNumberData?.id || null,
        call_status: 'initiated',
        metadata: {
          routing_type: 'basic_telephony',
          phone_number_data: phoneNumberData
        }
      });

    if (error) {
      console.error('Error logging basic call:', error);
    } else {
      console.log('✅ Basic call logged successfully');
    }
  } catch (error) {
    console.error('Error in logBasicCall:', error);
  }
};

const updateCallStatus = async (supabaseClient: any, callControlId: string, status: string, additionalData?: any) => {
  try {
    const updateData: any = { 
      status,
      call_status: status
    };
    
    if (additionalData) {
      if (additionalData.answered_at) updateData.answered_at = additionalData.answered_at;
      if (additionalData.ended_at) updateData.ended_at = additionalData.ended_at;
      if (additionalData.duration_seconds) {
        updateData.duration_seconds = additionalData.duration_seconds;
        updateData.call_duration = additionalData.duration_seconds;
      }
      if (additionalData.metadata) updateData.metadata = additionalData.metadata;
    }

    const { error } = await supabaseClient
      .from('telnyx_calls')
      .update(updateData)
      .eq('call_control_id', callControlId);

    if (error) {
      console.error('Error updating basic call status:', error);
    } else {
      console.log(`✅ Basic call status updated to: ${status}`);
    }
  } catch (error) {
    console.error('Error in updateCallStatus:', error);
  }
};

const handleIncomingCall = async (callControlId: string, phoneNumberData: any) => {
  try {
    console.log('📞 Handling incoming call with basic telephony');
    
    // For basic telephony, we typically want to forward to a human
    // This could be:
    // 1. Answer and play a message
    // 2. Forward to a specific number
    // 3. Send to voicemail
    // 4. Ring multiple phones (hunt group)
    
    // For now, let's answer the call and play a simple message
    const response = await fetch(`https://api.telnyx.com/v2/calls/${callControlId}/actions/answer`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TELNYX_API_KEY}`,
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to answer call:', error);
      return false;
    }
    
    console.log('✅ Basic telephony call answered');
    return true;
  } catch (error) {
    console.error('Error handling incoming call:', error);
    return false;
  }
};

const playGreetingMessage = async (callControlId: string, companyName: string = 'our company') => {
  try {
    const greeting = `Hello, thank you for calling ${companyName}. Please hold while we connect you to the next available representative.`;
    
    const response = await fetch(`https://api.telnyx.com/v2/calls/${callControlId}/actions/speak`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TELNYX_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        payload: greeting,
        voice: 'alice',
        language: 'en'
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to play greeting:', error);
      return false;
    }
    
    console.log('✅ Greeting message played');
    return true;
  } catch (error) {
    console.error('Error playing greeting:', error);
    return false;
  }
};

serve(async (req) => {
  console.log('=== BASIC TELEPHONY WEBHOOK START ===');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const webhookData: TelnyxWebhookData = await req.json();
    console.log('Basic Telephony received webhook:', webhookData.data?.event_type);

    const payload = webhookData.data?.payload;
    if (!payload) {
      console.error('No payload in webhook data');
      return new Response('No payload', { status: 400, headers: corsHeaders });
    }

    const { call_control_id, from, to, direction } = payload;
    const eventType = webhookData.data?.event_type;

    console.log(`Basic Telephony handling: ${eventType} for ${from} -> ${to}`);

    // Get phone number data
    const { data: phoneNumberData } = await supabaseClient
      .from('telnyx_phone_numbers')
      .select('*')
      .eq('phone_number', to)
      .single();

    // Handle incoming call initiation
    if (eventType === 'call.initiated' && direction === 'inbound') {
      console.log('📞 New incoming call for Basic Telephony');

      // Log the call
      await logBasicCall(supabaseClient, call_control_id || '', from || '', to || '', phoneNumberData);

      // Answer the call
      const answerSuccess = await handleIncomingCall(call_control_id || '', phoneNumberData);
      if (!answerSuccess) {
        return new Response('Failed to answer call', { status: 500, headers: corsHeaders });
      }

      return new Response('Basic telephony call initiated', { headers: corsHeaders });
    }

    // Handle call answered
    if (eventType === 'call.answered') {
      console.log('📞 Basic telephony call answered');

      // Update call status
      await updateCallStatus(supabaseClient, call_control_id || '', 'answered', {
        answered_at: new Date().toISOString()
      });

      // Play greeting message
      const companyName = phoneNumberData?.user_id ? 'your company' : 'our company';
      await playGreetingMessage(call_control_id || '', companyName);

      return new Response('Basic telephony call answered', { headers: corsHeaders });
    }

    // Handle call completion
    if (eventType === 'call.hangup') {
      console.log('📞 Basic telephony call ended');
      
      await updateCallStatus(supabaseClient, call_control_id || '', 'completed', {
        ended_at: new Date().toISOString()
      });

      return new Response('Basic telephony call completed', { headers: corsHeaders });
    }

    console.log('📞 Basic Telephony event processed:', eventType);
    return new Response('Event processed', { headers: corsHeaders });

  } catch (error) {
    console.error('Error in Basic Telephony webhook:', error);
    return new Response(JSON.stringify({ 
      error: 'Basic Telephony error',
      message: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  } finally {
    console.log('=== BASIC TELEPHONY WEBHOOK END ===');
  }
});
