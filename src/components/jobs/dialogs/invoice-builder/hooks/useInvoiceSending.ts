
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatPhoneForTelnyx, isValidPhoneNumber } from "@/utils/phoneUtils";

interface SendInvoiceParams {
  sendMethod: "email" | "sms";
  sendTo: string;
  invoiceNumber: string;
  invoiceDetails: any;
  lineItems: any[];
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
  customNote: string;
  jobId: string;
  onSave: () => Promise<boolean>;
  existingInvoiceId: string;
}

export const useInvoiceSending = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const sendInvoice = async (params: SendInvoiceParams) => {
    const {
      sendMethod,
      sendTo,
      invoiceNumber,
      lineItems,
      contactInfo,
      customNote,
      onSave
    } = params;

    setIsProcessing(true);

    try {
      console.log("🚀 Starting invoice send process...", { sendMethod, sendTo, invoiceNumber });

      // First save the invoice
      const saveSuccess = await onSave();
      if (!saveSuccess) {
        toast.error("Failed to save invoice");
        return { success: false };
      }

      // Validate recipient
      if (sendMethod === "email" && !sendTo.includes("@")) {
        toast.error("Please enter a valid email address");
        return { success: false };
      }

      if (sendMethod === "sms" && !isValidPhoneNumber(sendTo)) {
        toast.error("Please enter a valid phone number");
        return { success: false };
      }

      // Get invoice details
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .eq('invoice_number', invoiceNumber)
        .single();

      if (invoiceError || !invoice) {
        console.error("Failed to find invoice:", invoiceError);
        toast.error("Failed to find invoice");
        return { success: false };
      }

      console.log("📧 Sending via appropriate edge function...", { method: sendMethod, recipient: sendTo });

      let response;
      
      if (sendMethod === "email") {
        // Use send-invoice function for email
        response = await supabase.functions.invoke('send-invoice', {
          body: {
            invoiceId: invoice.id,
            sendMethod: sendMethod,
            recipientEmail: sendTo
          }
        });
      } else {
        // Use send-invoice-sms function for SMS
        const formattedPhone = formatPhoneForTelnyx(sendTo);
        const smsMessage = `Hi ${contactInfo.name}! Your invoice ${invoiceNumber} is ready. Total: $${invoice.total.toFixed(2)}.`;
        
        response = await supabase.functions.invoke('send-invoice-sms', {
          body: {
            invoiceId: invoice.id,
            recipientPhone: formattedPhone,
            message: smsMessage
          }
        });
      }
      
      if (response.error) {
        console.error("Edge function error:", response.error);
        throw new Error(response.error.message);
      }
      
      console.log("📬 Edge function response:", response.data);
      
      if (response.data?.success) {
        const method = sendMethod === "email" ? "email" : "text message";
        toast.success(`Invoice ${invoiceNumber} sent to client via ${method}`);
        console.log("✅ Invoice sent successfully");
        return { success: true };
      } else {
        console.error("Edge function returned error:", response.data);
        toast.error(`Failed to send invoice: ${response.data?.error || 'Unknown error'}`);
        return { success: false };
      }

    } catch (error: any) {
      console.error("💥 Error sending invoice:", error);
      toast.error(`Failed to send invoice: ${error.message}`);
      return { success: false };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    sendInvoice,
    isProcessing
  };
};
