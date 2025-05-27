
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const webhookData = await req.json();
    console.log('Amazon Connect webhook received:', webhookData);

    // Handle different webhook events
    switch (webhookData.EventType) {
      case 'CONTACT_EVENT':
        await handleContactEvent(supabaseClient, webhookData);
        break;
      case 'AGENT_EVENT':
        await handleAgentEvent(supabaseClient, webhookData);
        break;
      case 'QUEUE_EVENT':
        await handleQueueEvent(supabaseClient, webhookData);
        break;
      default:
        console.log('Unknown event type:', webhookData.EventType);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in amazon-connect-webhook:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function handleContactEvent(supabase: any, data: any) {
  const { ContactId, CurrentAgentSnapshot, Queue, CustomerEndpoint } = data;
  
  // Update call record with new status
  await supabase
    .from('amazon_connect_calls')
    .update({
      call_status: data.EventName?.toLowerCase() || 'unknown',
      updated_at: new Date().toISOString()
    })
    .eq('contact_id', ContactId);
}

async function handleAgentEvent(supabase: any, data: any) {
  // Handle agent-related events
  console.log('Agent event:', data);
}

async function handleQueueEvent(supabase: any, data: any) {
  // Handle queue-related events
  console.log('Queue event:', data);
}
