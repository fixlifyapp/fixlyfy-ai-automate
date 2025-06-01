
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

interface ConnectCallRequest {
  contactId: string;
  customerNumber: string;
  instanceId: string;
  callStatus: string;
  direction: string;
  attributes?: Record<string, string>;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log(`Enhanced AI Voice Handler: ${req.method} ${req.url}`)
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (req.method !== 'POST') {
      console.log('Method not allowed:', req.method)
      return new Response('Method not allowed', { status: 405 })
    }

    const callData: ConnectCallRequest = await req.json()
    console.log('Amazon Connect call data:', JSON.stringify(callData, null, 2))

    // Find active AI config for any user (for testing)
    const { data: aiConfigs, error: configError } = await supabaseClient
      .from('ai_agent_configs')
      .select('*')
      .eq('is_active', true)
      .limit(1)

    if (configError) {
      console.error('Error fetching AI configs:', configError)
    }

    let aiConfig = aiConfigs?.[0]
    console.log('Found AI config:', aiConfig ? 'Yes' : 'No', aiConfig?.id)

    if (!aiConfig) {
      console.log('No active AI config found, using default settings')
      aiConfig = {
        business_niche: 'General Service',
        diagnostic_price: 75,
        emergency_surcharge: 50,
        custom_prompt_additions: '',
        is_active: true,
        agent_name: 'AI Assistant',
        voice_id: 'alloy',
        greeting_template: 'Hello, my name is {agent_name}. I\'m an AI assistant for {company_name}. How can I help you today?',
        company_name: 'our company',
        service_areas: [],
        business_hours: {},
        service_types: ['HVAC', 'Plumbing', 'Electrical', 'General Repair']
      }
    }

    // Log the incoming call in Amazon Connect calls table
    try {
      const { error: logError } = await supabaseClient
        .from('amazon_connect_calls')
        .insert({
          contact_id: callData.contactId,
          instance_id: callData.instanceId,
          phone_number: callData.customerNumber,
          call_status: callData.callStatus,
          started_at: new Date().toISOString(),
          user_id: aiConfig.user_id || '00000000-0000-0000-0000-000000000000' // Fallback for testing
        })
      
      if (logError) {
        console.error('Error logging Amazon Connect call:', logError)
      } else {
        console.log('Amazon Connect call logged successfully')
      }
    } catch (logErr) {
      console.error('Failed to log Amazon Connect call:', logErr)
    }

    // Generate dynamic greeting with template variables
    const currentHour = new Date().getHours()
    const timeOfDay = currentHour < 12 ? 'morning' : currentHour < 17 ? 'afternoon' : 'evening'
    
    // Check if it's within business hours
    const currentDay = new Date().toLocaleLowerCase().slice(0, 3) + 'day' // e.g., 'monday'
    const businessHours = aiConfig.business_hours || {}
    const todayHours = businessHours[currentDay]
    const isBusinessHours = todayHours?.enabled && 
      currentHour >= parseInt(todayHours.open?.split(':')[0] || '8') && 
      currentHour < parseInt(todayHours.close?.split(':')[0] || '17')

    // Generate personalized greeting
    let greeting = aiConfig.greeting_template || 'Hello, my name is {agent_name}. I\'m an AI assistant for {company_name}. How can I help you today?'
    
    greeting = greeting
      .replace(/{agent_name}/g, aiConfig.agent_name || 'AI Assistant')
      .replace(/{company_name}/g, aiConfig.company_name || 'our company')
      .replace(/{business_type}/g, aiConfig.business_niche || 'service')
      .replace(/{time_of_day}/g, timeOfDay)

    // Add business hours context
    if (!isBusinessHours && todayHours?.enabled === false) {
      greeting += ' We are currently closed today, but I can help with emergency services or schedule an appointment for when we reopen.'
    } else if (!isBusinessHours) {
      greeting += ' We are currently outside our normal business hours, but I can assist with emergencies or schedule appointments.'
    }

    console.log('Generated personalized greeting:', greeting)

    // Enhanced AI configuration for more intelligent responses
    const enhancedAIConfig = {
      businessNiche: aiConfig.business_niche,
      diagnosticPrice: aiConfig.diagnostic_price,
      emergencySurcharge: aiConfig.emergency_surcharge,
      customPrompt: aiConfig.custom_prompt_additions,
      agentName: aiConfig.agent_name,
      voiceId: aiConfig.voice_id,
      companyName: aiConfig.company_name,
      serviceAreas: aiConfig.service_areas,
      serviceTypes: aiConfig.service_types,
      businessHours: aiConfig.business_hours,
      isBusinessHours: isBusinessHours,
      currentTimeOfDay: timeOfDay
    }

    // Return Amazon Connect response format for enhanced AI interaction
    const connectResponse = {
      statusCode: 200,
      body: JSON.stringify({
        greeting: greeting,
        nextAction: 'CAPTURE_SPEECH',
        speechConfig: {
          timeout: 10,
          endSilenceTimeout: 3,
          maxSpeechDuration: 30
        },
        voiceConfig: {
          voiceId: aiConfig.voice_id || 'alloy',
          speed: 1.0,
          pitch: 1.0
        },
        aiConfig: enhancedAIConfig,
        conversationContext: {
          isFirstInteraction: true,
          customerPhone: callData.customerNumber,
          callStartTime: new Date().toISOString(),
          sessionId: callData.contactId
        }
      })
    }

    console.log('Generated enhanced Amazon Connect response:', connectResponse)

    return new Response(JSON.stringify(connectResponse), {
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json' 
      }
    })

  } catch (error) {
    console.error('Error handling enhanced Amazon Connect call:', error)
    
    const errorResponse = {
      statusCode: 500,
      body: JSON.stringify({
        error: 'AI assistant temporarily unavailable',
        nextAction: 'TRANSFER_TO_AGENT',
        fallbackGreeting: 'Hello, I\'m having technical difficulties. Let me transfer you to a human agent.'
      })
    }

    return new Response(JSON.stringify(errorResponse), {
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json' 
      },
      status: 500
    })
  }
})
