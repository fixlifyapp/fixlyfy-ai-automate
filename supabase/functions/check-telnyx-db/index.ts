
import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
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

    // Get the authorization header to determine the user
    const authHeader = req.headers.get('Authorization')
    console.log('Authorization header present:', !!authHeader)
    
    // Verify the user token
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader?.replace('Bearer ', '') || ''
    )
    
    if (authError || !user) {
      console.error('Authentication error:', authError)
      throw new Error('Authentication required')
    }
    
    console.log('Checking database for user:', user.id)

    // Check what's in telnyx_phone_numbers table
    const { data: telnyxNumbers, error: telnyxError } = await supabaseClient
      .from('telnyx_phone_numbers')
      .select('*')
      .eq('user_id', user.id)

    if (telnyxError) {
      console.error('Error fetching telnyx_phone_numbers:', telnyxError)
    }

    // Check what's in phone_numbers table (if exists)
    const { data: phoneNumbers, error: phoneError } = await supabaseClient
      .from('phone_numbers')
      .select('*')
      .eq('user_id', user.id)

    if (phoneError) {
      console.log('No phone_numbers table or error:', phoneError.message)
    }

    // Check company settings
    const { data: companySettings, error: companyError } = await supabaseClient
      .from('company_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    console.log('Database check results:', {
      telnyx_phone_numbers: telnyxNumbers,
      phone_numbers: phoneNumbers,
      company_settings: companySettings
    })

    return new Response(
      JSON.stringify({ 
        success: true,
        database_check: {
          telnyx_phone_numbers: telnyxNumbers || [],
          phone_numbers: phoneNumbers || [],
          company_settings: companySettings || null,
          user_id: user.id
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in database check:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to check database'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
