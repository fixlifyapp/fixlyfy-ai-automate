
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
    console.log('send-invoice - Email request received');
    
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

    console.log('send-invoice - Authenticated user ID:', userData.user.id);

    const requestBody = await req.json()
    const { invoiceId, sendMethod, recipientEmail, recipientPhone } = requestBody;
    
    console.log('send-invoice - Request details:', {
      invoiceId,
      sendMethod,
      recipientEmail,
      recipientPhone
    });

    if (!invoiceId || !sendMethod) {
      throw new Error('Missing required fields');
    }

    // Get invoice details
    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from('invoices')
      .select(`
        *,
        jobs:job_id (
          id,
          title,
          client_id,
          clients:client_id (
            id,
            name,
            email,
            phone,
            company
          )
        )
      `)
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoice) {
      console.error('Invoice not found:', invoiceError);
      throw new Error('Invoice not found');
    }

    console.log('send-invoice - Found invoice:', invoice.invoice_number);

    const client = invoice.jobs?.clients;

    // Get company settings for email configuration
    const { data: companySettings, error: settingsError } = await supabaseAdmin
      .from('company_settings')
      .select('*')
      .eq('user_id', userData.user.id)
      .single();

    console.log('send-invoice - Company settings found:', !!companySettings);
    
    if (settingsError) {
      console.warn('send-invoice - Settings error:', settingsError);
    }

    const companyName = companySettings?.company_name || 'our company';
    console.log('send-invoice - Company name from database:', companyName);

    // Generate client portal login token
    let portalLoginLink = '';
    if (client?.email) {
      console.log('send-invoice - Generating portal login token for:', client.email);
      try {
        const { data: tokenData, error: tokenError } = await supabaseAdmin.rpc('generate_client_login_token', {
          p_email: client.email
        });

        if (tokenError) {
          console.error('send-invoice - Failed to generate portal token:', tokenError);
        } else if (tokenData) {
          portalLoginLink = `https://hub.fixlify.app/portal/login?token=${tokenData}`;
          console.log('send-invoice - Portal login link generated');
        }
      } catch (error) {
        console.error('send-invoice - Portal token generation error:', error);
      }
    }

    // Send email via Mailgun
    const mailgunDomain = companySettings?.mailgun_domain || Deno.env.get('MAILGUN_DOMAIN') || 'fixlify.app';
    const mailgunApiKey = companySettings?.mailgun_settings?.api_key || Deno.env.get('MAILGUN_API_KEY');
    const fromName = companySettings?.email_from_name || companyName;
    const fromEmail = companySettings?.email_from_address || `${companyName.toLowerCase().replace(/\s+/g, '')}@${mailgunDomain}`;

    console.log('send-invoice - Final email configuration:');
    console.log('send-invoice - User ID:', userData.user.id);
    console.log('send-invoice - Company name used:', companyName);
    console.log('send-invoice - Mailgun domain:', mailgunDomain);
    console.log('send-invoice - From email:', fromEmail);

    if (!mailgunApiKey) {
      throw new Error('Mailgun API key not configured');
    }

    const emailSubject = `Invoice ${invoice.invoice_number}`;
    const recipient = recipientEmail || client?.email;

    if (!recipient) {
      throw new Error('No recipient email provided');
    }

    console.log('send-invoice - Subject:', emailSubject);
    console.log('send-invoice - From:', `${fromName} <${fromEmail}>`);
    console.log('send-invoice - To:', recipient);

    // Get line items for the invoice
    const { data: lineItems } = await supabaseAdmin
      .from('line_items')
      .select('*')
      .eq('parent_id', invoiceId)
      .eq('parent_type', 'invoice');

    const emailContent = `
      <h2>Invoice ${invoice.invoice_number}</h2>
      <p>Hi ${client?.name || 'valued customer'},</p>
      <p>Please find your invoice details below:</p>
      
      <div style="margin: 20px 0; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
        <h3>Invoice Summary</h3>
        <p><strong>Invoice Number:</strong> ${invoice.invoice_number}</p>
        <p><strong>Total Amount:</strong> $${invoice.total?.toFixed(2) || '0.00'}</p>
        
        ${lineItems && lineItems.length > 0 ? `
        <h4>Items:</h4>
        <ul>
          ${lineItems.map(item => 
            `<li>${item.description} - Qty: ${item.quantity} × $${item.unit_price?.toFixed(2)} = $${(item.quantity * item.unit_price)?.toFixed(2)}</li>`
          ).join('')}
        </ul>
        ` : ''}
        
        ${invoice.notes ? `<p><strong>Notes:</strong> ${invoice.notes}</p>` : ''}
      </div>

      <p><a href="https://hub.fixlify.app/invoice/view/${invoice.invoice_number}" style="background-color: #007cba; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Invoice</a></p>
      
      ${portalLoginLink ? `<p><a href="${portalLoginLink}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Access Client Portal</a></p>` : ''}
      
      <p>Thank you for your business!</p>
      <p>Best regards,<br>${companyName}</p>
    `;

    console.log('send-invoice - Sending email via Mailgun URL:', `https://api.mailgun.net/v3/${mailgunDomain}/messages`);

    const formData = new FormData();
    formData.append('from', `${fromName} <${fromEmail}>`);
    formData.append('to', recipient);
    formData.append('subject', emailSubject);
    formData.append('html', emailContent);

    const response = await fetch(`https://api.mailgun.net/v3/${mailgunDomain}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`api:${mailgunApiKey}`)}`
      },
      body: formData
    });

    console.log('send-invoice - Email send response status:', response.status);

    const responseBody = await response.json();
    console.log('send-invoice - Email send response body:', responseBody);

    if (!response.ok) {
      console.error('send-invoice - Mailgun error:', responseBody);
      throw new Error(`Failed to send email: ${response.status} - ${responseBody.message || 'Unknown error'}`);
    }

    console.log('send-invoice - Email sent successfully via Mailgun:', responseBody);

    // Log the communication
    try {
      await supabaseAdmin
        .from('invoice_communications')
        .insert({
          invoice_id: invoiceId,
          communication_type: 'email',
          recipient: recipient,
          subject: emailSubject,
          content: emailContent,
          status: 'sent',
          provider_message_id: responseBody.id,
          invoice_number: invoice.invoice_number,
          client_name: client?.name,
          client_email: client?.email,
          client_phone: client?.phone
        });
    } catch (logError) {
      console.warn('Failed to log communication:', logError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        messageId: responseBody.id,
        portalLinkIncluded: !!portalLoginLink
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('send-invoice - Error:', error);
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
