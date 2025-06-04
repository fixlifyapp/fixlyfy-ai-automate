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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header provided');
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { to, clientId, jobId } = await req.json();

    if (!to) {
      throw new Error('Phone number is required');
    }

    // Get user's active Telnyx phone number
    const { data: phoneNumbers, error: phoneError } = await supabaseAdmin
      .from('telnyx_phone_numbers')
      .select('*')
      .eq('status', 'active')
      .order('purchased_at', { ascending: false })
      .limit(1);

    if (phoneError || !phoneNumbers || phoneNumbers.length === 0) {
      throw new Error('No active Telnyx phone number found');
    }

    const fromNumber = phoneNumbers[0].phone_number;

    // Format phone numbers
    const formatForTelnyx = (phone: string) => {
      const cleaned = phone.replace(/\D/g, '');
      return cleaned.startsWith('1') ? `+${cleaned}` : `+1${cleaned}`;
    };

    const formattedFrom = formatForTelnyx(fromNumber);
    const formattedTo = formatForTelnyx(to);

    console.log('Making call from:', formattedFrom, 'to:', formattedTo);

    // Get Telnyx API key
    const telnyxApiKey = Deno.env.get('TELNYX_API_KEY');
    if (!telnyxApiKey) {
      throw new Error('Telnyx API key not configured');
    }

    // Make the call using Telnyx API
    const callResponse = await fetch('https://api.telnyx.com/v2/calls', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${telnyxApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        connection_id: phoneNumbers[0].connection_id || 'default',
        to: formattedTo,
        from: formattedFrom,
        webhook_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/telnyx-voice-webhook`,
        webhook_url_method: 'POST'
      })
    });

    const callResult = await callResponse.json();

    if (!callResponse.ok) {
      console.error('Telnyx call API error:', callResult);
      throw new Error(callResult.errors?.[0]?.detail || 'Failed to initiate call');
    }

    const callControlId = callResult.data?.call_control_id;

    // Log the outbound call with proper column mapping
    const { error: logError } = await supabaseAdmin
      .from('telnyx_calls')
      .insert({
        call_control_id: callControlId,
        // Use new column names
        from_number: formattedFrom,
        to_number: formattedTo,
        direction: 'outbound',
        status: 'initiated',
        client_id: clientId || null,
        job_id: jobId || null,
        started_at: new Date().toISOString(),
        // Keep old columns for backward compatibility
        phone_number_id: phoneNumbers[0].id,
        call_status: 'initiated',
        metadata: {
          telnyx_call_id: callResult.data?.id
        }
      });

    if (logError) {
      console.error('Error logging outbound call:', logError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        callControlId,
        message: 'Call initiated successfully' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error making call:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
