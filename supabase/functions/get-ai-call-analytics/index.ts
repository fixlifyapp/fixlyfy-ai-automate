
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GetAnalyticsRequest {
  timeframe: 'today' | 'week' | 'month' | 'year'
  phoneNumberId?: string
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

    const { timeframe, phoneNumberId }: GetAnalyticsRequest = await req.json()

    // Calculate date range based on timeframe
    const now = new Date()
    let startDate: Date

    switch (timeframe) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    // Build query for user's phone numbers
    let phoneNumberQuery = supabaseClient
      .from('phone_numbers')
      .select('id')
      .eq('purchased_by', userData.user.id)

    if (phoneNumberId) {
      phoneNumberQuery = phoneNumberQuery.eq('id', phoneNumberId)
    }

    const { data: userPhoneNumbers } = await phoneNumberQuery

    if (!userPhoneNumbers || userPhoneNumbers.length === 0) {
      return new Response(JSON.stringify({
        analytics: {
          totalCalls: 0,
          resolvedCalls: 0,
          transferredCalls: 0,
          successRate: 0,
          averageCallDuration: 0,
          appointmentsScheduled: 0,
          customerSatisfactionAverage: 0,
          recentCalls: []
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const phoneNumberIds = userPhoneNumbers.map(pn => pn.id)

    // Get call analytics
    const { data: callLogs, error: logsError } = await supabaseClient
      .from('ai_dispatcher_call_logs')
      .select('*')
      .in('phone_number_id', phoneNumberIds)
      .gte('started_at', startDate.toISOString())
      .order('started_at', { ascending: false })

    if (logsError) {
      throw logsError
    }

    const logs = callLogs || []

    // Calculate metrics
    const totalCalls = logs.length
    const resolvedCalls = logs.filter(log => log.resolution_type === 'resolved').length
    const transferredCalls = logs.filter(log => log.resolution_type === 'transferred').length
    const successRate = totalCalls > 0 ? (resolvedCalls / totalCalls) * 100 : 0
    
    const averageCallDuration = logs.length > 0 
      ? logs.reduce((sum, log) => sum + (log.call_duration || 0), 0) / logs.length 
      : 0

    const appointmentsScheduled = logs.filter(log => log.appointment_scheduled).length

    const satisfactionScores = logs.filter(log => log.customer_satisfaction_score)
    const customerSatisfactionAverage = satisfactionScores.length > 0
      ? satisfactionScores.reduce((sum, log) => sum + log.customer_satisfaction_score, 0) / satisfactionScores.length
      : 0

    const recentCalls = logs.slice(0, 10).map(log => ({
      id: log.id,
      clientPhone: log.client_phone,
      duration: log.call_duration,
      status: log.call_status,
      resolutionType: log.resolution_type,
      appointmentScheduled: log.appointment_scheduled,
      customerSatisfaction: log.customer_satisfaction_score,
      startedAt: log.started_at,
      summary: log.call_summary
    }))

    return new Response(JSON.stringify({
      analytics: {
        totalCalls,
        resolvedCalls,
        transferredCalls,
        successRate: Math.round(successRate * 100) / 100,
        averageCallDuration: Math.round(averageCallDuration),
        appointmentsScheduled,
        customerSatisfactionAverage: Math.round(customerSatisfactionAverage * 100) / 100,
        recentCalls
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in get-ai-call-analytics:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
