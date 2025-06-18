
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
    console.log('📱 SMS Estimate request received');
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header provided');
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user) {
      throw new Error('Failed to authenticate user');
    }

    const requestBody = await req.json()
    console.log('Request body:', requestBody);
    
    const { estimateId, recipientPhone, message, hoursValid = 72 } = requestBody;

    if (!estimateId || !recipientPhone) {
      throw new Error('Missing required fields: estimateId and recipientPhone');
    }

    console.log('Processing SMS for estimate:', estimateId, 'to phone:', recipientPhone);

    const { data: estimate, error: estimateError } = await supabaseAdmin
      .from('estimates')
      .select(`
        *,
        jobs:job_id (
          id,
          title,
          description,
          address,
          clients:client_id (
            id,
            name,
            email,
            phone
          )
        )
      `)
      .eq('id', estimateId)
      .single();

    if (estimateError || !estimate) {
      throw new Error('Estimate not found');
    }

    console.log('Estimate found:', estimate.estimate_number);

    // Generate secure portal access token
    const accessToken = btoa(Math.random().toString()).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
    const expiresAt = new Date(Date.now() + (hoursValid * 60 * 60 * 1000));

    // Store portal access in database
    const { error: portalError } = await supabaseAdmin
      .from('client_portal_access')
      .insert({
        access_token: accessToken,
        client_id: estimate.jobs?.clients?.id || '',
        document_type: 'estimate',
        document_id: estimateId,
        expires_at: expiresAt.toISOString(),
        permissions: {
          view_estimates: true,
          view_invoices: true,
          make_payments: false
        },
        domain_restriction: 'portal.fixlify.app'
      });

    if (portalError) {
      console.error('Error creating portal access:', portalError);
    }

    // Update estimate with portal access token
    await supabaseAdmin
      .from('estimates')
      .update({ portal_access_token: accessToken })
      .eq('id', estimateId);

    // Generate new portal URL
    const job = estimate.jobs;
    const portalUrl = job?.id 
      ? `https://portal.fixlify.app/portal/${accessToken}/${job.id}`
      : `https://portal.fixlify.app/portal/${accessToken}`;

    console.log('Generated portal URL:', portalUrl);

    const { data: userPhoneNumbers, error: phoneError } = await supabaseAdmin
      .from('telnyx_phone_numbers')
      .select('*')
      .eq('status', 'active')
      .order('purchased_at', { ascending: false })
      .limit(1);

    if (phoneError || !userPhoneNumbers || userPhoneNumbers.length === 0) {
      throw new Error('No active Telnyx phone number found. Please configure your SMS settings.');
    }

    const fromNumber = userPhoneNumbers[0].phone_number;
    console.log('Using from number:', fromNumber);

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

    console.log('Formatted phones - From:', formattedFromPhone, 'To:', formattedToPhone);

    // Create SMS message with new portal link
    const estimateTotal = estimate.total || 0;
    const client = estimate.jobs?.clients;
    
    let smsMessage;
    if (message) {
      smsMessage = message;
      // Add portal link to custom message if not already included
      if (portalUrl && !message.includes('portal.fixlify.app')) {
        smsMessage = `${message}\n\nView details: ${portalUrl}`;
      }
    } else {
      if (portalUrl) {
        smsMessage = `Hi ${client?.name || 'valued customer'}! Your estimate ${estimate.estimate_number} is ready. Total: $${estimateTotal.toFixed(2)}. View details: ${portalUrl}`;
      } else {
        smsMessage = `Hi ${client?.name || 'valued customer'}! Your estimate ${estimate.estimate_number} is ready. Total: $${estimateTotal.toFixed(2)}. Contact us for details.`;
      }
    }

    console.log('SMS message to send:', smsMessage);
    console.log('SMS message length:', smsMessage.length);

    const telnyxResponse = await fetch('https://api.telnyx.com/v2/messages', {
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

    const telnyxResult = await telnyxResponse.json();
    console.log('Telnyx response:', telnyxResult);

    if (!telnyxResponse.ok) {
      console.error('Telnyx API error:', telnyxResult);
      throw new Error(telnyxResult.errors?.[0]?.detail || 'Failed to send SMS via Telnyx');
    }

    // Log SMS communication
    try {
      await supabaseAdmin
        .from('estimate_communications')
        .insert({
          estimate_id: estimateId,
          communication_type: 'sms',
          recipient: formattedToPhone,
          content: smsMessage,
          status: 'sent',
          provider_message_id: telnyxResult.data?.id,
          estimate_number: estimate.estimate_number,
          client_name: client?.name,
          client_email: client?.email,
          client_phone: client?.phone,
          portal_link_included: !!portalUrl
        });
    } catch (logError) {
      console.warn('Failed to log communication:', logError);
    }

    console.log('SMS sent successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'SMS sent successfully',
        messageId: telnyxResult.data?.id,
        portalUrl: portalUrl,
        smsContent: smsMessage
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
