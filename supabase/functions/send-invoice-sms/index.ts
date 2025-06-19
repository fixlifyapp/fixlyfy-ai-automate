
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
    
    const { invoiceId, recipientPhone, message, approvalToken } = requestBody;

    if (!invoiceId || !recipientPhone) {
      throw new Error('Missing required fields: invoiceId and recipientPhone');
    }

    console.log('Processing SMS for invoice:', invoiceId, 'to phone:', recipientPhone);

    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from('invoices')
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
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoice) {
      throw new Error('Invoice not found');
    }

    console.log('Invoice found:', invoice.invoice_number);

    const client = invoice.jobs.clients;
    let finalApprovalToken = approvalToken;

    // Generate approval token if not provided
    if (!finalApprovalToken) {
      console.log('🔄 Generating new approval token...');
      
      const { data: tokenData, error: tokenError } = await supabaseAdmin
        .rpc('generate_approval_token', {
          p_document_type: 'invoice',
          p_document_id: invoiceId,
          p_document_number: invoice.invoice_number,
          p_client_id: client.id,
          p_client_name: client.name || '',
          p_client_email: client.email || '',
          p_client_phone: client.phone || ''
        });

      if (tokenError || !tokenData) {
        console.error('❌ Failed to generate approval token:', tokenError);
        throw new Error('Failed to generate approval token');
      }

      finalApprovalToken = tokenData;
      console.log('✅ New approval token generated:', finalApprovalToken);
    }

    const approvalLink = `https://hub.fixlify.app/approve/${finalApprovalToken}`;
    console.log('🔗 Approval link:', approvalLink);

    // Get company settings for branding
    const { data: companySettings } = await supabaseAdmin
      .from('company_settings')
      .select('company_name')
      .eq('user_id', userData.user.id)
      .maybeSingle();

    const companyName = companySettings?.company_name || 'Fixlify Services';

    // Create SMS message with approval link
    const amountDue = (invoice.total || 0) - (invoice.amount_paid || 0);
    
    let smsMessage;
    if (message) {
      smsMessage = message;
      // Add approval link to custom message if not already included
      if (!message.includes('hub.fixlify.app/approve/')) {
        smsMessage = `${message}\n\nReview and pay: ${approvalLink}`;
      }
    } else {
      smsMessage = `Hi ${client.name || 'valued customer'}! Your invoice ${invoice.invoice_number} from ${companyName} is ready. Amount Due: $${amountDue.toFixed(2)}. Review and pay: ${approvalLink}`;
    }

    console.log('SMS message to send:', smsMessage);
    console.log('SMS message length:', smsMessage.length);

    // Use telnyx-sms function for sending
    const { data: smsData, error: smsError } = await supabaseAdmin.functions.invoke('telnyx-sms', {
      body: {
        recipientPhone: recipientPhone,
        message: smsMessage,
        client_id: client.id,
        job_id: invoice.job_id,
        approvalToken: finalApprovalToken
      }
    });

    if (smsError) {
      console.error('❌ Error from telnyx-sms:', smsError);
      throw new Error(smsError.message || 'Failed to send SMS');
    }

    // Log SMS communication
    try {
      await supabaseAdmin
        .from('invoice_communications')
        .insert({
          invoice_id: invoiceId,
          communication_type: 'sms',
          recipient: recipientPhone,
          content: smsMessage,
          status: 'sent',
          provider_message_id: smsData?.messageId,
          invoice_number: invoice.invoice_number,
          client_name: client.name,
          client_email: client.email,
          client_phone: client.phone,
          portal_link_included: true
        });
    } catch (logError) {
      console.warn('Failed to log communication:', logError);
    }

    console.log('SMS sent successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'SMS sent successfully',
        messageId: smsData?.messageId,
        approvalLink: approvalLink,
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
