
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
    console.log('send-estimate - Email request received');
    
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

    console.log('send-estimate - Authenticated user ID:', userData.user.id);

    const requestBody = await req.json()
    const { estimateId, recipientEmail, subject, message } = requestBody;
    
    console.log('send-estimate - Request details:', {
      estimateId,
      recipientEmail,
      subject,
      message
    });

    if (!estimateId || !recipientEmail) {
      throw new Error('Missing required fields');
    }

    // Get estimate details
    const { data: estimate, error: estimateError } = await supabaseAdmin
      .from('estimates')
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
      .eq('id', estimateId)
      .single();

    if (estimateError || !estimate) {
      console.error('Estimate not found:', estimateError);
      throw new Error('Estimate not found');
    }

    console.log('send-estimate - Found estimate:', estimate.estimate_number);

    const client = estimate.jobs?.clients;

    // Get company settings for email configuration
    const { data: companySettings, error: settingsError } = await supabaseAdmin
      .from('company_settings')
      .select('*')
      .eq('user_id', userData.user.id)
      .single();

    console.log('send-estimate - Company settings found:', !!companySettings);
    
    if (settingsError) {
      console.warn('send-estimate - Settings error:', settingsError);
    }

    const companyName = companySettings?.company_name || 'our company';
    console.log('send-estimate - Company name from database:', companyName);

    // Generate client portal login token
    let portalLoginLink = '';
    if (client?.email) {
      console.log('send-estimate - Generating portal login token for:', client.email);
      try {
        const { data: tokenData, error: tokenError } = await supabaseAdmin.rpc('generate_client_login_token', {
          p_email: client.email
        });

        if (tokenError) {
          console.error('send-estimate - Failed to generate portal token:', tokenError);
        } else if (tokenData) {
          portalLoginLink = `https://hub.fixlify.app/portal/login?token=${tokenData}`;
          console.log('send-estimate - Portal login link generated');
        }
      } catch (error) {
        console.error('send-estimate - Portal token generation error:', error);
      }
    }

    // Send email via Mailgun
    const mailgunDomain = companySettings?.mailgun_domain || Deno.env.get('MAILGUN_DOMAIN') || 'fixlify.app';
    const mailgunApiKey = companySettings?.mailgun_settings?.api_key || Deno.env.get('MAILGUN_API_KEY');
    const fromName = companySettings?.email_from_name || companyName;
    const fromEmail = companySettings?.email_from_address || `${companyName.toLowerCase().replace(/\s+/g, '')}@${mailgunDomain}`;

    if (!mailgunApiKey) {
      throw new Error('Mailgun API key not configured');
    }

    const emailSubject = subject || `Estimate ${estimate.estimate_number}`;
    const recipient = recipientEmail || client?.email;

    if (!recipient) {
      throw new Error('No recipient email provided');
    }

    // Get line items for the estimate
    const { data: lineItems } = await supabaseAdmin
      .from('line_items')
      .select('*')
      .eq('parent_id', estimateId)
      .eq('parent_type', 'estimate');

    const estimateLink = `https://hub.fixlify.app/estimate/view/${estimate.id}`;
    
    const emailContent = `
      <h2>${emailSubject}</h2>
      <p>Hi ${client?.name || 'valued customer'},</p>
      <p>${message || 'Please find your estimate details below:'}</p>
      
      <div style="margin: 20px 0; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
        <h3>Estimate Summary</h3>
        <p><strong>Estimate Number:</strong> ${estimate.estimate_number}</p>
        <p><strong>Total Amount:</strong> $${estimate.total?.toFixed(2) || '0.00'}</p>
        
        ${lineItems && lineItems.length > 0 ? `
        <h4>Items:</h4>
        <ul>
          ${lineItems.map(item => 
            `<li>${item.description} - Qty: ${item.quantity} × $${item.unit_price?.toFixed(2)} = $${(item.quantity * item.unit_price)?.toFixed(2)}</li>`
          ).join('')}
        </ul>
        ` : ''}
        
        ${estimate.notes ? `<p><strong>Notes:</strong> ${estimate.notes}</p>` : ''}
      </div>

      <p><a href="${estimateLink}" style="background-color: #007cba; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Estimate</a></p>
      
      ${portalLoginLink ? `<p><a href="${portalLoginLink}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Access Client Portal</a></p>` : ''}
      
      <p>Thank you for your business!</p>
      <p>Best regards,<br>${companyName}</p>
    `;

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

    const responseBody = await response.json();

    if (!response.ok) {
      console.error('send-estimate - Mailgun error:', responseBody);
      throw new Error(`Failed to send email: ${response.status} - ${responseBody.message || 'Unknown error'}`);
    }

    console.log('send-estimate - Email sent successfully via Mailgun:', responseBody);

    // Log the communication
    try {
      await supabaseAdmin
        .from('estimate_communications')
        .insert({
          estimate_id: estimateId,
          communication_type: 'email',
          recipient: recipient,
          subject: emailSubject,
          content: emailContent,
          status: 'sent',
          external_id: responseBody.id,
          estimate_number: estimate.estimate_number,
          client_name: client?.name,
          client_email: client?.email,
          client_phone: client?.phone,
          portal_link_included: !!portalLoginLink
        });
    } catch (logError) {
      console.warn('Failed to log communication:', logError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        messageId: responseBody.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('send-estimate - Error:', error);
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
