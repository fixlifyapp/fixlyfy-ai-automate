
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
    
    const { estimateId, recipientPhone, message } = requestBody;

    if (!estimateId || !recipientPhone) {
      throw new Error('Missing required fields: estimateId and recipientPhone');
    }

    console.log('Processing SMS for estimate:', estimateId, 'to phone:', recipientPhone);

    const { data: estimate, error: estimateError } = await supabaseAdmin
      .from('estimates')
      .select('*')
      .eq('id', estimateId)
      .single();

    if (estimateError || !estimate) {
      throw new Error('Estimate not found');
    }

    console.log('Estimate found:', estimate.estimate_number);
    
    const { data: job, error: jobError } = await supabaseAdmin
      .from('jobs')
      .select('*')
      .eq('id', estimate.job_id)
      .single();

    if (jobError) {
      console.warn('Could not fetch job details:', jobError);
    }

    let client = null;
    if (job?.client_id) {
      const { data: clientData, error: clientError } = await supabaseAdmin
        .from('clients')
        .select('*')
        .eq('id', job.client_id)
        .single();
      
      if (!clientError) {
        client = clientData;
      }
    }

    // Get company settings for branding
    const { data: companySettings } = await supabaseAdmin
      .from('company_settings')
      .select('company_name')
      .eq('user_id', userData.user.id)
      .maybeSingle();

    const companyName = companySettings?.company_name || 'Fixlify Services';

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

    // Generate client portal login token and create portal link
    let portalLink = '';
    if (client?.email) {
      try {
        console.log('Generating portal link for client email:', client.email);
        
        // Ensure client portal user exists first
        const { data: existingPortalUser, error: portalUserError } = await supabaseAdmin
          .from('client_portal_users')
          .select('*')
          .eq('email', client.email)
          .single();

        if (portalUserError && portalUserError.code === 'PGRST116') {
          // Create client portal user if doesn't exist
          const { error: createError } = await supabaseAdmin
            .from('client_portal_users')
            .insert({
              email: client.email,
              client_id: client.id,
              is_active: true
            });

          if (createError) {
            console.error('Error creating client portal user:', createError);
          } else {
            console.log('Created client portal user for:', client.email);
          }
        }

        const { data: tokenData, error: tokenError } = await supabaseAdmin.rpc('generate_client_login_token', {
          p_email: client.email
        });

        if (!tokenError && tokenData) {
          portalLink = `https://hub.fixlify.app/portal/login?token=${tokenData}&redirect=/portal/estimates?id=${estimate.id}`;
          console.log('Portal link generated for SMS');
        } else {
          console.error('Failed to generate portal login token:', tokenError);
        }
      } catch (error) {
        console.warn('Failed to generate portal login token:', error);
      }
    }

    // Create SMS message with portal link and improved formatting
    let smsMessage;
    if (message) {
      smsMessage = message;
    } else {
      const estimateLink = `https://hub.fixlify.app/estimate/view/${estimate.id}`;
      
      if (portalLink) {
        smsMessage = `Hi ${client?.name || 'valued customer'}! Your estimate ${estimate.estimate_number} from ${companyName} is ready. Total: $${estimate.total?.toFixed(2) || '0.00'}. View in Client Portal: ${portalLink}`;
      } else {
        smsMessage = `Hi ${client?.name || 'valued customer'}! Your estimate ${estimate.estimate_number} from ${companyName} is ready. Total: $${estimate.total?.toFixed(2) || '0.00'}. View: ${estimateLink}`;
      }
    }

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
          external_id: telnyxResult.data?.id,
          estimate_number: estimate.estimate_number,
          client_name: client?.name,
          client_phone: client?.phone,
          portal_link_included: !!portalLink
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
        portalLinkIncluded: !!portalLink
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
