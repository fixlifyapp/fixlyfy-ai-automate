
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatPhoneForTelnyx, isValidPhoneNumber } from "@/utils/phoneUtils";

interface InvoiceDetails {
  invoice_number: string;
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

export const useInvoiceSending = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const sendDocument = async ({
    sendMethod,
    sendTo,
    documentNumber,
    documentDetails,
    lineItems,
    contactInfo,
    customNote,
    jobId,
    onSave,
    existingDocumentId
  }: {
    sendMethod: "email" | "sms";
    sendTo: string;
    documentNumber: string;
    documentDetails: InvoiceDetails;
    lineItems: LineItem[];
    contactInfo: ContactInfo;
    customNote: string;
    jobId?: string;
    onSave: () => Promise<boolean>;
    existingDocumentId?: string;
  }) => {
    console.log("=== STARTING INVOICE SEND PROCESS ===");
    console.log("Send method:", sendMethod);
    console.log("Send to:", sendTo);
    console.log("Invoice number:", documentNumber);
    console.log("Existing invoice ID:", existingDocumentId);

    const validationErrorMsg = validateRecipient(sendMethod, sendTo);
    if (validationErrorMsg) {
      toast.error(validationErrorMsg);
      console.error("Validation failed:", validationErrorMsg);
      return { success: false, error: validationErrorMsg };
    }

    setIsProcessing(true);
    
    try {
      let savedInvoice;

      if (existingDocumentId) {
        // Use existing invoice - don't create a new one
        console.log("Using existing invoice:", existingDocumentId);
        
        const { data: invoice, error: fetchError } = await supabase
          .from('invoices')
          .select('id, invoice_number, total, status, notes, job_id')
          .eq('id', existingDocumentId)
          .single();

        if (fetchError || !invoice) {
          console.error("Failed to fetch existing invoice:", fetchError);
          toast.error("Invoice not found. Please try again.");
          return { success: false, error: "Invoice not found" };
        }

        savedInvoice = invoice;
        console.log("Found existing invoice:", savedInvoice);
      } else {
        // Only save if we don't have an existing invoice
        console.log("Step 1: Saving new invoice...");
        const success = await onSave();
        
        if (!success) {
          console.error("Failed to save invoice");
          toast.error("Failed to save invoice. Please try again.");
          return { success: false, error: "Failed to save invoice" };
        }

        console.log("Step 2: Invoice saved successfully");
        
        // Wait a moment for the invoice to be fully saved
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Get the latest invoice details after saving
        const { data: invoice, error: fetchError } = await supabase
          .from('invoices')
          .select('id, invoice_number, total, status, notes, job_id')
          .eq('invoice_number', documentNumber)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (fetchError || !invoice) {
          console.error("Failed to fetch saved invoice:", fetchError);
          toast.error("Invoice not found after saving. Please try again.");
          return { success: false, error: "Invoice not found after saving" };
        }

        savedInvoice = invoice;
        console.log("Step 3: Retrieved saved invoice:", savedInvoice);
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

      console.log("Step 4: Sending invoice via", sendMethod);
      
      if (sendMethod === "sms") {
        // Send SMS using the send-invoice-sms function
        console.log("Calling send-invoice-sms function...");
        
        const { data: smsData, error: smsError } = await supabase.functions.invoke('send-invoice-sms', {
          body: {
            invoiceId: savedInvoice.id,
            recipientPhone: finalRecipient,
            message: customNote || `Hi ${contactInfo.name}! Your invoice ${documentNumber} is ready. Total: $${savedInvoice.total.toFixed(2)}.`
          }
        });

        if (smsError || !smsData?.success) {
          console.error("SMS sending failed:", smsError || smsData);
          toast.error(`Failed to send SMS: ${smsError?.message || smsData?.error || 'Unknown error'}`);
          return { success: false, error: 'SMS sending failed' };
        }

        console.log("SMS sent successfully:", smsData);
        toast.success(`Invoice ${documentNumber} sent via SMS to ${contactInfo.name}`);
      } else {
        // Call the send-invoice function for email
        const { data: sendData, error: sendError } = await supabase.functions.invoke('send-invoice', {
          body: {
            invoiceId: savedInvoice.id,
            sendMethod: sendMethod,
            recipientEmail: finalRecipient
          }
        });
        
        if (sendError || !sendData?.success) {
          console.error("Email sending failed:", sendError || sendData);
          toast.error(`Failed to send email: ${sendError?.message || sendData?.error || 'Unknown error'}`);
          return { success: false, error: 'Email sending failed' };
        }

        console.log("Email sent successfully:", sendData);
        toast.success(`Invoice ${documentNumber} sent via email to ${contactInfo.name}`);
      }
      
      return { success: true, invoiceId: savedInvoice.id };
        
    } catch (error: any) {
      console.error("CRITICAL ERROR in send invoice process:", error);
      toast.error(`An error occurred while sending the invoice: ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      setIsProcessing(false);
      console.log("=== INVOICE SEND PROCESS COMPLETED ===");
    }
  };

  return {
    sendDocument,
    isProcessing
  };
};
