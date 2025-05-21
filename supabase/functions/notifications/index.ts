
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Set up CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  type: string;
  phoneNumber: string;
  data: Record<string, any>;
  isTest?: boolean;
  message?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    
    // Handle test SMS requests
    if (requestData.isTest && requestData.phoneNumber && requestData.message) {
      console.log(`Twilio SMS would be sent to ${requestData.phoneNumber}: ${requestData.message}`);
      
      // In production, we would use Twilio here
      const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
      const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
      const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');
      
      if (twilioAccountSid && twilioAuthToken && twilioPhoneNumber) {
        try {
          // Create Basic Auth header
          const authHeader = 'Basic ' + btoa(`${twilioAccountSid}:${twilioAuthToken}`);
          
          // Prepare the message data
          const formData = new URLSearchParams();
          formData.append('To', requestData.phoneNumber);
          formData.append('From', twilioPhoneNumber);
          formData.append('Body', requestData.message);
          
          // Send the message via Twilio
          const twilioResponse = await fetch(
            `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
            {
              method: 'POST',
              headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: formData.toString(),
            }
          );
          
          const responseData = await twilioResponse.json();
          
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'SMS sent via Twilio', 
              destination: requestData.phoneNumber,
              twilioResponse: responseData
            }),
            {
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        } catch (twilioError) {
          console.error('Twilio API error:', twilioError);
          // Fall back to simulation if Twilio sending fails
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'Test SMS would be sent (simulation fallback)', 
              destination: requestData.phoneNumber,
              error: twilioError.message
            }),
            {
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }
      } else {
        // Simulate SMS if Twilio credentials aren't available
        return new Response(
          JSON.stringify({ success: true, message: 'Test SMS would be sent (simulation)', destination: requestData.phoneNumber }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }
    
    // Handle regular notification requests
    const { type, phoneNumber, data } = requestData;
    
    let message = '';

    // Determine message content based on notification type
    switch (type) {
      case 'invoice':
        message = `Invoice #${data.invoiceNumber} for $${data.amount.toFixed(2)} has been created for Job #${data.jobId}.`;
        if (data.dueDate) {
          message += ` Payment is due by ${data.dueDate}.`;
        }
        message += " Thank you for your business.";
        break;
      
      case 'estimate':
        message = `Estimate #${data.estimateNumber} for $${data.amount.toFixed(2)} has been created for Job #${data.jobId}. Please review it at your convenience.`;
        break;
      
      case 'message':
        message = data.message;
        if (data.jobId) {
          message = `(Job #${data.jobId}) ${message}`;
        }
        break;
      
      case 'payment':
        // Format payment method
        const formattedMethod = data.method.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
        message = `Thank you for your payment of $${data.amount.toFixed(2)} via ${formattedMethod}`;
        if (data.reference) {
          message += ` (Ref: ${data.reference})`;
        }
        message += ` for Job #${data.jobId}. Your payment has been received successfully.`;
        break;
      
      case 'refund':
        message = `A refund of $${data.amount.toFixed(2)} has been processed for Job #${data.jobId}. The refund should appear in your account within 3-5 business days.`;
        break;
      
      case 'appointment':
        message = `Reminder: Your appointment for Job #${data.jobId} is scheduled for ${data.appointmentDate} at ${data.appointmentTime}.`;
        if (data.technician) {
          message += ` ${data.technician} will be your technician.`;
        }
        break;
      
      case 'custom':
        message = data.message;
        break;

      case 'welcome':
        message = data.message || "Welcome to our service!";
        break;
      
      default:
        throw new Error('Invalid notification type');
    }

    // Try to send via Twilio if credentials are available
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');
    
    if (twilioAccountSid && twilioAuthToken && twilioPhoneNumber) {
      try {
        // Create Basic Auth header
        const authHeader = 'Basic ' + btoa(`${twilioAccountSid}:${twilioAuthToken}`);
        
        // Prepare the message data
        const formData = new URLSearchParams();
        formData.append('To', phoneNumber);
        formData.append('From', twilioPhoneNumber);
        formData.append('Body', message);
        
        // Send the message via Twilio
        const twilioResponse = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
          {
            method: 'POST',
            headers: {
              'Authorization': authHeader,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString(),
          }
        );
        
        const responseData = await twilioResponse.json();
        
        console.log(`Twilio SMS sent to ${phoneNumber}: ${message}`);
        console.log('Twilio response:', responseData);
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'SMS sent via Twilio',
            destination: phoneNumber,
            content: message,
            twilioResponse: responseData
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      } catch (twilioError) {
        console.error('Twilio API error:', twilioError);
        // Fall back to simulation if Twilio sending fails
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'SMS would be sent (simulation fallback)',
            destination: phoneNumber,
            content: message,
            error: twilioError.message
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    } else {
      // Simulation mode (for development/testing)
      console.log(`SMS would be sent to ${phoneNumber}: ${message}`);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'SMS notification would be sent (simulation)',
          destination: phoneNumber,
          content: message 
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error) {
    console.error('Error handling notification:', error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
