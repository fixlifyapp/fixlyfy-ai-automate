
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SendEstimateParams {
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

export const useEstimateSending = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const sendDocument = async (params: SendEstimateParams) => {
    setIsProcessing(true);
    try {
      console.log("=== ESTIMATE SENDING ===");
      console.log("Send method:", params.sendMethod);
      console.log("Send to:", params.sendTo);
      console.log("Document number:", params.documentNumber);
      console.log("Existing document ID:", params.existingDocumentId);

      if (!params.existingDocumentId) {
        throw new Error("Estimate ID is required for sending");
      }

      let response;
      
      if (params.sendMethod === "email") {
        console.log("Calling send-estimate function for email...");
        response = await supabase.functions.invoke('send-estimate', {
          body: {
            estimateId: params.existingDocumentId,
            recipientEmail: params.sendTo,
            subject: `Estimate ${params.documentNumber}`,
            message: params.customNote || `Please find your estimate ${params.documentNumber}. Total: $${params.documentDetails.total?.toFixed(2) || '0.00'}.`
          }
        });
      } else {
        console.log("Calling send-estimate-sms function for SMS...");
        const smsMessage = params.customNote || `Hi ${params.contactInfo.name}! Your estimate ${params.documentNumber} is ready. Total: $${params.documentDetails.total?.toFixed(2) || '0.00'}.`;
        
        response = await supabase.functions.invoke('send-estimate-sms', {
          body: {
            estimateId: params.existingDocumentId,
            recipientPhone: params.sendTo,
            message: smsMessage
          }
        });
      }

      console.log("Edge function response:", response);

      if (response.error) {
        console.error("Edge function error:", response.error);
        throw new Error(response.error.message || 'Failed to send estimate');
      }

      if (response.data?.success) {
        console.log("Estimate sent successfully");
        return { success: true };
      } else {
        console.error("Edge function returned error:", response.data);
        throw new Error(response.data?.error || 'Unknown error occurred');
      }
    } catch (error: any) {
      console.error("Error in estimate sending:", error);
      return { 
        success: false, 
        error: error.message || 'Failed to send estimate'
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
