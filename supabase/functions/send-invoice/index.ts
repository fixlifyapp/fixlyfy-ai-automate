
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
    console.log('📧 Email Invoice request received');
    
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

    const requestBody = await req.json()
    console.log('Request body:', requestBody);
    
    const { invoiceId, recipientEmail, customMessage } = requestBody;

    if (!invoiceId || !recipientEmail) {
      throw new Error('Missing required fields: invoiceId and recipientEmail');
    }

    console.log('Processing email for invoice:', invoiceId, 'to email:', recipientEmail);

    // Get invoice details with proper join
    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from('invoices')
      .select(`
        *,
        jobs!inner(
          *,
          clients(*)
        )
      `)
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoice) {
      console.error('Invoice lookup error:', invoiceError);
      throw new Error('Invoice not found');
    }

    console.log('Invoice found:', invoice.invoice_number);
    
    const job = invoice.jobs;
    const client = job?.clients;

    // Generate client portal login token and create portal link
    let portalLink = '';
    if (client?.email) {
      try {
        const { data: tokenData, error: tokenError } = await supabaseAdmin.rpc('generate_client_login_token', {
          p_email: client.email
        });

        if (!tokenError && tokenData) {
          portalLink = `https://hub.fixlify.app/portal/login?token=${tokenData}`;
          console.log('Portal link generated');
        }
      } catch (error) {
        console.warn('Failed to generate portal login token:', error);
      }
    }

    // Create invoice link
    const invoiceLink = `https://hub.fixlify.app/invoice/view/${invoice.id}`;

    // Prepare email content
    const subject = customMessage 
      ? `Invoice ${invoice.invoice_number} from ${job?.title || 'Your Service Provider'}`
      : `Your Invoice ${invoice.invoice_number} is Ready`;

    const emailBody = customMessage || `
      Hi ${client?.name || 'valued customer'},
      
      Your invoice ${invoice.invoice_number} is ready for payment.
      
      Total: $${invoice.total?.toFixed(2) || '0.00'}
      Amount Due: $${((invoice.total || 0) - (invoice.amount_paid || 0)).toFixed(2)}
      
      View your invoice: ${invoiceLink}
      ${portalLink ? `\nClient Portal: ${portalLink}` : ''}
      
      Thank you for your business!
    `;

    // Here you would integrate with your email service (Mailgun, SendGrid, etc.)
    // For now, we'll simulate sending and log the communication
    console.log('Email would be sent with subject:', subject);
    console.log('Email body:', emailBody);

    // Log email communication
    try {
      await supabaseAdmin
        .from('invoice_communications')
        .insert({
          invoice_id: invoiceId,
          communication_type: 'email',
          recipient: recipientEmail,
          subject: subject,
          content: emailBody,
          status: 'sent',
          invoice_number: invoice.invoice_number,
          client_name: client?.name,
          client_email: client?.email,
          client_phone: client?.phone,
          portal_link_included: !!portalLink
        });
    } catch (logError) {
      console.warn('Failed to log communication:', logError);
    }

    console.log('Email sent successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        portalLinkIncluded: !!portalLink
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error sending email:', error);
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
