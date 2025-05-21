
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import notificationapi from "npm:notificationapi-node-server-sdk";

// Initialize NotificationAPI with credentials
const clientId = Deno.env.get("NOTIFICATION_API_CLIENT_ID") || "3tisis9bog6dutu8lmkq4zbosq";
const clientSecret = Deno.env.get("NOTIFICATION_API_CLIENT_SECRET") || "dujef4sag9zj997zy85hc95sgqmdg2db6xkwcij1ya2zjstmguihno4u4n";

notificationapi.init(
  clientId,
  clientSecret
);

// Set up CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  type: string;
  phoneNumber: string;
  data: Record<string, any>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const { type, phoneNumber, data } = await req.json() as NotificationRequest;
    
    let message = '';
    let notificationType = '';

    // Determine message content based on notification type
    switch (type) {
      case 'invoice':
        notificationType = 'invoice_notification';
        message = `Invoice #${data.invoiceNumber} for $${data.amount.toFixed(2)} has been created for Job #${data.jobId}.`;
        if (data.dueDate) {
          message += ` Payment is due by ${data.dueDate}.`;
        }
        message += " Thank you for your business.";
        break;
      
      case 'estimate':
        notificationType = 'estimate_notification';
        message = `Estimate #${data.estimateNumber} for $${data.amount.toFixed(2)} has been created for Job #${data.jobId}. Please review it at your convenience.`;
        break;
      
      case 'message':
        notificationType = 'client_message';
        message = data.message;
        if (data.jobId) {
          message = `(Job #${data.jobId}) ${message}`;
        }
        break;
      
      case 'payment':
        notificationType = 'payment_confirmation';
        // Format payment method
        const formattedMethod = data.method.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
        message = `Thank you for your payment of $${data.amount.toFixed(2)} via ${formattedMethod}`;
        if (data.reference) {
          message += ` (Ref: ${data.reference})`;
        }
        message += ` for Job #${data.jobId}. Your payment has been received successfully.`;
        break;
      
      case 'refund':
        notificationType = 'refund_confirmation';
        message = `A refund of $${data.amount.toFixed(2)} has been processed for Job #${data.jobId}. The refund should appear in your account within 3-5 business days.`;
        break;
      
      case 'appointment':
        notificationType = 'appointment_reminder';
        message = `Reminder: Your appointment for Job #${data.jobId} is scheduled for ${data.appointmentDate} at ${data.appointmentTime}.`;
        if (data.technician) {
          message += ` ${data.technician} will be your technician.`;
        }
        break;
      
      case 'custom':
        notificationType = 'custom_notification';
        message = data.message;
        break;
      
      default:
        throw new Error('Invalid notification type');
    }

    // Send the notification
    const response = await notificationapi.send({
      type: notificationType,
      to: {
        number: phoneNumber
      },
      sms: {
        message: message
      }
    });

    console.log('Notification sent successfully:', response);

    return new Response(
      JSON.stringify({ success: true, message: 'Notification sent successfully' }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error sending notification:', error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
