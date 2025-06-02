
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendEstimateRequest {
  estimateId: string;
  recipientEmail: string;
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

    const { estimateId, recipientEmail, message, subject }: SendEstimateRequest = await req.json();

    // Get estimate details
    const { data: estimate, error: estimateError } = await supabaseClient
      .from('estimates')
      .select(`
        *,
        jobs:job_id(
          title,
          clients:client_id(name, email)
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

    // Create email content
    const emailSubject = subject || `Estimate ${estimate.estimate_number} from ${companyName}`;
    const emailHtml = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb;">Estimate from ${companyName}</h2>
            <p>Dear ${clientName},</p>
            <p>Please find your estimate attached below:</p>
            
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

    // Call the send-email function
    const { data: emailResult, error: emailError } = await supabaseClient.functions.invoke('send-email', {
      body: {
        to: recipientEmail,
        subject: emailSubject,
        html: emailHtml,
        text: `Estimate ${estimate.estimate_number} from ${companyName}\n\nTotal: $${estimate.total}\n\n${message || ''}`,
        companyId: userData.user.id,
        conversationId: estimateId
      }
    });

    if (emailError) {
      throw emailError;
    }

    // Update estimate status and log communication
    await supabaseClient
      .from('estimates')
      .update({ 
        status: 'sent'
      })
      .eq('id', estimateId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Estimate sent successfully',
        messageId: emailResult.messageId
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
