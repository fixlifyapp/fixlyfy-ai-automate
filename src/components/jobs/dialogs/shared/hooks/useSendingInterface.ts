
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
  sendDocument: (params: SendDocumentParams) => Promise<{ success: boolean; error?: string }>;
  isProcessing: boolean;
}

export const useEstimateSendingInterface = (): SendingHookReturn => {
  const { sendDocument, isProcessing } = useEstimateSending();
  
  return {
    sendDocument: async (params: SendDocumentParams) => {
      // Transform params to match estimate sending interface
      const estimateParams = {
        sendMethod: params.sendMethod,
        sendTo: params.sendTo,
        documentNumber: params.documentNumber,
        documentDetails: {
          estimate_number: params.documentNumber,
          ...params.documentDetails
        },
        lineItems: params.lineItems,
        contactInfo: params.contactInfo,
        customNote: params.customNote,
        jobId: params.jobId,
        existingDocumentId: params.existingDocumentId,
        onSave: params.onSave || (() => Promise.resolve(true))
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
        sendMethod: params.sendMethod,
        sendTo: params.sendTo,
        documentNumber: params.documentNumber,
        documentDetails: {
          invoice_number: params.documentNumber,
          ...params.documentDetails
        },
        lineItems: params.lineItems,
        contactInfo: params.contactInfo,
        customNote: params.customNote,
        jobId: params.jobId,
        existingDocumentId: params.existingDocumentId,
        onSave: params.onSave || (() => Promise.resolve(true))
      };
      return await sendDocument(invoiceParams);
    },
    isProcessing
  };
};
