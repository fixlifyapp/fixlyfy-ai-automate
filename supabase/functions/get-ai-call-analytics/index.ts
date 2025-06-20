
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

serve(async (req) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: { user } } = await supabaseClient.auth.getUser(
      req.headers.get('Authorization')?.replace('Bearer ', '') ?? ''
    )

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const { timeframe } = await req.json()
    
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
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    }

    // Get user's phone numbers
    const { data: phoneNumbers } = await supabaseClient
      .from('phone_numbers')
      .select('id')
      .eq('purchased_by', user.id)

    const phoneNumberIds = phoneNumbers?.map(p => p.id) || []

    if (phoneNumberIds.length === 0) {
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
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Get call logs for analytics
    const { data: callLogs, error } = await supabaseClient
      .from('ai_dispatcher_call_logs')
      .select('*')
      .in('phone_number_id', phoneNumberIds)
      .gte('call_started_at', startDate.toISOString())
      .order('call_started_at', { ascending: false })

    if (error) {
      console.error('Error fetching call logs:', error)
      return new Response(JSON.stringify({ error: 'Failed to fetch analytics' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Calculate analytics
    const totalCalls = callLogs?.length || 0
    const resolvedCalls = callLogs?.filter(call => call.successful_resolution).length || 0
    const transferredCalls = callLogs?.filter(call => call.customer_intent === 'emergency' || !call.successful_resolution).length || 0
    const successRate = totalCalls > 0 ? Math.round((resolvedCalls / totalCalls) * 100) : 0
    const averageCallDuration = totalCalls > 0 ? 
      Math.round((callLogs?.reduce((sum, call) => sum + (call.call_duration || 60), 0) || 0) / totalCalls) : 0
    const appointmentsScheduled = callLogs?.filter(call => call.customer_intent === 'appointment_request').length || 0

    // Format recent calls
    const recentCalls = (callLogs?.slice(0, 10) || []).map(call => ({
      id: call.id,
      clientPhone: call.customer_phone || 'Unknown',
      duration: call.call_duration || 60,
      status: call.successful_resolution ? 'resolved' : 'transferred',
      resolutionType: call.customer_intent || 'general_inquiry',
      appointmentScheduled: call.customer_intent === 'appointment_request',
      customerSatisfaction: 4.2, // Mock data - you can implement actual customer satisfaction tracking
      startedAt: call.call_started_at || call.created_at,
      summary: `Customer called regarding ${call.customer_intent || 'general inquiry'}`
    }))

    return new Response(JSON.stringify({
      analytics: {
        totalCalls,
        resolvedCalls,
        transferredCalls,
        successRate,
        averageCallDuration,
        appointmentsScheduled,
        customerSatisfactionAverage: 4.2, // Mock data
        recentCalls
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in get-ai-call-analytics:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
