
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
    console.log("Client info:", contactInfo);

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
      
      if (!estimateDetails) {
        console.error("No estimate details found");
        toast.error("Estimate not found. Please save the estimate first and try again.");
        return { success: false, error: "Estimate not found" };
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

      console.log("Step 4: Creating communication record...");
      const { data: commData, error: commError } = await supabase
        .from('estimate_communications')
        .insert({
          estimate_id: estimateDetails.estimate_id,
          communication_type: sendMethod,
          recipient: finalRecipient,
          subject: sendMethod === 'email' ? `Estimate ${estimateNumber}` : null,
          content: sendMethod === 'sms' 
            ? `Hi ${contactInfo.name}! Your estimate ${estimateNumber} is ready. Total: $${estimateDetails.total.toFixed(2)}. View details: ${window.location.origin}/estimate/view/${estimateNumber}`
            : `Please find your estimate ${estimateNumber} attached. Total: $${estimateDetails.total.toFixed(2)}.`,
          status: 'pending',
          estimate_number: estimateNumber,
          client_name: contactInfo.name,
          client_email: contactInfo.email,
          client_phone: contactInfo.phone
        })
        .select()
        .single();

      if (commError) {
        console.error('Error creating communication record:', commError);
        toast.error('Failed to create communication record');
        return { success: false, error: 'Failed to create communication record' };
      }

      console.log("Step 5: Communication record created:", commData);

      if (sendMethod === 'sms') {
        // Send SMS via Telnyx
        console.log("Step 6: Sending SMS via Telnyx...");
        const smsContent = `Hi ${contactInfo.name}! Your estimate ${estimateNumber} is ready. Total: $${estimateDetails.total.toFixed(2)}. View details: ${window.location.origin}/estimate/view/${estimateNumber}`;
        
        const { data: smsData, error: smsError } = await supabase.functions.invoke('telnyx-sms', {
          body: {
            to: finalRecipient,
            body: smsContent,
            client_id: estimateDetails.client_id,
            job_id: jobId || estimateDetails.job_id
          }
        });

        if (smsError || !smsData?.success) {
          console.error("SMS sending failed:", smsError || smsData);
          await supabase
            .from('estimate_communications')
            .update({
              status: 'failed',
              error_message: smsError?.message || smsData?.error || 'SMS sending failed'
            })
            .eq('id', commData.id);
          
          toast.error(`Failed to send SMS: ${smsError?.message || smsData?.error || 'Unknown error'}`);
          return { success: false, error: 'SMS sending failed' };
        }

        console.log("SMS sent successfully:", smsData);
        
        // Update communication record
        await supabase
          .from('estimate_communications')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
            provider_message_id: smsData.id
          })
          .eq('id', commData.id);

      } else {
        // Send Email
        console.log("Step 6: Sending email...");
        
        // Generate client portal login token
        let portalLoginLink = '';
        if (contactInfo.email) {
          try {
            const { data: tokenData, error: tokenError } = await supabase.rpc('generate_client_login_token', {
              p_email: contactInfo.email
            });

            if (!tokenError && tokenData) {
              portalLoginLink = `${window.location.origin}/portal/login?token=${tokenData}`;
              console.log("Portal login link generated");
            } else {
              console.warn("Failed to generate portal login token:", tokenError);
            }
          } catch (error) {
            console.error('Error generating portal login token:', error);
          }
        }

        const estimateData = {
          lineItems: lineItems.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: Number(item.unit_price),
            taxable: item.taxable,
            total: item.quantity * Number(item.unit_price)
          })),
          total: estimateDetails.total,
          taxRate: 13,
          notes: customNote || estimateDetails.notes,
          viewUrl: `${window.location.origin}/estimate/view/${estimateNumber}`,
          portalLoginLink: portalLoginLink
        };

        const { data: emailData, error: emailError } = await supabase.functions.invoke('send-estimate', {
          body: {
            method: sendMethod,
            recipient: finalRecipient,
            estimateNumber: estimateNumber,
            estimateData: estimateData,
            clientName: contactInfo.name,
            communicationId: commData.id
          }
        });
        
        if (emailError || !emailData?.success) {
          console.error("Email sending failed:", emailError || emailData);
          await supabase
            .from('estimate_communications')
            .update({
              status: 'failed',
              error_message: emailError?.message || emailData?.error || 'Email sending failed'
            })
            .eq('id', commData.id);
          
          toast.error(`Failed to send email: ${emailError?.message || emailData?.error || 'Unknown error'}`);
          return { success: false, error: 'Email sending failed' };
        }

        console.log("Email sent successfully:", emailData);
      }

      const method = sendMethod === "email" ? "email" : "text message";
      toast.success(`Estimate ${estimateNumber} sent to client via ${method}`);
      console.log("SUCCESS: Estimate sent successfully");
      
      if (estimateDetails.client_id) {
        await supabase
          .from('client_notifications')
          .insert({
            client_id: estimateDetails.client_id,
            type: 'estimate_sent',
            title: 'New Estimate Available',
            message: `Estimate ${estimateNumber} has been sent to you. Total: $${estimateDetails.total.toFixed(2)}`,
            data: { 
              estimate_id: estimateDetails.estimate_id, 
              estimate_number: estimateNumber
            }
          });
      }

      // Update estimate status to 'sent'
      await supabase
        .from('estimates')
        .update({ status: 'sent' })
        .eq('id', estimateDetails.estimate_id);
      
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
