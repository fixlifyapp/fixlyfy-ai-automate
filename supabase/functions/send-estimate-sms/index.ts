
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

    // Get estimate details with job and client information
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

    // Generate client portal login token and create portal link
    let portalLink = '';
    let smsMessage = message;

    if (client?.email) {
      try {
        console.log('Generating client portal login token for:', client.email);
        
        // First ensure client portal user exists
        const { data: existingPortalUser, error: portalUserError } = await supabaseAdmin
          .from('client_portal_users')
          .select('*')
          .eq('email', client.email)
          .eq('client_id', client.id)
          .single();

        if (portalUserError && portalUserError.code === 'PGRST116') {
          // Create client portal user if doesn't exist
          const { error: createError } = await supabaseAdmin
            .from('client_portal_users')
            .insert({
              client_id: client.id,
              email: client.email,
              is_active: true
            });

          if (createError) {
            console.error('Error creating client portal user:', createError);
          } else {
            console.log('Created client portal user for:', client.email);
          }
        }

        // Generate login token
        const { data: tokenData, error: tokenError } = await supabaseAdmin.rpc('generate_client_login_token', {
          p_email: client.email
        });
        
        if (tokenData && !tokenError) {
          // Use the custom domain for client portal
          const portalDomain = 'https://hub.fixlify.app';
          portalLink = `${portalDomain}/portal/login?token=${tokenData}&jobId=${job.id}`;
          
          // Create SMS message with portal link
          smsMessage = `Hi ${client?.name || 'Customer'}! Your estimate #${estimate.estimate_number} is ready ($${estimate.total?.toFixed(2) || '0.00'}). View and manage it here: ${portalLink}`;
          
          console.log('Generated portal link:', portalLink.substring(0, 50) + '...');
        } else {
          console.error('Failed to generate portal login token:', tokenError);
          // Fallback message without portal link
          smsMessage = `Hi ${client?.name || 'Customer'}! Your estimate #${estimate.estimate_number} is ready. Total: $${estimate.total?.toFixed(2) || '0.00'}. Please contact us for details.`;
        }
      } catch (error) {
        console.error('Error generating portal link:', error);
        // Fallback message without portal link
        smsMessage = `Hi ${client?.name || 'Customer'}! Your estimate #${estimate.estimate_number} is ready. Total: $${estimate.total?.toFixed(2) || '0.00'}. Please contact us for details.`;
      }
    } else {
      // No email available, use simple message
      smsMessage = `Hi ${client?.name || 'Customer'}! Your estimate #${estimate.estimate_number} is ready. Total: $${estimate.total?.toFixed(2) || '0.00'}. Please contact us for details.`;
    }

    // Use custom message if provided, otherwise use generated message
    if (!message) {
      // Use our generated message with portal link
    } else {
      // If custom message provided, append portal link if available
      if (portalLink) {
        smsMessage = `${message} View details: ${portalLink}`;
      } else {
        smsMessage = message;
      }
    }

    console.log('Sending SMS from:', formattedFromPhone, 'to:', formattedToPhone);
    console.log('SMS content:', smsMessage.substring(0, 100) + '...');

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

    // Log SMS communication with portal link info
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

      // Also create a client notification
      if (client?.id) {
        await supabaseAdmin
          .from('client_notifications')
          .insert({
            client_id: client.id,
            type: 'estimate_sent',
            title: 'New Estimate Available',
            message: `Estimate ${estimate.estimate_number} has been sent to you. Total: $${estimate.total?.toFixed(2) || '0.00'}`,
            data: { 
              estimate_id: estimateId, 
              estimate_number: estimate.estimate_number,
              portal_link: portalLink,
              job_id: job.id
            }
          });
      }
    } catch (logError) {
      console.error('Failed to log SMS communication:', logError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'SMS sent successfully',
        messageId: result.data?.id,
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
