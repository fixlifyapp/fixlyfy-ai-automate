
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatPhoneForTelnyx, isValidPhoneNumber } from "@/utils/phoneUtils";

interface EstimateDetails {
  estimate_number: string;
  notes?: string;
}

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
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
    estimateDetails: EstimateDetails;
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

      // Generate portal access token for this estimate
      console.log("Step 4: Generating portal access token...");
      const { data: tokenData, error: tokenError } = await supabase.functions.invoke('client-portal-auth', {
        body: {
          action: 'generate_access_token',
          email: contactInfo.email,
          resource_type: 'estimate',
          resource_id: savedEstimate.id
        }
      });

      if (tokenError || !tokenData?.token) {
        console.error("Failed to generate portal token:", tokenError);
        // Continue without portal link if token generation fails
      }

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

      console.log("Step 5: Sending estimate via", sendMethod);
      
      if (sendMethod === "sms") {
        // Create portal link if token was generated
        let portalLinkText = '';
        if (tokenData?.token) {
          const portalLink = `${window.location.origin}/portal/login?token=${tokenData.token}&jobId=${jobId}`;
          portalLinkText = `\n\nView online: ${portalLink}`;
        }

        const smsMessage = customNote || 
          `Hi ${contactInfo.name}! Your estimate ${estimateNumber} is ready. Total: $${savedEstimate.total.toFixed(2)}.${portalLinkText}\n\nQuestions? Just reply to this message.`;
        
        console.log("Sending SMS with portal link");

        const { data: smsData, error: smsError } = await supabase.functions.invoke('telnyx-sms', {
          body: {
            to: finalRecipient,
            body: smsMessage,
            client_id: jobId || null,
            job_id: jobId || null
          }
        });

        if (smsError || !smsData?.success) {
          console.error("SMS sending failed:", smsError || smsData);
          toast.error(`Failed to send SMS: ${smsError?.message || smsData?.error || 'Unknown error'}`);
          return { success: false, error: 'SMS sending failed' };
        }

        console.log("SMS sent successfully:", smsData);
        toast.success(`Estimate ${estimateNumber} sent via SMS to ${contactInfo.name}`);
        
        // Update estimate status
        await supabase
          .from('estimates')
          .update({ status: 'sent' })
          .eq('id', savedEstimate.id);

        return { success: true };
      } else {
        // Create portal link for email if token was generated
        let portalLink = '';
        if (tokenData?.token) {
          portalLink = `${window.location.origin}/portal/login?token=${tokenData.token}&jobId=${jobId}`;
        }

        // Call the send-estimate function for email with portal link
        const { data: sendData, error: sendError } = await supabase.functions.invoke('send-estimate', {
          body: {
            estimateId: savedEstimate.id,
            sendMethod: sendMethod,
            recipientEmail: finalRecipient,
            subject: `Estimate ${estimateNumber}`,
            message: customNote || `Please find your estimate ${estimateNumber}. Total: $${savedEstimate.total.toFixed(2)}.`,
            portalLink: portalLink
          }
        });
        
        if (sendError || !sendData?.success) {
          console.error("Email sending failed:", sendError || sendData);
          toast.error(`Failed to send email: ${sendError?.message || sendData?.error || 'Unknown error'}`);
          return { success: false, error: 'Email sending failed' };
        }

        console.log("Email sent successfully:", sendData);
        toast.success(`Estimate ${estimateNumber} sent via email to ${contactInfo.name}`);
        return { success: true };
      }
        
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
