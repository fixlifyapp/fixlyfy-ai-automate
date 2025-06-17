
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
    console.log('📱 SMS Invoice request received');
    
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
    
    const { invoiceId, recipientPhone, message } = requestBody;

    if (!invoiceId || !recipientPhone) {
      throw new Error('Missing required fields: invoiceId and recipientPhone');
    }

    console.log('Processing SMS for invoice:', invoiceId, 'to phone:', recipientPhone);

    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoice) {
      throw new Error('Invoice not found');
    }

    console.log('Invoice found:', invoice.invoice_number);
    
    const { data: job, error: jobError } = await supabaseAdmin
      .from('jobs')
      .select('*')
      .eq('id', invoice.job_id)
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

    // Generate portal link - prioritize job portal for direct access
    let viewLink = '';
    if (job?.id) {
      viewLink = `https://hub.fixlify.app/client/${job.id}`;
      console.log('Direct job portal link generated:', viewLink);
    } else if (client?.id) {
      viewLink = `https://hub.fixlify.app/portal/${client.id}`;
      console.log('Enhanced portal link generated:', viewLink);
    }

    // Create SMS message with portal link
    const amountDue = (invoice.total || 0) - (invoice.amount_paid || 0);
    
    let smsMessage;
    if (message) {
      smsMessage = message;
      // Add portal link to custom message if not already included
      if (viewLink && !message.includes('hub.fixlify.app')) {
        smsMessage = `${message}\n\nView & pay: ${viewLink}`;
      }
    } else {
      if (viewLink) {
        smsMessage = `Hi ${client?.name || 'valued customer'}! Your invoice ${invoice.invoice_number} from ${companyName} is ready. Amount Due: $${amountDue.toFixed(2)}. View & pay: ${viewLink}`;
      } else {
        smsMessage = `Hi ${client?.name || 'valued customer'}! Your invoice ${invoice.invoice_number} from ${companyName} is ready. Amount Due: $${amountDue.toFixed(2)}. Contact us for payment.`;
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
        .from('invoice_communications')
        .insert({
          invoice_id: invoiceId,
          communication_type: 'sms',
          recipient: formattedToPhone,
          content: smsMessage,
          status: 'sent',
          provider_message_id: telnyxResult.data?.id,
          invoice_number: invoice.invoice_number,
          client_name: client?.name,
          client_email: client?.email,
          client_phone: client?.phone,
          portal_link_included: !!viewLink
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
        secureViewLinkIncluded: !!viewLink,
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
