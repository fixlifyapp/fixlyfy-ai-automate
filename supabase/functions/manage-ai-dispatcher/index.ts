
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader?.replace('Bearer ', '') || ''
    )
    
    if (authError || !user) {
      throw new Error('Authentication required')
    }

    const { action, phoneNumberId, enabled, config } = await req.json()
    
    console.log('AI Dispatcher management action:', { action, phoneNumberId, enabled })

    if (action === 'enable') {
      // Enable AI dispatcher for a phone number
      const { data, error } = await supabaseClient
        .from('telnyx_phone_numbers')
        .update({
          ai_dispatcher_enabled: true,
          ai_dispatcher_config: config || {},
          updated_at: new Date().toISOString()
        })
        .eq('id', phoneNumberId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Error enabling AI dispatcher:', error)
        throw error
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'AI Dispatcher enabled successfully',
          data
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    if (action === 'disable') {
      // Disable AI dispatcher for a phone number
      const { data, error } = await supabaseClient
        .from('telnyx_phone_numbers')
        .update({
          ai_dispatcher_enabled: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', phoneNumberId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Error disabling AI dispatcher:', error)
        throw error
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'AI Dispatcher disabled successfully',
          data
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    if (action === 'toggle') {
      // Toggle AI dispatcher status
      const { data, error } = await supabaseClient
        .from('telnyx_phone_numbers')
        .update({
          ai_dispatcher_enabled: enabled,
          updated_at: new Date().toISOString()
        })
        .eq('id', phoneNumberId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Error toggling AI dispatcher:', error)
        throw error
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `AI Dispatcher ${enabled ? 'enabled' : 'disabled'} successfully`,
          data
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    if (action === 'get_stats') {
      // Get AI dispatcher statistics
      const { data: routingLogs, error } = await supabaseClient
        .from('call_routing_logs')
        .select('*')
        .eq('phone_number', phoneNumberId)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) {
        console.error('Error getting routing stats:', error)
        throw error
      }

      const stats = {
        total_calls: routingLogs.length,
        ai_calls: routingLogs.filter(log => log.routing_decision === 'ai_dispatcher').length,
        basic_calls: routingLogs.filter(log => log.routing_decision === 'basic_telephony').length,
        recent_logs: routingLogs.slice(0, 10)
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          stats
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    throw new Error('Invalid action specified')

  } catch (error) {
    console.error('Error in manage-ai-dispatcher:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to process request'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
