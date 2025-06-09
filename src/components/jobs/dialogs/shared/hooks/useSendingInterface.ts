
import { useState } from 'react';
import { toast } from 'sonner';

export interface SendingInterfaceReturn {
  isSending: boolean;
  sendDocument: (documentId: string, method: 'email' | 'sms', recipient: string) => Promise<boolean>;
}

export const useEstimateSendingInterface = (): SendingInterfaceReturn => {
  const [isSending, setIsSending] = useState(false);

  const sendDocument = async (documentId: string, method: 'email' | 'sms', recipient: string): Promise<boolean> => {
    setIsSending(true);
    try {
      // Mock sending functionality
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success(`Estimate sent via ${method} to ${recipient}`);
      return true;
    } catch (error) {
      toast.error(`Failed to send estimate via ${method}`);
      return false;
    } finally {
      setIsSending(false);
    }
  };

  return { isSending, sendDocument };
};

export const useInvoiceSendingInterface = (): SendingInterfaceReturn => {
  const [isSending, setIsSending] = useState(false);

  const sendDocument = async (documentId: string, method: 'email' | 'sms', recipient: string): Promise<boolean> => {
    setIsSending(true);
    try {
      // Mock sending functionality
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success(`Invoice sent via ${method} to ${recipient}`);
      return true;
    } catch (error) {
      toast.error(`Failed to send invoice via ${method}`);
      return false;
    } finally {
      setIsSending(false);
    }
  };

  return { isSending, sendDocument };
};
