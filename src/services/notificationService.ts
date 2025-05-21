
import { sendSmsNotification } from '@/services/edgeSmsService';
import { PaymentMethod } from '@/types/payment';

/**
 * Send payment confirmation SMS to client
 * @param phoneNumber - Client's phone number
 * @param amount - Payment amount
 * @param method - Payment method
 * @param jobId - Job ID
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
    return await sendSmsNotification('payment', phoneNumber, {
      amount,
      method,
      jobId,
      reference
    });
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
    return await sendSmsNotification('refund', phoneNumber, {
      amount,
      jobId
    });
  } catch (error) {
    console.error('Failed to send refund SMS notification:', error);
    throw error;
  }
};

/**
 * Send invoice notification SMS to client
 * @param phoneNumber - Client's phone number
 * @param invoiceNumber - Invoice number
 * @param amount - Invoice amount
 * @param jobId - Job ID
 * @param dueDate - Due date (optional)
 */
export const sendInvoiceNotificationSMS = async (
  phoneNumber: string,
  invoiceNumber: string,
  amount: number,
  jobId: string,
  dueDate?: string
) => {
  try {
    return await sendSmsNotification('invoice', phoneNumber, {
      invoiceNumber,
      amount,
      jobId,
      dueDate
    });
  } catch (error) {
    console.error('Failed to send invoice SMS notification:', error);
    throw error;
  }
};

/**
 * Send estimate notification SMS to client
 * @param phoneNumber - Client's phone number
 * @param estimateNumber - Estimate number
 * @param amount - Estimate amount
 * @param jobId - Job ID
 */
export const sendEstimateNotificationSMS = async (
  phoneNumber: string,
  estimateNumber: string,
  amount: number,
  jobId: string
) => {
  try {
    return await sendSmsNotification('estimate', phoneNumber, {
      estimateNumber,
      amount,
      jobId
    });
  } catch (error) {
    console.error('Failed to send estimate SMS notification:', error);
    throw error;
  }
};

/**
 * Send client message SMS
 * @param phoneNumber - Client's phone number
 * @param message - Message content
 * @param jobId - Job ID (optional)
 */
export const sendClientMessageSMS = async (
  phoneNumber: string,
  message: string,
  jobId?: string
) => {
  try {
    return await sendSmsNotification('message', phoneNumber, {
      message,
      jobId
    });
  } catch (error) {
    console.error('Failed to send client message SMS:', error);
    throw error;
  }
};
