
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');
const sendGridApiKey = Deno.env.get('SENDGRID_API_KEY');

console.log("=== EDGE FUNCTION ENVIRONMENT CHECK ===");
console.log("Twilio Account SID:", twilioAccountSid ? "SET" : "MISSING");
console.log("Twilio Auth Token:", twilioAuthToken ? "SET" : "MISSING");
console.log("Twilio Phone Number:", twilioPhoneNumber ? "SET" : "MISSING");
console.log("SendGrid API Key:", sendGridApiKey ? "SET" : "MISSING");

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
    viewUrl?: string;
    portalLoginLink?: string;
  };
  clientName?: string;
  communicationId?: string;
}

const generateEstimateEmailHTML = (estimateNumber: string, clientName: string, estimateData: any) => {
  const { lineItems, total, taxRate, notes, viewUrl, portalLoginLink } = estimateData;
  const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const taxAmount = subtotal * (taxRate / 100);

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Estimate ${estimateNumber}</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .estimate-number { color: #007bff; font-size: 24px; font-weight: bold; }
            .line-items { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .line-items th, .line-items td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            .line-items th { background: #f8f9fa; font-weight: bold; }
            .totals { text-align: right; margin: 20px 0; }
            .total-row { font-weight: bold; font-size: 18px; color: #007bff; }
            .view-button { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .notes { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .portal-section { background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Estimate <span class="estimate-number">${estimateNumber}</span></h1>
            <p>Dear ${clientName},</p>
            <p>Please find your estimate details below. We appreciate the opportunity to serve you!</p>
        </div>

        <table class="line-items">
            <thead>
                <tr>
                    <th>Description</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${lineItems.map(item => `
                    <tr>
                        <td>${item.description}</td>
                        <td>${item.quantity}</td>
                        <td>$${item.unitPrice.toFixed(2)}</td>
                        <td>$${(item.quantity * item.unitPrice).toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="totals">
            <p>Subtotal: $${subtotal.toFixed(2)}</p>
            <p>Tax (${taxRate}%): $${taxAmount.toFixed(2)}</p>
            <p class="total-row">Total: $${total.toFixed(2)}</p>
        </div>

        ${notes ? `<div class="notes"><strong>Notes:</strong><br>${notes}</div>` : ''}

        ${viewUrl ? `<a href="${viewUrl}" class="view-button">View Full Estimate Online</a>` : ''}

        ${portalLoginLink ? `
        <div class="portal-section">
            <h3>🔐 Secure Client Portal Access</h3>
            <p>You can view, approve, or reject this estimate securely through our client portal:</p>
            <a href="${portalLoginLink}" class="view-button" style="background: #28a745;">Access Your Portal</a>
            <p><small>This secure link will log you in automatically and is valid for 30 minutes.</small></p>
        </div>
        ` : ''}

        <p>If you have any questions about this estimate, please don't hesitate to contact us.</p>
        
        <p>Thank you for your business!</p>
    </body>
    </html>
  `;
};

serve(async (req) => {
  console.log("=== ESTIMATE SEND REQUEST RECEIVED ===");
  console.log("Method:", req.method);
  console.log("URL:", req.url);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.text();
    console.log("Raw request body:", requestBody);
    
    const parsedBody = JSON.parse(requestBody);
    console.log("Parsed request body:", parsedBody);

    const { 
      method, 
      recipient, 
      estimateNumber, 
      estimateData, 
      clientName,
      communicationId 
    }: SendEstimateRequest = parsedBody;

    console.log(`Processing request: method=${method}, recipient=${recipient}, estimate=${estimateNumber}`);

    // Create Supabase client for database operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    let result;

    if (method === 'email') {
      console.log("=== PROCESSING EMAIL SEND ===");
      
      if (!sendGridApiKey) {
        throw new Error('SendGrid API key not configured');
      }

      const subject = `Estimate ${estimateNumber} - $${estimateData.total.toFixed(2)}`;
      const html = generateEstimateEmailHTML(estimateNumber, clientName || 'Valued Customer', estimateData);
      
      console.log("Email details:");
      console.log("- To:", recipient);
      console.log("- Subject:", subject);
      console.log("- Has portal link:", !!estimateData.portalLoginLink);

      // Call our send-email function
      const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: recipient,
          subject: subject,
          html: html,
          text: `Your estimate ${estimateNumber} is ready. Total: $${estimateData.total.toFixed(2)}. ${estimateData.viewUrl ? `View online: ${estimateData.viewUrl}` : ''} ${estimateData.portalLoginLink ? `Secure portal access: ${estimateData.portalLoginLink}` : ''}`
        })
      });

      const emailData = await emailResponse.json();
      console.log("Email response:", emailData);

      if (!emailResponse.ok || !emailData.success) {
        console.error("Email sending failed:", emailData);
        throw new Error(`Email sending failed: ${emailData.error || 'Unknown error'}`);
      }

      console.log('Email sent successfully');

      // Update communication record
      if (communicationId) {
        const updateResult = await supabase
          .from('estimate_communications')
          .update({
            status: 'delivered',
            delivered_at: new Date().toISOString()
          })
          .eq('id', communicationId);
        
        console.log("Communication update result:", updateResult);
      }

      result = {
        success: true,
        message: 'Estimate sent via email successfully'
      };

    } else if (method === 'sms') {
      console.log("=== PROCESSING SMS SEND ===");
      
      if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
        console.error("Missing Twilio credentials");
        throw new Error('Missing Twilio credentials');
      }

      const formattedTo = recipient.startsWith('+') ? recipient : `+1${recipient.replace(/\D/g, '')}`;
      
      let message = `Hi ${clientName || 'there'}! Your estimate ${estimateNumber} is ready. Total: $${estimateData.total.toFixed(2)}.`;
      
      if (estimateData.viewUrl) {
        message += ` View estimate: ${estimateData.viewUrl}`;
      }
      
      if (estimateData.portalLoginLink) {
        message += ` Secure portal (approve/reject): ${estimateData.portalLoginLink}`;
      }

      console.log("SMS details:");
      console.log("- To:", formattedTo);
      console.log("- From:", twilioPhoneNumber);
      console.log("- Message length:", message.length);
      console.log("- Has portal link:", !!estimateData.portalLoginLink);

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
      console.log("Twilio response:", twilioData);

      if (!twilioResponse.ok) {
        console.error("Twilio API error:", twilioData);
        throw new Error(`Twilio API error: ${twilioData.message || JSON.stringify(twilioData)}`);
      }

      console.log('SMS sent successfully with SID:', twilioData.sid);

      // Update communication record
      if (communicationId) {
        const updateResult = await supabase
          .from('estimate_communications')
          .update({
            status: 'delivered',
            delivered_at: new Date().toISOString(),
            provider_message_id: twilioData.sid
          })
          .eq('id', communicationId);
        
        console.log("Communication update result:", updateResult);
      }

      result = {
        success: true,
        message: 'Estimate sent via SMS successfully',
        sid: twilioData.sid,
      };
    } else {
      throw new Error('Invalid send method');
    }

    console.log("=== ESTIMATE SEND COMPLETED SUCCESSFULLY ===");
    console.log("Final result:", result);

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
    console.error('=== ERROR IN SEND-ESTIMATE FUNCTION ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
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
