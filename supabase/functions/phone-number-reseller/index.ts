
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

interface PhoneNumberResellerRequest {
  action: 'search' | 'purchase' | 'list_assignments' | 'update_assignment' | 'get_usage';
  area_code?: string;
  country_code?: string;
  phone_number?: string;
  plan_id?: string;
  assignment_id?: string;
  assignment_data?: any;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log(`Phone Number Reseller: ${req.method} ${req.url}`)
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the current user from the auth header
    const authHeader = req.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    let currentUserId = null
    if (token) {
      const { data: { user } } = await supabaseClient.auth.getUser(token)
      currentUserId = user?.id
      console.log('Current user ID:', currentUserId)
    }

    if (!currentUserId) {
      throw new Error('User authentication required')
    }

    // Get user's company settings
    const { data: companySettings, error: companyError } = await supabaseClient
      .from('company_settings')
      .select('*')
      .eq('user_id', currentUserId)
      .single()

    if (companyError) {
      throw new Error('Company settings not found')
    }

    const telnyxApiKey = Deno.env.get('TELNYX_API_KEY')
    if (!telnyxApiKey) {
      throw new Error('Telnyx API key not configured')
    }

    const { action, area_code, country_code, phone_number, plan_id, assignment_id, assignment_data }: PhoneNumberResellerRequest = await req.json()

    // Search available numbers from Telnyx
    if (action === 'search') {
      console.log(`Searching for numbers with area_code: ${area_code}`)
      
      const searchParams = new URLSearchParams({
        'filter[country_code]': country_code || 'US',
        'filter[features][]': 'sms',
        'page[size]': '25'
      })
      
      if (area_code) {
        searchParams.append('filter[national_destination_code]', area_code)
      }

      const response = await fetch(`https://api.telnyx.com/v2/available_phone_numbers?${searchParams}`, {
        headers: {
          'Authorization': `Bearer ${telnyxApiKey}`,
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error('Failed to search numbers from Telnyx')
      }

      const data = await response.json()
      const telnyxNumbers = data.data?.map((num: any) => ({
        phone_number: num.phone_number,
        region_information: num.region_information,
        features: num.features,
        cost_information: num.cost_information
      })) || []

      return new Response(JSON.stringify({
        success: true,
        available_numbers: telnyxNumbers
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Purchase number for customer
    else if (action === 'purchase') {
      if (!phone_number || !plan_id) {
        throw new Error('Phone number and plan ID are required')
      }

      console.log(`Purchasing number ${phone_number} for company ${companySettings.id}`)

      // Check if company has reached their limit
      const { data: currentAssignments } = await supabaseClient
        .from('phone_number_assignments')
        .select('id')
        .eq('company_id', companySettings.id)
        .eq('is_active', true)

      if (currentAssignments && currentAssignments.length >= companySettings.phone_number_limit) {
        throw new Error('Phone number limit reached for this company')
      }

      // Get plan details
      const { data: plan, error: planError } = await supabaseClient
        .from('phone_number_plans')
        .select('*')
        .eq('id', plan_id)
        .single()

      if (planError || !plan) {
        throw new Error('Invalid plan selected')
      }

      // Purchase from Telnyx
      const purchaseResponse = await fetch('https://api.telnyx.com/v2/number_orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${telnyxApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_numbers: [{ phone_number }]
        })
      })

      if (!purchaseResponse.ok) {
        const errorData = await purchaseResponse.json()
        throw new Error(`Telnyx purchase failed: ${JSON.stringify(errorData)}`)
      }

      const purchaseData = await purchaseResponse.json()

      // Create purchase record
      const { data: purchase, error: purchaseError } = await supabaseClient
        .from('phone_number_purchases')
        .insert({
          company_id: companySettings.id,
          phone_number: phone_number,
          telnyx_number_id: purchaseData.data.id,
          plan_id: plan_id,
          purchase_price: plan.price_per_number,
          monthly_fee: plan.monthly_fee,
          status: 'active'
        })
        .select()
        .single()

      if (purchaseError) {
        throw purchaseError
      }

      // Create assignment record
      const { error: assignmentError } = await supabaseClient
        .from('phone_number_assignments')
        .insert({
          company_id: companySettings.id,
          phone_number: phone_number,
          purchase_id: purchase.id,
          ai_settings: plan.features.ai_dispatcher ? { enabled: true, voice: 'alloy' } : { enabled: false },
          sms_settings: plan.features.sms ? { enabled: true } : { enabled: false },
          call_settings: { enabled: true, voicemail_enabled: true }
        })

      if (assignmentError) {
        throw assignmentError
      }

      // Update company phone numbers used count
      await supabaseClient
        .from('company_settings')
        .update({ 
          phone_numbers_used: (companySettings.phone_numbers_used || 0) + 1 
        })
        .eq('id', companySettings.id)

      return new Response(JSON.stringify({
        success: true,
        message: 'Phone number purchased and assigned successfully',
        purchase_id: purchase.id
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // List company's phone number assignments
    else if (action === 'list_assignments') {
      const { data: assignments, error } = await supabaseClient
        .from('phone_number_assignments')
        .select(`
          *,
          purchase:phone_number_purchases(
            *,
            plan:phone_number_plans(*)
          )
        `)
        .eq('company_id', companySettings.id)
        .order('assigned_at', { ascending: false })

      if (error) throw error

      return new Response(JSON.stringify({
        success: true,
        assignments: assignments || []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Update assignment configuration
    else if (action === 'update_assignment') {
      if (!assignment_id || !assignment_data) {
        throw new Error('Assignment ID and data are required')
      }

      const { error } = await supabaseClient
        .from('phone_number_assignments')
        .update(assignment_data)
        .eq('id', assignment_id)
        .eq('company_id', companySettings.id)

      if (error) throw error

      return new Response(JSON.stringify({
        success: true,
        message: 'Assignment updated successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get usage data
    else if (action === 'get_usage') {
      const { data: billingData, error } = await supabaseClient
        .from('phone_number_billing')
        .select('*')
        .eq('company_id', companySettings.id)
        .order('billing_period_start', { ascending: false })

      if (error) throw error

      return new Response(JSON.stringify({
        success: true,
        billing_data: billingData || []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    else {
      throw new Error('Invalid action')
    }

  } catch (error) {
    console.error('Error in phone-number-reseller:', error)
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Phone number reseller operation failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
