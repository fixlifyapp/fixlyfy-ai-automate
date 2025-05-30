
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
  console.log(`Amazon Connect webhook: ${req.method} ${req.url}`)
  
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
        is_active: true
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

    // Generate AI greeting based on configuration
    const businessType = aiConfig.business_niche || 'service'
    const greeting = `Hello! Thanks for calling our ${businessType} company. I'm your AI assistant and I'm here to help with your service needs. How can I assist you today?`

    console.log('Generated greeting:', greeting)

    // Return Amazon Connect response format for AI interaction
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
        aiConfig: {
          businessNiche: aiConfig.business_niche,
          diagnosticPrice: aiConfig.diagnostic_price,
          emergencySurcharge: aiConfig.emergency_surcharge,
          customPrompt: aiConfig.custom_prompt_additions
        }
      })
    }

    console.log('Generated Amazon Connect response:', connectResponse)

    return new Response(JSON.stringify(connectResponse), {
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json' 
      }
    })

  } catch (error) {
    console.error('Error handling Amazon Connect call:', error)
    
    const errorResponse = {
      statusCode: 500,
      body: JSON.stringify({
        error: 'AI assistant temporarily unavailable',
        nextAction: 'TRANSFER_TO_AGENT'
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
