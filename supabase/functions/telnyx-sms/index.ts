
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
    console.log('📱 SMS request received');
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const requestBody = await req.json()
    console.log('SMS request body:', requestBody);
    
    const { 
      recipientPhone, 
      message, 
      client_id, 
      job_id
    } = requestBody;

    if (!recipientPhone || !message) {
      throw new Error('Missing required fields: recipientPhone and message');
    }

    console.log('🔍 Getting active Telnyx phone number...');
    
    const { data: telnyxNumbers, error: telnyxError } = await supabaseAdmin
      .from('telnyx_phone_numbers')
      .select('phone_number')
      .eq('status', 'active')
      .order('purchased_at', { ascending: false })
      .limit(1);

    console.log('Telnyx query result:', { telnyxNumbers, telnyxError });

    if (telnyxError || !telnyxNumbers || telnyxNumbers.length === 0) {
      throw new Error('No active Telnyx phone number found. Please configure your SMS settings.');
    }

    const fromNumber = telnyxNumbers[0].phone_number;
    console.log('✅ Using phone number for SMS:', fromNumber);

    // Process the message - no need to add approval links here as they're handled by the calling functions
    let finalMessage = message;
    
    if (job_id && !message.includes('hub.fixlify.app/portal/') && !message.includes('hub.fixlify.app/approve/')) {
      // Only add job portal link if no other portal/approval links are present
      console.log('🔗 Adding job portal link for job:', job_id);
      const jobPortalLink = `https://portal.fixlify.app/client/${job_id}`;
      finalMessage = `${message}\n\nView details: ${jobPortalLink}`;
      console.log('✅ Job portal link added to message');
    }

    const telnyxApiKey = Deno.env.get('TELNYX_API_KEY');
    if (!telnyxApiKey) {
      throw new Error('Telnyx API key not configured');
    }

    const cleanPhone = (phone: string) => phone.replace(/\D/g, '');
    const formatForTelnyx = (phone: string) => {
      const cleaned = cleanPhone(phone);
      return cleaned.startsWith('1') ? `+${cleaned}` : `+1${cleaned}`;
    };

    const formattedFromPhone = formatForTelnyx(fromNumber);
    const formattedToPhone = formatForTelnyx(recipientPhone);

    console.log('📞 Sending SMS from:', formattedFromPhone, 'to:', formattedToPhone);
    console.log('📝 Message length:', finalMessage.length);

    const telnyxResponse = await fetch('https://api.telnyx.com/v2/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${telnyxApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: formattedFromPhone,
        to: formattedToPhone,
        text: finalMessage
      })
    });

    const telnyxResult = await telnyxResponse.json();

    if (!telnyxResponse.ok) {
      console.error('❌ Telnyx API error:', telnyxResult);
      throw new Error(telnyxResult.errors?.[0]?.detail || 'Failed to send SMS via Telnyx');
    }

    console.log('✅ SMS sent successfully:', telnyxResult);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'SMS sent successfully',
        messageId: telnyxResult.data?.id,
        finalMessage: finalMessage
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('❌ Error sending SMS:', error);
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
