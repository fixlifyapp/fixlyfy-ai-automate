
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SendDocumentParams {
  documentType: "estimate" | "invoice";
  documentId: string;
  sendMethod: "email" | "sms";
  sendTo: string;
  customMessage?: string;
  contactInfo?: {
    name: string;
    email: string;
    phone: string;
  };
}

export const useDocumentSending = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const sendDocument = async (params: SendDocumentParams) => {
    const {
      documentType,
      documentId,
      sendMethod,
      sendTo,
      customMessage,
      contactInfo
    } = params;

    setIsProcessing(true);

    try {
      console.log(`🚀 Sending ${documentType} via ${sendMethod}...`);
      console.log(`Document ID: ${documentId}`);
      console.log(`Send to: ${sendTo}`);

      let response;
      
      if (sendMethod === "email") {
        // Call email sending edge function
        const functionName = documentType === "estimate" ? "send-estimate" : "send-invoice";
        
        response = await supabase.functions.invoke(functionName, {
          body: {
            [`${documentType}Id`]: documentId,
            recipientEmail: sendTo,
            customMessage: customMessage || undefined
          }
        });
      } else {
        // Call SMS sending edge function
        const functionName = documentType === "estimate" ? "send-estimate-sms" : "send-invoice-sms";
        
        response = await supabase.functions.invoke(functionName, {
          body: {
            [`${documentType}Id`]: documentId,
            recipientPhone: sendTo,
            message: customMessage || undefined
          }
        });
      }

      if (response.error) {
        console.error(`❌ Error sending ${documentType}:`, response.error);
        throw new Error(response.error.message || `Failed to send ${documentType}`);
      }

      console.log(`✅ ${documentType} sent successfully:`, response.data);
      
      const methodText = sendMethod === "email" ? "email" : "SMS";
      const docText = documentType === "estimate" ? "Estimate" : "Invoice";
      
      toast.success(`${docText} sent via ${methodText} successfully!`);
      
      return { success: true };

    } catch (error: any) {
      console.error(`❌ Failed to send ${documentType}:`, error);
      toast.error(`Failed to send ${documentType}: ${error.message}`);
      return { 
        success: false, 
        error: error.message || `Failed to send ${documentType}`
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
