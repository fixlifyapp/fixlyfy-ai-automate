
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatPhoneForTelnyx, isValidPhoneNumber } from "@/utils/phoneUtils";

interface EstimateDetails {
  estimate_id: string;
  estimate_number: string;
  total: number;
  status: string;
  notes?: string;
  job_id: string;
  job_title: string;
  job_description?: string;
  client_id: string;
  client_name: string;
  client_email?: string;
  client_phone?: string;
  client_company?: string;
}

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  taxable: boolean;
}

interface ContactInfo {
  name: string;
  email: string;
  phone: string;
}

const isValidEmail = (email: string): boolean => {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validateRecipient = (method: "email" | "sms", recipient: string): string | null => {
  if (!recipient.trim()) {
    return `Please enter a ${method === "email" ? "email address" : "phone number"}`;
  }

  if (method === "email") {
    if (!isValidEmail(recipient)) {
      return "Please enter a valid email address";
    }
  } else if (method === "sms") {
    if (!isValidPhoneNumber(recipient)) {
      return "Please enter a valid phone number";
    }
  }

  return null;
};

export const useEstimateSending = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const sendEstimate = async ({
    sendMethod,
    sendTo,
    estimateNumber,
    estimateDetails,
    lineItems,
    contactInfo,
    customNote,
    jobId,
    onSave
  }: {
    sendMethod: "email" | "sms";
    sendTo: string;
    estimateNumber: string;
    estimateDetails: EstimateDetails | null;
    lineItems: LineItem[];
    contactInfo: ContactInfo;
    customNote: string;
    jobId?: string;
    onSave: () => Promise<boolean>;
  }) => {
    console.log("=== STARTING ESTIMATE SEND PROCESS ===");
    console.log("Send method:", sendMethod);
    console.log("Send to:", sendTo);
    console.log("Estimate number:", estimateNumber);

    const validationErrorMsg = validateRecipient(sendMethod, sendTo);
    if (validationErrorMsg) {
      toast.error(validationErrorMsg);
      console.error("Validation failed:", validationErrorMsg);
      return { success: false, error: validationErrorMsg };
    }

    setIsProcessing(true);
    
    try {
      console.log("Step 1: Saving estimate...");
      const success = await onSave();
      
      if (!success) {
        console.error("Failed to save estimate");
        toast.error("Failed to save estimate. Please try again.");
        return { success: false, error: "Failed to save estimate" };
      }

      console.log("Step 2: Estimate saved successfully");
      
      // Wait a moment for the estimate to be fully saved
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get the latest estimate details after saving
      const { data: savedEstimate, error: fetchError } = await supabase
        .from('estimates')
        .select('id, estimate_number, total, status, notes, job_id')
        .eq('estimate_number', estimateNumber)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError || !savedEstimate) {
        console.error("Failed to fetch saved estimate:", fetchError);
        toast.error("Estimate not found after saving. Please try again.");
        return { success: false, error: "Estimate not found after saving" };
      }

      console.log("Step 3: Retrieved saved estimate:", savedEstimate);

      let finalRecipient = sendTo;
      if (sendMethod === "sms") {
        finalRecipient = formatPhoneForTelnyx(sendTo);
        console.log("Formatted phone number for Telnyx:", finalRecipient);
        
        if (!isValidPhoneNumber(finalRecipient)) {
          const error = "Invalid phone number format";
          toast.error(error);
          console.error(error);
          return { success: false, error };
        }
      }

      console.log("Step 4: Sending estimate via", sendMethod);
      
      // Call the send-estimate function
      const { data: sendData, error: sendError } = await supabase.functions.invoke('send-estimate', {
        body: {
          estimateId: savedEstimate.id,
          sendMethod: sendMethod,
          recipientEmail: sendMethod === 'email' ? finalRecipient : undefined,
          recipientPhone: sendMethod === 'sms' ? finalRecipient : undefined,
          subject: sendMethod === 'email' ? `Estimate ${estimateNumber}` : undefined,
          message: customNote || `Please find your estimate ${estimateNumber}. Total: $${savedEstimate.total.toFixed(2)}.`
        }
      });
      
      if (sendError || !sendData?.success) {
        console.error("Estimate sending failed:", sendError || sendData);
        toast.error(`Failed to send ${sendMethod}: ${sendError?.message || sendData?.error || 'Unknown error'}`);
        return { success: false, error: 'Estimate sending failed' };
      }

      console.log("Estimate sent successfully:", sendData);

      const method = sendMethod === "email" ? "email" : "text message";
      toast.success(`Estimate ${estimateNumber} sent to client via ${method}`);
      console.log("SUCCESS: Estimate sent successfully");
      
      return { success: true };
        
    } catch (error: any) {
      console.error("CRITICAL ERROR in send estimate process:", error);
      toast.error(`An error occurred while sending the estimate: ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      setIsProcessing(false);
      console.log("=== ESTIMATE SEND PROCESS COMPLETED ===");
    }
  };

  return {
    sendEstimate,
    isProcessing
  };
};
