
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')

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
  [key: string]: any;
}

const findPhoneNumberSettings = async (supabase: any, phoneNumber: string) => {
  console.log('Looking up settings for phone number:', phoneNumber);
  
  const { data: phoneSettings, error } = await supabase
    .from('telnyx_phone_numbers')
    .select('*')
    .eq('phone_number', phoneNumber)
    .eq('status', 'active')
    .single();

  if (error) {
    console.error('Error finding phone number settings:', error);
    return null;
  }

  console.log('Found phone settings:', phoneSettings);
  return phoneSettings;
};

const logRoutingDecision = async (supabase: any, decision: string, phoneNumber: string, callerPhone: string, aiEnabled: boolean, callControlId: string, metadata: any = {}) => {
  try {
    const { error } = await supabase
      .from('call_routing_logs')
      .insert({
        phone_number: phoneNumber,
        caller_phone: callerPhone,
        routing_decision: decision,
        ai_enabled: aiEnabled,
        call_control_id: callControlId,
        metadata
      });

    if (error) {
      console.error('Error logging routing decision:', error);
    } else {
      console.log(`✅ Logged routing decision: ${decision} for ${phoneNumber}`);
    }
  } catch (error) {
    console.error('Error in logRoutingDecision:', error);
  }
};

const updatePhoneNumberStats = async (supabase: any, phoneNumber: string, routingDecision: string) => {
  try {
    const { error } = await supabase
      .from('telnyx_phone_numbers')
      .update({
        last_call_routed_to: routingDecision,
        call_routing_stats: {
          last_routed_at: new Date().toISOString(),
          last_routing_decision: routingDecision
        }
      })
      .eq('phone_number', phoneNumber);

    if (error) {
      console.error('Error updating phone number stats:', error);
    }
  } catch (error) {
    console.error('Error in updatePhoneNumberStats:', error);
  }
};

const routeToAIDispatcher = async (webhookData: any) => {
  console.log('🤖 Routing to AI Dispatcher...');
  
  const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-dispatcher-webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
    },
    body: JSON.stringify(webhookData)
  });

  return response;
};

const routeToBasicTelephony = async (webhookData: any) => {
  console.log('📞 Routing to Basic Telephony...');
  
  const response = await fetch(`${SUPABASE_URL}/functions/v1/basic-telephony-webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
    },
    body: JSON.stringify(webhookData)
  });

  return response;
};

serve(async (req) => {
  console.log('=== TELNYX WEBHOOK ROUTER START ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const rawBody = await req.text();
    console.log('Raw webhook body length:', rawBody.length);

    let webhookData: TelnyxWebhookData;
    try {
      webhookData = JSON.parse(rawBody);
      console.log('Parsed webhook data keys:', Object.keys(webhookData));
    } catch (parseError) {
      console.error('Failed to parse webhook JSON:', parseError);
      return new Response('Invalid JSON', { status: 400, headers: corsHeaders });
    }

    // Extract call information
    let callControlId: string | undefined;
    let from: string | undefined;
    let to: string | undefined;
    let eventType: string | undefined;

    if (webhookData.data?.payload) {
      callControlId = webhookData.data.payload.call_control_id;
      from = webhookData.data.payload.from;
      to = webhookData.data.payload.to;
      eventType = webhookData.data.event_type;
    }

    console.log('Call details:', { eventType, from, to, callControlId });

    if (!to) {
      console.error('No destination phone number found in webhook');
      return new Response('No destination number', { status: 400, headers: corsHeaders });
    }

    // Look up phone number settings
    const phoneSettings = await findPhoneNumberSettings(supabaseClient, to);
    
    if (!phoneSettings) {
      console.error('Phone number not found or not active:', to);
      return new Response('Phone number not configured', { status: 404, headers: corsHeaders });
    }

    const aiEnabled = phoneSettings.ai_dispatcher_enabled;
    console.log(`AI Dispatcher enabled for ${to}: ${aiEnabled}`);

    // Log the routing decision
    const routingDecision = aiEnabled ? 'ai_dispatcher' : 'basic_telephony';
    await logRoutingDecision(
      supabaseClient,
      routingDecision,
      to,
      from || 'unknown',
      aiEnabled,
      callControlId || 'unknown',
      { event_type: eventType, phone_settings: phoneSettings }
    );

    // Update phone number stats
    await updatePhoneNumberStats(supabaseClient, to, routingDecision);

    // Route to appropriate handler
    let response;
    if (aiEnabled) {
      response = await routeToAIDispatcher(webhookData);
    } else {
      response = await routeToBasicTelephony(webhookData);
    }

    console.log(`Routed to ${routingDecision}, response status:`, response.status);

    // Forward the response from the handler
    const responseBody = await response.text();
    return new Response(responseBody, {
      status: response.status,
      headers: { ...corsHeaders, 'Content-Type': response.headers.get('Content-Type') || 'application/json' }
    });

  } catch (error) {
    console.error('Error in webhook router:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  } finally {
    console.log('=== TELNYX WEBHOOK ROUTER END ===');
  }
});
