
import { useState } from 'react';

export interface SendingHookProps {
  documentId: string;
  documentNumber: string;
  documentType: 'estimate' | 'invoice';
  total: number;
  contactInfo: {
    name: string;
    email?: string;
    phone?: string;
  };
  onSuccess: () => void;
}

export const useEstimateSendingInterface = ({
  documentId,
  documentNumber,
  documentType,
  total,
  contactInfo,
  onSuccess
}: SendingHookProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const sendDocument = async (method: 'email' | 'sms', recipient: string, message: string) => {
    setIsProcessing(true);
    try {
      // Mock sending functionality
      console.log('Sending document:', {
        documentId,
        documentNumber,
        documentType,
        method,
        recipient,
        message,
        total,
        contactInfo
      });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      onSuccess();
      return { success: true };
    } catch (error) {
      console.error('Error sending document:', error);
      return { success: false, error: 'Failed to send document' };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    sendDocument,
    isProcessing
  };
};

export const useInvoiceSendingInterface = useEstimateSendingInterface;
