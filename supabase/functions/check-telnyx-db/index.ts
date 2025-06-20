
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
    console.log('🔍 Checking Telnyx phone number database status');
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the authorization header to determine the user
    const authHeader = req.headers.get('Authorization')
    console.log('Authorization header present:', !!authHeader)
    
    let user = null;
    if (authHeader) {
      const { data: userData, error: authError } = await supabaseAdmin.auth.getUser(
        authHeader?.replace('Bearer ', '') || ''
      )
      
      if (authError) {
        console.error('Authentication error:', authError)
      } else {
        user = userData.user;
        console.log('Authenticated user:', user?.id)
      }
    }

    const targetNumber = '+14375249932';
    
    // Check if the number exists in telnyx_phone_numbers table
    const { data: telnyxNumbers, error: telnyxError } = await supabaseAdmin
      .from('telnyx_phone_numbers')
      .select('*')
      .eq('phone_number', targetNumber);

    console.log('Telnyx table query result:', { 
      numbersFound: telnyxNumbers?.length || 0, 
      error: telnyxError?.message,
      data: telnyxNumbers
    });

    // Check if it exists in the regular phone_numbers table
    const { data: regularNumbers, error: regularError } = await supabaseAdmin
      .from('phone_numbers')
      .select('*')
      .eq('phone_number', targetNumber);

    console.log('Regular phone_numbers table query result:', { 
      numbersFound: regularNumbers?.length || 0, 
      error: regularError?.message,
      data: regularNumbers
    });

    // Get current user's numbers
    let userTelnyxNumbers = [];
    let userRegularNumbers = [];
    
    if (user) {
      const { data: userTelnyx } = await supabaseAdmin
        .from('telnyx_phone_numbers')
        .select('*')
        .eq('user_id', user.id);
      
      userTelnyxNumbers = userTelnyx || [];

      const { data: userRegular } = await supabaseAdmin
        .from('phone_numbers')
        .select('*')
        .eq('user_id', user.id);
      
      userRegularNumbers = userRegular || [];
    }

    const response = {
      success: true,
      target_number: targetNumber,
      authenticated_user: user?.id || null,
      telnyx_table: {
        exists: (telnyxNumbers?.length || 0) > 0,
        count: telnyxNumbers?.length || 0,
        data: telnyxNumbers || [],
        error: telnyxError?.message || null
      },
      regular_table: {
        exists: (regularNumbers?.length || 0) > 0,
        count: regularNumbers?.length || 0,
        data: regularNumbers || [],
        error: regularError?.message || null
      },
      user_numbers: {
        telnyx_count: userTelnyxNumbers.length,
        regular_count: userRegularNumbers.length,
        telnyx_numbers: userTelnyxNumbers,
        regular_numbers: userRegularNumbers
      },
      recommendations: []
    };

    // Add recommendations based on findings
    if (!response.telnyx_table.exists && !response.regular_table.exists) {
      response.recommendations.push('Number not found in any table - needs to be added');
    } else if (response.telnyx_table.exists) {
      const telnyxRecord = telnyxNumbers[0];
      if (!user) {
        response.recommendations.push('User not authenticated - cannot verify ownership');
      } else if (telnyxRecord.user_id !== user.id) {
        response.recommendations.push(`Number is assigned to different user: ${telnyxRecord.user_id}`);
      } else {
        response.recommendations.push('Number is correctly assigned to current user in telnyx_phone_numbers table');
      }
    } else if (response.regular_table.exists) {
      const regularRecord = regularNumbers[0];
      if (!user) {
        response.recommendations.push('User not authenticated - cannot verify ownership');
      } else if (regularRecord.user_id !== user.id) {
        response.recommendations.push(`Number is assigned to different user in regular table: ${regularRecord.user_id}`);
      } else {
        response.recommendations.push('Number is assigned to current user in regular phone_numbers table');
      }
    }

    console.log('✅ Database check complete:', response);

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('❌ Error in check-telnyx-db function:', error);
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
