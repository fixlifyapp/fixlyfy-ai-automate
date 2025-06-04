
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

      // Format phone number if SMS
      let finalRecipient = sendTo;
      if (sendMethod === "sms") {
        finalRecipient = formatPhoneForTelnyx(sendTo);
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

      // Create communication record
      const { data: commData, error: commError } = await supabase
        .from('invoice_communications')
        .insert({
          invoice_id: invoice.id,
          communication_type: sendMethod,
          recipient: finalRecipient,
          subject: sendMethod === 'email' ? `Invoice ${invoiceNumber}` : null,
          content: sendMethod === 'sms' 
            ? `Hi ${contactInfo.name}! Your invoice ${invoiceNumber} is ready. Total: $${invoice.total.toFixed(2)}.`
            : `Please find your invoice ${invoiceNumber} attached. Total: $${invoice.total.toFixed(2)}.`,
          status: 'pending',
          invoice_number: invoiceNumber,
          client_name: contactInfo.name,
          client_email: contactInfo.email,
          client_phone: contactInfo.phone
        })
        .select()
        .single();

      if (commError) {
        console.error('Error creating communication record:', commError);
        toast.error('Failed to create communication record');
        return { success: false };
      }

      console.log("✅ Communication record created:", commData.id);

      // Generate portal login link if email available
      let portalLoginLink = '';
      if (contactInfo.email) {
        try {
          const { data: tokenData, error: tokenError } = await supabase.rpc('generate_client_login_token', {
            p_email: contactInfo.email
          });

          if (!tokenError && tokenData) {
            portalLoginLink = `${window.location.origin}/portal/login?token=${tokenData}`;
            console.log("🔗 Portal login link generated");
          }
        } catch (error) {
          console.warn("Failed to generate portal login token:", error);
        }
      }

      const invoiceData = {
        lineItems: lineItems.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice || item.unit_price),
          taxable: item.taxable,
          total: item.quantity * Number(item.unitPrice || item.unit_price)
        })),
        total: invoice.total,
        taxRate: 13,
        notes: customNote || invoice.notes,
        viewUrl: `${window.location.origin}/invoice/view/${invoiceNumber}`,
        portalLoginLink: portalLoginLink
      };

      console.log("📧 Sending via edge function...", { method: sendMethod, recipient: finalRecipient });

      // Send via edge function with proper payload structure
      const { data, error } = await supabase.functions.invoke('send-invoice', {
        body: {
          method: sendMethod,
          recipient: finalRecipient,
          invoiceNumber: invoiceNumber,
          invoiceData: invoiceData,
          clientName: contactInfo.name,
          communicationId: commData.id
        }
      });
      
      if (error) {
        console.error("Edge function error:", error);
        throw new Error(error.message);
      }
      
      console.log("📬 Edge function response:", data);
      
      if (data?.success) {
        const method = sendMethod === "email" ? "email" : "text message";
        toast.success(`Invoice ${invoiceNumber} sent to client via ${method}`);
        console.log("✅ Invoice sent successfully");
        return { success: true };
      } else {
        console.error("Edge function returned error:", data);
        await supabase
          .from('invoice_communications')
          .update({
            status: 'failed',
            error_message: data?.error || 'Unknown error'
          })
          .eq('id', commData.id);
        
        toast.error(`Failed to send invoice: ${data?.error || 'Unknown error'}`);
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
