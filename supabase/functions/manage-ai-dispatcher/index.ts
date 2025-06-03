
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ManageAIDispatcherRequest {
  action: 'enable' | 'disable'
  phoneNumberId: string
  config?: {
    business_name: string
    business_type: string
    business_greeting?: string
    diagnostic_fee: number
    emergency_surcharge: number
    hourly_rate: number
    voice_selection: string
    emergency_detection_enabled: boolean
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token)
    
    if (userError) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    const { action, phoneNumberId, config }: ManageAIDispatcherRequest = await req.json()

    console.log(`AI Dispatcher ${action} for phoneNumberId: ${phoneNumberId}`)

    if (action === 'enable') {
      // Update both tables to enable AI dispatcher
      const { error: updateTelnyxError } = await supabaseClient
        .from('telnyx_phone_numbers')
        .update({ 
          ai_dispatcher_enabled: true,
          configured_for_ai: true,
          configured_at: new Date().toISOString()
        })
        .eq('id', phoneNumberId)
        .eq('user_id', userData.user.id)

      const { error: updatePhoneError } = await supabaseClient
        .from('phone_numbers')
        .update({ 
          ai_dispatcher_enabled: true,
          configured_for_ai: true
        })
        .eq('id', phoneNumberId)
        .eq('purchased_by', userData.user.id)

      if (updateTelnyxError && updatePhoneError) {
        console.error('Enable errors:', { updateTelnyxError, updatePhoneError })
        throw new Error('Failed to enable AI dispatcher')
      }

      // Create or update AI configuration if provided
      if (config) {
        const { error: configError } = await supabaseClient
          .from('ai_dispatcher_configs')
          .upsert({
            phone_number_id: phoneNumberId,
            ...config
          })

        if (configError) {
          console.error('Config error:', configError)
        }
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'AI Dispatcher enabled successfully' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } else if (action === 'disable') {
      // Update both tables to disable AI dispatcher
      const { error: updateTelnyxError } = await supabaseClient
        .from('telnyx_phone_numbers')
        .update({ 
          ai_dispatcher_enabled: false,
          configured_for_ai: false,
          configured_at: null
        })
        .eq('id', phoneNumberId)
        .eq('user_id', userData.user.id)

      const { error: updatePhoneError } = await supabaseClient
        .from('phone_numbers')
        .update({ 
          ai_dispatcher_enabled: false,
          configured_for_ai: false
        })
        .eq('id', phoneNumberId)
        .eq('purchased_by', userData.user.id)

      if (updateTelnyxError && updatePhoneError) {
        console.error('Disable errors:', { updateTelnyxError, updatePhoneError })
        throw new Error('Failed to disable AI dispatcher')
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'AI Dispatcher disabled successfully' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })

  } catch (error) {
    console.error('Error in manage-ai-dispatcher:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
