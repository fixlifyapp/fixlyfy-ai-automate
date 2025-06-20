
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
      console.error('❌ No authorization header provided');
      throw new Error('No authorization header provided');
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user) {
      console.error('❌ Failed to authenticate user:', userError);
      throw new Error('Failed to authenticate user');
    }

    const requestBody = await req.json()
    console.log('📱 Request body received:', { estimateId: requestBody.estimateId, recipientPhone: requestBody.recipientPhone });
    
    const { estimateId, recipientPhone, message } = requestBody;

    if (!estimateId || !recipientPhone) {
      console.error('❌ Missing required fields:', { estimateId: !!estimateId, recipientPhone: !!recipientPhone });
      throw new Error('Missing required fields: estimateId and recipientPhone');
    }

    console.log('🔍 Processing SMS for estimate:', estimateId, 'to phone:', recipientPhone);

    // Validate phone number format
    const cleanedPhone = recipientPhone.replace(/\D/g, '');
    if (cleanedPhone.length < 10) {
      console.error('❌ Invalid phone number format:', recipientPhone);
      throw new Error('Invalid phone number format. Please enter a valid 10-digit phone number.');
    }

    const { data: estimate, error: estimateError } = await supabaseAdmin
      .from('estimates')
      .select(`
        *,
        jobs!inner(
          id,
          client_id,
          clients!inner(
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
      console.error('❌ Estimate lookup error:', estimateError);
      throw new Error(`Estimate not found: ${estimateError?.message || 'Unknown error'}`);
    }

    console.log('✅ Estimate found:', estimate.estimate_number);

    const client = estimate.jobs.clients;

    // Generate portal access token
    console.log('🔄 Generating portal access token...');
    
    const { data: portalToken, error: portalError } = await supabaseAdmin
      .rpc('generate_portal_access', {
        p_client_id: client.id,
        p_permissions: {
          view_estimates: true,
          view_invoices: true,
          make_payments: false
        },
        p_hours_valid: 72,
        p_domain_restriction: 'hub.fixlify.app'
      });

    if (portalError || !portalToken) {
      console.error('❌ Failed to generate portal token:', portalError);
      throw new Error(`Failed to generate portal access token: ${portalError?.message || 'Unknown error'}`);
    }

    console.log('✅ Portal access token generated');

    const portalLink = `https://hub.fixlify.app/portal/${portalToken}`;

    // Create SMS message with portal link
    const estimateTotal = estimate.total || 0;
    
    let smsMessage;
    if (message) {
      smsMessage = message;
      // Add portal link to custom message if not already included
      if (!message.includes('hub.fixlify.app/portal/')) {
        smsMessage = `${message}\n\nView your estimate: ${portalLink}`;
      }
    } else {
      smsMessage = `Hi ${client.name || 'valued customer'}! Your estimate ${estimate.estimate_number} is ready. Total: $${estimateTotal.toFixed(2)}. View your estimate: ${portalLink}`;
    }

    console.log('📱 SMS message prepared, length:', smsMessage.length);

    // Use telnyx-sms function for sending
    console.log('🔄 Calling telnyx-sms function...');
    const { data: smsData, error: smsError } = await supabaseAdmin.functions.invoke('telnyx-sms', {
      body: {
        recipientPhone: recipientPhone,
        message: smsMessage,
        client_id: client.id,
        job_id: estimate.job_id,
        user_id: userData.user.id
      }
    });

    console.log('📱 Telnyx-sms response:', { success: smsData?.success, error: smsError });

    if (smsError) {
      console.error('❌ Error from telnyx-sms:', smsError);
      throw new Error(`SMS service error: ${smsError.message || 'Failed to send SMS'}`);
    }

    if (!smsData?.success) {
      console.error('❌ SMS sending failed:', smsData);
      throw new Error(`SMS sending failed: ${smsData?.error || 'Unknown error'}`);
    }

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
          provider_message_id: smsData?.messageId,
          estimate_number: estimate.estimate_number,
          client_name: client.name,
          client_email: client.email,
          client_phone: client.phone,
          portal_link_included: true
        });
      console.log('✅ SMS communication logged successfully');
    } catch (logError) {
      console.warn('⚠️ Failed to log communication:', logError);
    }

    console.log('✅ SMS sent successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'SMS sent successfully',
        messageId: smsData?.messageId,
        portalLink: portalLink,
        smsContent: smsMessage
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('❌ Error in send-estimate-sms function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to send SMS'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
