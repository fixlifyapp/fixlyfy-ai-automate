
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

const getBusinessData = async (supabase: any, phoneNumber: string) => {
  console.log('Loading business data for:', phoneNumber);
  
  // Get phone number settings
  const { data: phoneSettings, error: phoneError } = await supabase
    .from('telnyx_phone_numbers')
    .select('*, user_id')
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

  // Get company settings
  const { data: companySettings, error: companyError } = await supabase
    .from('company_settings')
    .select('*')
    .eq('user_id', phoneSettings.user_id)
    .single();

  // Get job types
  const { data: jobTypes, error: jobTypesError } = await supabase
    .from('job_types')
    .select('name')
    .eq('created_by', phoneSettings.user_id);

  // Get default AI template
  const { data: template, error: templateError } = await supabase
    .from('ai_assistant_templates')
    .select('*')
    .eq('is_default', true)
    .eq('category', 'scheduling')
    .single();

  return {
    phoneSettings,
    aiConfig: aiConfig || {},
    companySettings: companySettings || {},
    jobTypes: jobTypes || [],
    template: template || null
  };
};

const buildPromptWithVariables = (template: string, variables: any) => {
  let prompt = template;
  
  // Replace variables in the template
  Object.keys(variables).forEach(key => {
    const placeholder = `{${key}}`;
    prompt = prompt.replace(new RegExp(placeholder, 'g'), variables[key] || '');
  });
  
  return prompt;
};

const prepareVariables = (businessData: any) => {
  const { aiConfig, companySettings, jobTypes } = businessData;
  
  // Format business hours
  const formatBusinessHours = (hours: any) => {
    if (!hours) return 'Monday-Friday 8AM-5PM';
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const activeDays = days.filter(day => hours[day]?.enabled);
    
    if (activeDays.length === 0) return '24/7';
    
    const firstDay = activeDays[0];
    const lastDay = activeDays[activeDays.length - 1];
    const openTime = hours[firstDay]?.open || '8:00';
    const closeTime = hours[firstDay]?.close || '17:00';
    
    return `${firstDay.charAt(0).toUpperCase() + firstDay.slice(1)}-${lastDay.charAt(0).toUpperCase() + lastDay.slice(1)} ${openTime}-${closeTime}`;
  };

  // Format service areas
  const formatServiceAreas = (areas: any) => {
    if (!areas || areas.length === 0) return 'our local area';
    return Array.isArray(areas) ? areas.join(', ') : areas;
  };

  return {
    company_name: companySettings.company_name || 'our company',
    agent_name: aiConfig.agent_name || 'AI Assistant',
    business_type: companySettings.business_type || aiConfig.business_niche || 'General Service',
    diagnostic_price: aiConfig.diagnostic_price || '75',
    emergency_surcharge: aiConfig.emergency_surcharge || '50',
    service_areas: formatServiceAreas(aiConfig.service_areas),
    business_hours: formatBusinessHours(companySettings.business_hours),
    job_types: jobTypes.map((jt: any) => jt.name).join(', ') || 'various services'
  };
};

const createOrUpdateTelnyxAssistant = async (businessData: any, callControlId: string) => {
  try {
    const { aiConfig, template } = businessData;
    
    // Prepare variables for the prompt
    const variables = prepareVariables(businessData);
    
    // Use template prompt or fallback to aiConfig prompt
    const basePrompt = template?.base_prompt || aiConfig.base_prompt || 
      'Hello, thank you for calling {company_name}. This is {agent_name}. We provide {business_type} services. Our diagnostic fee is ${diagnostic_price}. How can I help you today?';
    
    // Build the final prompt with variables
    const finalPrompt = buildPromptWithVariables(basePrompt, variables);
    
    console.log('🤖 Creating AI Assistant with prompt:', finalPrompt);

    // Create AI Assistant configuration
    const assistantConfig = {
      webhook_url: `${SUPABASE_URL}/functions/v1/ai-dispatcher-webhook`,
      webhook_url_method: 'POST',
      voice: aiConfig.voice_id || 'alloy',
      language: 'en',
      initial_message: finalPrompt,
      max_duration: 300, // 5 minutes max
      interruption_threshold: 500,
      tools: [
        {
          type: 'function',
          function: {
            name: 'schedule_appointment',
            description: 'Schedule a service appointment with the customer',
            parameters: {
              type: 'object',
              properties: {
                customer_name: { type: 'string' },
                phone_number: { type: 'string' },
                service_type: { type: 'string' },
                preferred_date: { type: 'string' },
                preferred_time: { type: 'string' },
                address: { type: 'string' },
                issue_description: { type: 'string' }
              },
              required: ['customer_name', 'phone_number', 'service_type']
            }
          }
        },
        {
          type: 'function',
          function: {
            name: 'get_service_pricing',
            description: 'Get pricing information for services',
            parameters: {
              type: 'object',
              properties: {
                service_type: { type: 'string' }
              },
              required: ['service_type']
            }
          }
        }
      ]
    };

    // Start AI Assistant
    const response = await fetch(`https://api.telnyx.com/v2/calls/${callControlId}/actions/ai_assistant_start`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TELNYX_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(assistantConfig)
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to start AI Assistant:', error);
      return false;
    }
    
    const result = await response.json();
    console.log('✅ AI Assistant started successfully:', result);
    
    // Store assistant ID in aiConfig for future reference
    if (result.data?.assistant_id) {
      await updateAIAssistantId(businessData.phoneSettings.user_id, result.data.assistant_id);
    }
    
    return true;
  } catch (error) {
    console.error('Error creating AI Assistant:', error);
    return false;
  }
};

const updateAIAssistantId = async (userId: string, assistantId: string) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    await supabaseClient
      .from('ai_agent_configs')
      .update({ 
        ai_assistant_id: assistantId,
        telnyx_assistant_config: { assistant_id: assistantId, updated_at: new Date().toISOString() }
      })
      .eq('user_id', userId);

    console.log('✅ AI Assistant ID updated in database');
  } catch (error) {
    console.error('Error updating AI Assistant ID:', error);
  }
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

const answerCallWithAI = async (callControlId: string) => {
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
    
    console.log('✅ Call answered successfully');
    return true;
  } catch (error) {
    console.error('Error answering call:', error);
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

      // Get business data including AI config, company settings, and templates
      const businessData = await getBusinessData(supabaseClient, to || '');
      if (!businessData) {
        console.error('No business data found for phone number:', to);
        return new Response('Business data not found', { status: 404, headers: corsHeaders });
      }

      // Log the AI call
      await logAICall(supabaseClient, {
        phone_number_id: businessData.phoneSettings.id,
        from: from || '',
        to: to || ''
      });

      // Answer the call
      const answerSuccess = await answerCallWithAI(call_control_id || '');
      if (!answerSuccess) {
        return new Response('Failed to answer call', { status: 500, headers: corsHeaders });
      }

      return new Response('AI call initiated', { headers: corsHeaders });
    }

    // Handle call answered - start AI Assistant
    if (eventType === 'call.answered') {
      console.log('🤖 AI call answered, starting AI Assistant...');

      const businessData = await getBusinessData(supabaseClient, to || '');
      if (businessData) {
        await createOrUpdateTelnyxAssistant(businessData, call_control_id || '');
      }

      return new Response('AI Assistant started', { headers: corsHeaders });
    }

    // Handle AI Assistant function calls
    if (eventType === 'ai_assistant.function_call') {
      console.log('🤖 AI Assistant function call received');
      
      // Handle function calls like schedule_appointment, get_service_pricing etc.
      // For now, just acknowledge
      const response = await fetch(`https://api.telnyx.com/v2/calls/${call_control_id}/actions/ai_assistant_function_call_result`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${TELNYX_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          result: 'Function executed successfully'
        })
      });

      return new Response('Function call handled', { headers: corsHeaders });
    }

    // Handle call completion
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
