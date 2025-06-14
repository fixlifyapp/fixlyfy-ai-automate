
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
    console.log("=== ESTIMATE SENDING START ===");
    console.log("Params received:", params);
    
    try {
      // Validate required parameters
      if (!params.existingDocumentId) {
        console.error("Missing estimate ID");
        throw new Error("Estimate ID is required for sending");
      }

      if (!params.sendTo?.trim()) {
        console.error("Missing recipient");
        throw new Error("Recipient is required");
      }

      console.log("Send method:", params.sendMethod);
      console.log("Send to:", params.sendTo);
      console.log("Document number:", params.documentNumber);
      console.log("Existing document ID:", params.existingDocumentId);

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
      } else if (params.sendMethod === "sms") {
        console.log("Calling send-estimate-sms function for SMS...");
        const smsMessage = params.customNote || `Hi ${params.contactInfo.name}! Your estimate ${params.documentNumber} is ready. Total: $${params.documentDetails.total?.toFixed(2) || '0.00'}.`;
        
        response = await supabase.functions.invoke('send-estimate-sms', {
          body: {
            estimateId: params.existingDocumentId,
            recipientPhone: params.sendTo,
            message: smsMessage
          }
        });
      } else {
        throw new Error(`Invalid send method: ${params.sendMethod}`);
      }

      console.log("Edge function response:", response);

      if (response.error) {
        console.error("Edge function error:", response.error);
        throw new Error(response.error.message || 'Failed to send estimate');
      }

      if (response.data?.success) {
        console.log("Estimate sent successfully");
        toast.success(`Estimate sent via ${params.sendMethod} successfully!`);
        return { success: true };
      } else {
        console.error("Edge function returned error:", response.data);
        throw new Error(response.data?.error || 'Unknown error occurred');
      }
    } catch (error: any) {
      console.error("Error in estimate sending:", error);
      toast.error(`Failed to send estimate: ${error.message}`);
      return { 
        success: false, 
        error: error.message || 'Failed to send estimate'
      };
    } finally {
      setIsProcessing(false);
      console.log("=== ESTIMATE SENDING END ===");
    }
  };

  return {
    sendDocument,
    isProcessing
  };
};
