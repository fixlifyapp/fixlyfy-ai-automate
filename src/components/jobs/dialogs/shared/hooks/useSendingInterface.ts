
import { useEstimateSending } from "../../../dialogs/estimate-builder/hooks/useEstimateSending";
import { useInvoiceSending } from "./useInvoiceSending";

export interface SendDocumentParams {
  sendMethod: "email" | "sms";
  sendTo: string;
  documentNumber: string;
  documentDetails: Record<string, any>;
  lineItems: any[];
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
  customNote: string;
  jobId: string;
  existingDocumentId?: string;
  onSave?: () => Promise<boolean>;
}

export interface SendingHookReturn {
  sendDocument: (params: SendDocumentParams) => Promise<{ success: boolean }>;
  isProcessing: boolean;
}

export const useEstimateSendingInterface = (): SendingHookReturn => {
  const { sendDocument, isProcessing } = useEstimateSending();
  
  return {
    sendDocument: async (params: SendDocumentParams) => {
      // Transform params to match estimate sending interface
      const estimateParams = {
        ...params,
        documentDetails: {
          estimate_number: params.documentNumber,
          ...params.documentDetails
        }
      };
      return await sendDocument(estimateParams);
    },
    isProcessing
  };
};

export const useInvoiceSendingInterface = (): SendingHookReturn => {
  const { sendDocument, isProcessing } = useInvoiceSending();
  
  return {
    sendDocument: async (params: SendDocumentParams) => {
      // Transform params to match invoice sending interface
      const invoiceParams = {
        ...params,
        documentDetails: {
          invoice_number: params.documentNumber,
          ...params.documentDetails
        }
      };
      return await sendDocument(invoiceParams);
    },
    isProcessing
  };
};
