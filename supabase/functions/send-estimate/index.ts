
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');
const sendGridApiKey = Deno.env.get('SENDGRID_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendEstimateRequest {
  method: 'email' | 'sms';
  recipient: string;
  estimateNumber: string;
  estimateData: {
    lineItems: any[];
    total: number;
    taxRate: number;
    notes?: string;
  };
  clientName?: string;
  communicationId?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      method, 
      recipient, 
      estimateNumber, 
      estimateData, 
      clientName,
      communicationId 
    }: SendEstimateRequest = await req.json();

    console.log(`Sending estimate ${estimateNumber} via ${method} to ${recipient}`);

    // Create Supabase client for database operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let result;

    if (method === 'sms') {
      // Send via Twilio SMS
      if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
        throw new Error('Missing Twilio credentials');
      }

      const formattedTo = recipient.startsWith('+') ? recipient : `+1${recipient.replace(/\D/g, '')}`;
      
      const message = `Hi ${clientName || 'there'}! Your estimate ${estimateNumber} is ready. Total: $${estimateData.total.toFixed(2)}. Please review and let us know if you have any questions.`;

      const twilioResponse = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
          },
          body: new URLSearchParams({
            To: formattedTo,
            From: twilioPhoneNumber,
            Body: message,
          }).toString(),
        }
      );

      const twilioData = await twilioResponse.json();

      if (!twilioResponse.ok) {
        throw new Error(`Twilio API error: ${JSON.stringify(twilioData)}`);
      }

      console.log('SMS sent successfully:', twilioData.sid);

      // Update communication record
      if (communicationId) {
        await supabase
          .from('estimate_communications')
          .update({
            status: 'delivered',
            delivered_at: new Date().toISOString(),
            provider_message_id: twilioData.sid
          })
          .eq('id', communicationId);
      }

      result = {
        success: true,
        message: 'Estimate sent via SMS successfully',
        sid: twilioData.sid,
      };

    } else if (method === 'email') {
      // Send via SendGrid
      if (!sendGridApiKey) {
        throw new Error('Missing SendGrid API key');
      }

      // Create estimate HTML content
      const estimateHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Estimate ${estimateNumber}</h2>
          <p>Dear ${clientName || 'Valued Customer'},</p>
          <p>Please find your estimate details below:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background-color: #f5f5f5;">
                <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Description</th>
                <th style="border: 1px solid #ddd; padding: 12px; text-align: right;">Qty</th>
                <th style="border: 1px solid #ddd; padding: 12px; text-align: right;">Price</th>
                <th style="border: 1px solid #ddd; padding: 12px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${estimateData.lineItems.map(item => `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px;">${item.description || item.name}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${item.quantity}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">$${item.unitPrice?.toFixed(2) || '0.00'}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">$${((item.quantity || 0) * (item.unitPrice || 0)).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div style="text-align: right; margin: 20px 0;">
            <p><strong>Subtotal: $${(estimateData.total / (1 + estimateData.taxRate / 100)).toFixed(2)}</strong></p>
            <p><strong>Tax (${estimateData.taxRate}%): $${(estimateData.total - (estimateData.total / (1 + estimateData.taxRate / 100))).toFixed(2)}</strong></p>
            <p style="font-size: 18px;"><strong>Total: $${estimateData.total.toFixed(2)}</strong></p>
          </div>
          
          ${estimateData.notes ? `<div style="margin: 20px 0;"><h3>Notes:</h3><p>${estimateData.notes}</p></div>` : ''}
          
          <p>If you have any questions about this estimate, please don't hesitate to contact us.</p>
          <p>Thank you for your business!</p>
        </div>
      `;

      const sendGridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sendGridApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: recipient }],
              subject: `Estimate ${estimateNumber} - Review Your Quote`,
            },
          ],
          from: {
            email: 'estimates@yourcompany.com',
            name: 'Your Company Name',
          },
          content: [
            {
              type: 'text/html',
              value: estimateHtml,
            },
          ],
        }),
      });

      if (!sendGridResponse.ok) {
        const errorData = await sendGridResponse.text();
        throw new Error(`SendGrid API error: ${errorData}`);
      }

      console.log('Email sent successfully via SendGrid');

      // Update communication record
      if (communicationId) {
        await supabase
          .from('estimate_communications')
          .update({
            status: 'delivered',
            delivered_at: new Date().toISOString()
          })
          .eq('id', communicationId);
      }

      result = {
        success: true,
        message: 'Estimate sent via email successfully',
      };
    } else {
      throw new Error('Invalid send method');
    }

    return new Response(
      JSON.stringify(result),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error('Error in send-estimate function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to send estimate' 
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});
