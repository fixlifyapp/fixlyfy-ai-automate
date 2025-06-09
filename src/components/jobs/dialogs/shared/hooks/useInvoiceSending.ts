
import { useState } from "react";
import { toast } from "sonner";
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

interface SendInvoiceParams {
  sendMethod: "email" | "sms";
  sendTo: string;
  invoiceNumber: string;
  invoiceDetails: InvoiceDetails;
  lineItems: LineItem[];
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
      onSave,
      existingInvoiceId
    } = params;

    setIsProcessing(true);

    try {
      console.log("🚀 Starting invoice send process...", { sendMethod, sendTo, invoiceNumber, existingInvoiceId });

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

      // Mock invoice data for now
      const mockInvoice = {
        id: existingInvoiceId || 'mock-invoice-id',
        invoice_number: invoiceNumber,
        total: lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
      };

      console.log("📧 Sending via mock functionality...", { method: sendMethod, recipient: sendTo, invoiceId: mockInvoice.id });

      // Mock sending functionality
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock success response
      const success = Math.random() > 0.1; // 90% success rate

      if (success) {
        const method = sendMethod === "email" ? "email" : "text message";
        toast.success(`Invoice ${invoiceNumber} sent to client via ${method}`);
        console.log("✅ Invoice sent successfully");
        return { success: true };
      } else {
        console.error("Mock send returned error");
        toast.error(`Failed to send invoice: Mock error`);
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

export const useInvoiceSendingInterface = () => {
  return useInvoiceSending();
};
