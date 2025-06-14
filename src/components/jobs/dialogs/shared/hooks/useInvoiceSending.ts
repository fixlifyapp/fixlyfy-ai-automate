
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SendInvoiceParams {
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

export const useInvoiceSending = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const sendDocument = async (params: SendInvoiceParams) => {
    setIsProcessing(true);
    try {
      console.log("=== INVOICE SENDING ===");
      console.log("Send method:", params.sendMethod);
      console.log("Send to:", params.sendTo);
      console.log("Document number:", params.documentNumber);
      console.log("Existing document ID:", params.existingDocumentId);

      if (!params.existingDocumentId) {
        throw new Error("Invoice ID is required for sending");
      }

      let response;
      
      if (params.sendMethod === "email") {
        console.log("Calling send-invoice function for email...");
        response = await supabase.functions.invoke('send-invoice', {
          body: {
            invoiceId: params.existingDocumentId,
            recipientEmail: params.sendTo,
            subject: `Invoice ${params.documentNumber}`,
            message: params.customNote || `Please find your invoice ${params.documentNumber}. Total: $${params.documentDetails.total?.toFixed(2) || '0.00'}.`
          }
        });
      } else {
        console.log("Calling send-invoice-sms function for SMS...");
        const smsMessage = params.customNote || `Hi ${params.contactInfo.name}! Your invoice ${params.documentNumber} is ready. Total: $${params.documentDetails.total?.toFixed(2) || '0.00'}.`;
        
        response = await supabase.functions.invoke('send-invoice-sms', {
          body: {
            invoiceId: params.existingDocumentId,
            recipientPhone: params.sendTo,
            message: smsMessage
          }
        });
      }

      console.log("Edge function response:", response);

      if (response.error) {
        console.error("Edge function error:", response.error);
        throw new Error(response.error.message || 'Failed to send invoice');
      }

      if (response.data?.success) {
        console.log("Invoice sent successfully");
        return { success: true };
      } else {
        console.error("Edge function returned error:", response.data);
        throw new Error(response.data?.error || 'Unknown error occurred');
      }
    } catch (error: any) {
      console.error("Error in invoice sending:", error);
      return { 
        success: false, 
        error: error.message || 'Failed to send invoice'
      };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    sendDocument,
    isProcessing
  };
};
