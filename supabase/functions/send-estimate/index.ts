
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendEstimateRequest {
  estimateId: string;
  recipientEmail?: string;
  recipientPhone?: string;
  sendMethod: 'email' | 'sms';
  message?: string;
  subject?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 401,
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) {
      return new Response(JSON.stringify({ error: 'Authentication failed' }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 401,
      });
    }

    const { estimateId, recipientEmail, recipientPhone, sendMethod, message, subject }: SendEstimateRequest = await req.json();

    // Get estimate details
    const { data: estimate, error: estimateError } = await supabaseClient
      .from('estimates')
      .select(`
        *,
        jobs:job_id(
          title,
          clients:client_id(name, email, phone)
        )
      `)
      .eq('id', estimateId)
      .single();

    if (estimateError || !estimate) {
      return new Response(JSON.stringify({ error: 'Estimate not found' }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 404,
      });
    }

    // Get company settings
    const { data: companySettings } = await supabaseClient
      .from('company_settings')
      .select('company_name, custom_domain_name')
      .eq('user_id', userData.user.id)
      .single();

    const companyName = companySettings?.company_name || 'Your Company';
    const clientName = estimate.jobs?.clients?.name || 'Valued Customer';

    let result;

    if (sendMethod === 'email') {
      const recipient = recipientEmail || estimate.jobs?.clients?.email;
      if (!recipient) {
        throw new Error('No email address provided');
      }

      // Use Mailgun directly for email sending
      const mailgunApiKey = Deno.env.get('MAILGUN_API_KEY');
      const mailgunDomain = 'fixlify.app';
      
      if (!mailgunApiKey) {
        throw new Error('Mailgun API key not configured');
      }

      const emailSubject = subject || `Estimate ${estimate.estimate_number} from ${companyName}`;
      const emailHtml = `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #2563eb;">Estimate from ${companyName}</h2>
              <p>Dear ${clientName},</p>
              <p>Please find your estimate details below:</p>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin: 0 0 10px 0;">Estimate #${estimate.estimate_number}</h3>
                <p><strong>Job:</strong> ${estimate.jobs?.title || 'Service Request'}</p>
                <p><strong>Total Amount:</strong> $${estimate.total}</p>
              </div>
              
              ${message ? `<p><strong>Message:</strong><br>${message}</p>` : ''}
              
              <p>If you have any questions, please don't hesitate to contact us.</p>
              <p>Best regards,<br>${companyName}</p>
            </div>
          </body>
        </html>
      `;

      const formData = new FormData();
      formData.append('from', `${companyName} <support@${mailgunDomain}>`);
      formData.append('to', recipient);
      formData.append('subject', emailSubject);
      formData.append('html', emailHtml);

      const mailgunResponse = await fetch(`https://api.mailgun.net/v3/${mailgunDomain}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`api:${mailgunApiKey}`)}`
        },
        body: formData
      });

      if (!mailgunResponse.ok) {
        const errorText = await mailgunResponse.text();
        throw new Error(`Mailgun error: ${errorText}`);
      }

      result = await mailgunResponse.json();
    } else {
      // SMS sending
      const recipient = recipientPhone || estimate.jobs?.clients?.phone;
      if (!recipient) {
        throw new Error('No phone number provided');
      }

      const smsContent = `Hi ${clientName}! Your estimate ${estimate.estimate_number} is ready. Total: $${estimate.total}. ${message || ''}`;
      
      const { data: smsData, error: smsError } = await supabaseClient.functions.invoke('telnyx-sms', {
        body: {
          to: recipient,
          body: smsContent,
          client_id: estimate.jobs?.clients?.id,
          job_id: estimate.job_id
        }
      });

      if (smsError || !smsData?.success) {
        throw new Error(`SMS sending failed: ${smsError?.message || smsData?.error || 'Unknown error'}`);
      }

      result = smsData;
    }

    // Update estimate status
    await supabaseClient
      .from('estimates')
      .update({ status: 'sent' })
      .eq('id', estimateId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Estimate sent successfully',
        messageId: result.id || result.message_id
      }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error) {
    console.error('Error in send-estimate function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to send estimate' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});
