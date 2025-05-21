
import { supabase } from '@/integrations/supabase/client';

/**
 * Send an SMS notification via the edge function
 * @param type - Notification type
 * @param phoneNumber - Client's phone number
 * @param data - Data for the notification
 */
export const sendSmsNotification = async (
  type: string,
  phoneNumber: string,
  data: Record<string, any>
) => {
  try {
    const { data: response, error } = await supabase.functions.invoke('notifications', {
      body: {
        type,
        phoneNumber,
        data
      }
    });

    if (error) {
      console.error('Error invoking notification edge function:', error);
      throw error;
    }

    return response;
  } catch (error) {
    console.error('Failed to send notification:', error);
    throw error;
  }
};

/**
 * Send a test SMS message
 * @param phoneNumber - Phone number to send test SMS to
 * @param message - Test message content
 */
export const sendTestSms = async (
  phoneNumber: string,
  message: string
) => {
  try {
    // For test SMS, we use the same edge function with different parameters
    const { data: response, error } = await supabase.functions.invoke('notifications', {
      body: {
        isTest: true,
        phoneNumber,
        message
      }
    });

    if (error) {
      console.error('Error invoking test SMS function:', error);
      throw error;
    }

    return response;
  } catch (error) {
    console.error('Failed to send test SMS:', error);
    throw error;
  }
};

/**
 * Send an invoice notification
 */
export const sendInvoiceNotification = async (
  phoneNumber: string,
  invoiceNumber: string,
  amount: number,
  jobId: string,
  dueDate?: string
) => {
  return await sendSmsNotification('invoice', phoneNumber, {
    invoiceNumber,
    amount,
    jobId,
    dueDate
  });
};

/**
 * Send an estimate notification
 */
export const sendEstimateNotification = async (
  phoneNumber: string,
  estimateNumber: string,
  amount: number,
  jobId: string
) => {
  return await sendSmsNotification('estimate', phoneNumber, {
    estimateNumber,
    amount,
    jobId
  });
};

/**
 * Send a client message
 */
export const sendClientMessage = async (
  phoneNumber: string,
  message: string,
  jobId?: string
) => {
  return await sendSmsNotification('message', phoneNumber, {
    message,
    jobId
  });
};

/**
 * Send a custom notification
 */
export const sendCustomNotification = async (
  phoneNumber: string,
  message: string
) => {
  return await sendSmsNotification('custom', phoneNumber, {
    message
  });
};

/**
 * Send a welcome notification directly
 */
export const sendWelcomeMessage = async (
  phoneNumber: string,
  message: string = "Welcome to our service!"
) => {
  return await sendSmsNotification('welcome', phoneNumber, {
    message
  });
};
