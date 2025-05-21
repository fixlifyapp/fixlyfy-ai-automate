
import notificationapi from 'notificationapi-node-server-sdk';
import { PaymentMethod } from '@/types/payment';

// Initialize the NotificationAPI client
notificationapi.init(
  '3tisis9bog6dutu8lmkq4zbosq',
  'dujef4sag9zj997zy85hc95sgqmdg2db6xkwcij1ya2zjstmguihno4u4n'
);

/**
 * Send payment confirmation SMS to client
 * @param phoneNumber - Client's phone number
 * @param amount - Payment amount
 * @param method - Payment method
 * @param reference - Payment reference (optional)
 */
export const sendPaymentConfirmationSMS = async (
  phoneNumber: string,
  amount: number,
  method: PaymentMethod,
  jobId: string,
  reference?: string,
) => {
  try {
    // Format payment method to be more readable
    const formattedMethod = method.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    // Create a human-readable message
    const message = `Thank you for your payment of $${amount.toFixed(2)} via ${formattedMethod}${reference ? ` (Ref: ${reference})` : ''} for Job #${jobId}. Your payment has been received successfully.`;
    
    // Send the SMS notification
    const response = await notificationapi.send({
      type: 'payment_confirmation',
      to: {
        number: phoneNumber
      },
      sms: {
        message: message
      }
    });
    
    return response;
  } catch (error) {
    console.error('Failed to send SMS notification:', error);
    throw error;
  }
};

/**
 * Send refund confirmation SMS to client
 * @param phoneNumber - Client's phone number
 * @param amount - Refund amount
 * @param jobId - Job ID
 */
export const sendRefundConfirmationSMS = async (
  phoneNumber: string,
  amount: number,
  jobId: string
) => {
  try {
    const message = `A refund of $${amount.toFixed(2)} has been processed for Job #${jobId}. The refund should appear in your account within 3-5 business days.`;
    
    const response = await notificationapi.send({
      type: 'refund_confirmation',
      to: {
        number: phoneNumber
      },
      sms: {
        message: message
      }
    });
    
    return response;
  } catch (error) {
    console.error('Failed to send refund SMS notification:', error);
    throw error;
  }
};
