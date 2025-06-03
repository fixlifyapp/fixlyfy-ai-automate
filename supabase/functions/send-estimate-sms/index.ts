
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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header provided');
    }

    // Use service role client for database access
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the current user
    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user) {
      throw new Error('Failed to authenticate user');
    }

    const { estimateId, recipientPhone, fromNumber, message } = await req.json()

    console.log('SMS Request:', { estimateId, recipientPhone, fromNumber });

    if (!estimateId || !recipientPhone || !fromNumber) {
      throw new Error('Missing required fields: estimateId, recipientPhone, fromNumber');
    }

    // Get estimate details
    const { data: estimate, error: estimateError } = await supabaseAdmin
      .from('estimates')
      .select(`
        *,
        jobs:job_id (
          *,
          clients:client_id (*)
        )
      `)
      .eq('id', estimateId)
      .single()

    if (estimateError || !estimate) {
      throw new Error(`Estimate not found: ${estimateError?.message || 'Unknown error'}`);
    }

    // Verify the fromNumber belongs to the authenticated user
    const { data: phoneNumberCheck, error: phoneError } = await supabaseAdmin
      .from('telnyx_phone_numbers')
      .select('*')
      .eq('phone_number', fromNumber)
      .eq('user_id', userData.user.id)
      .eq('status', 'active')
      .single();

    if (phoneError || !phoneNumberCheck) {
      throw new Error('Phone number not found or not authorized for this user');
    }

    const client = estimate.jobs?.clients;
    const job = estimate.jobs;

    // Get Telnyx API key
    const telnyxApiKey = Deno.env.get('TELNYX_API_KEY');
    if (!telnyxApiKey) {
      throw new Error('Telnyx API key not configured');
    }

    // Clean and format phone numbers
    const cleanFromPhone = fromNumber.replace(/\D/g, '');
    const cleanToPhone = recipientPhone.replace(/\D/g, '');
    
    const formattedFromPhone = cleanFromPhone.length === 10 ? `+1${cleanFromPhone}` : `+${cleanFromPhone}`;
    const formattedToPhone = cleanToPhone.length === 10 ? `+1${cleanToPhone}` : `+${cleanToPhone}`;

    // Create SMS message with client portal link if client has email
    let smsMessage = message;
    if (!smsMessage) {
      if (client?.email) {
        // Generate client portal login token
        const { data: tokenData, error: tokenError } = await supabaseAdmin.rpc('generate_client_login_token', {
          p_email: client.email
        });
        
        if (tokenData) {
          const currentDomain = req.headers.get('origin') || 'https://your-app.vercel.app';
          const portalLink = `${currentDomain}/portal/login?token=${tokenData}`;
          smsMessage = `Hi ${client?.name || 'Customer'}! Your estimate #${estimate.estimate_number} is ready ($${estimate.total?.toFixed(2) || '0.00'}). View it here: ${portalLink}`;
        } else {
          smsMessage = `Hi ${client?.name || 'Customer'}! Your estimate #${estimate.estimate_number} is ready. Total: $${estimate.total?.toFixed(2) || '0.00'}. Please contact us for details.`;
        }
      } else {
        smsMessage = `Hi ${client?.name || 'Customer'}! Your estimate #${estimate.estimate_number} is ready. Total: $${estimate.total?.toFixed(2) || '0.00'}. Please contact us for details.`;
      }
    }

    console.log('Sending SMS from:', formattedFromPhone, 'to:', formattedToPhone);

    // Send SMS via Telnyx
    const response = await fetch('https://api.telnyx.com/v2/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${telnyxApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: formattedFromPhone,
        to: formattedToPhone,
        text: smsMessage
      })
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Telnyx API error:', result);
      throw new Error(result.errors?.[0]?.detail || 'Failed to send SMS via Telnyx');
    }

    console.log('SMS sent successfully:', result);

    // Log SMS communication
    try {
      await supabaseAdmin
        .from('estimate_communications')
        .insert({
          estimate_id: estimateId,
          communication_type: 'sms',
          recipient: recipientPhone,
          content: smsMessage,
          status: 'sent',
          provider_message_id: result.data?.id,
          estimate_number: estimate.estimate_number,
          client_name: client?.name,
          client_email: client?.email,
          client_phone: client?.phone,
          sent_at: new Date().toISOString()
        });
    } catch (logError) {
      console.error('Failed to log SMS communication:', logError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'SMS sent successfully',
        messageId: result.data?.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error sending SMS:', error);
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
