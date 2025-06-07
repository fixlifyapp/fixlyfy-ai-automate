
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const TELNYX_API_KEY = Deno.env.get('TELNYX_API_KEY')
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
}

const getAIConfig = async (supabase: any, phoneNumber: string) => {
  console.log('Getting AI config for:', phoneNumber);
  
  // Get phone number settings
  const { data: phoneSettings, error: phoneError } = await supabase
    .from('telnyx_phone_numbers')
    .select('*, ai_dispatcher_config')
    .eq('phone_number', phoneNumber)
    .single();

  if (phoneError) {
    console.error('Error getting phone settings:', phoneError);
    return null;
  }

  // Get user's AI agent config
  const { data: aiConfig, error: aiError } = await supabase
    .from('ai_agent_configs')
    .select('*')
    .eq('user_id', phoneSettings.user_id)
    .single();

  if (aiError) {
    console.error('Error getting AI config:', aiError);
    return null;
  }

  return {
    phoneSettings,
    aiConfig
  };
};

const logAICall = async (supabase: any, callData: any) => {
  try {
    const { error } = await supabase
      .from('ai_dispatcher_call_logs')
      .insert({
        phone_number_id: callData.phone_number_id,
        client_phone: callData.from,
        call_status: 'initiated',
        started_at: new Date().toISOString(),
        ai_transcript: '',
        appointment_scheduled: false,
        successful_resolution: false
      });

    if (error) {
      console.error('Error logging AI call:', error);
    } else {
      console.log('✅ AI call logged successfully');
    }
  } catch (error) {
    console.error('Error in logAICall:', error);
  }
};

const answerCallWithAI = async (callControlId: string, aiConfig: any) => {
  try {
    console.log('🤖 Answering call with AI for call:', callControlId);
    
    const response = await fetch(`https://api.telnyx.com/v2/calls/${callControlId}/actions/answer`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TELNYX_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        webhook_url: `${SUPABASE_URL}/functions/v1/ai-dispatcher-webhook`,
        webhook_url_method: 'POST'
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to answer call:', error);
      return false;
    }
    
    console.log('✅ Call answered successfully, starting AI processing...');
    return true;
  } catch (error) {
    console.error('Error answering call with AI:', error);
    return false;
  }
};

const startAIInteraction = async (callControlId: string, aiConfig: any) => {
  try {
    // Generate AI greeting based on config
    const greeting = aiConfig.greeting_template
      .replace('{agent_name}', aiConfig.agent_name || 'AI Assistant')
      .replace('{company_name}', aiConfig.company_name || 'our company');

    console.log('🎤 Starting AI interaction with greeting:', greeting);

    // Here you would integrate with your AI voice service
    // For now, we'll use Telnyx's speak action as a placeholder
    const response = await fetch(`https://api.telnyx.com/v2/calls/${callControlId}/actions/speak`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TELNYX_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        payload: greeting,
        voice: aiConfig.voice_id || 'alice',
        language: 'en'
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to start AI interaction:', error);
      return false;
    }
    
    console.log('✅ AI interaction started successfully');
    return true;
  } catch (error) {
    console.error('Error starting AI interaction:', error);
    return false;
  }
};

serve(async (req) => {
  console.log('=== AI DISPATCHER WEBHOOK START ===');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const webhookData: TelnyxWebhookData = await req.json();
    console.log('AI Dispatcher received webhook:', webhookData.data?.event_type);

    const payload = webhookData.data?.payload;
    if (!payload) {
      console.error('No payload in webhook data');
      return new Response('No payload', { status: 400, headers: corsHeaders });
    }

    const { call_control_id, from, to, direction } = payload;
    const eventType = webhookData.data?.event_type;

    console.log(`AI Dispatcher handling: ${eventType} for ${from} -> ${to}`);

    // Handle incoming call initiation
    if (eventType === 'call.initiated' && direction === 'inbound') {
      console.log('🤖 New incoming call for AI Dispatcher');

      // Get AI configuration
      const config = await getAIConfig(supabaseClient, to || '');
      if (!config) {
        console.error('No AI config found for phone number:', to);
        return new Response('AI config not found', { status: 404, headers: corsHeaders });
      }

      // Log the AI call
      await logAICall(supabaseClient, {
        phone_number_id: config.phoneSettings.id,
        from: from || '',
        to: to || ''
      });

      // Answer the call with AI
      const answerSuccess = await answerCallWithAI(call_control_id || '', config.aiConfig);
      if (!answerSuccess) {
        return new Response('Failed to answer call', { status: 500, headers: corsHeaders });
      }

      return new Response('AI call initiated', { headers: corsHeaders });
    }

    // Handle call answered
    if (eventType === 'call.answered') {
      console.log('🤖 AI call answered, starting interaction...');

      const config = await getAIConfig(supabaseClient, to || '');
      if (config) {
        await startAIInteraction(call_control_id || '', config.aiConfig);
      }

      return new Response('AI interaction started', { headers: corsHeaders });
    }

    // Handle other AI-specific events
    if (eventType === 'call.hangup') {
      console.log('🤖 AI call ended');
      
      // Update call log with completion
      // You would add more sophisticated logging here
      
      return new Response('AI call completed', { headers: corsHeaders });
    }

    console.log('🤖 AI Dispatcher event processed:', eventType);
    return new Response('Event processed', { headers: corsHeaders });

  } catch (error) {
    console.error('Error in AI Dispatcher webhook:', error);
    return new Response(JSON.stringify({ 
      error: 'AI Dispatcher error',
      message: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  } finally {
    console.log('=== AI DISPATCHER WEBHOOK END ===');
  }
});
