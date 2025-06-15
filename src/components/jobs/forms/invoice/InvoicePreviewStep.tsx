
import React from "react";
import { UnifiedDocumentPreview } from "@/components/jobs/dialogs/unified/UnifiedDocumentPreview";
import { LineItem } from "@/components/jobs/builder/types";

interface InvoicePreviewStepProps {
  formData: {
    invoiceNumber: string;
    items: LineItem[];
    notes: string;
    issueDate: string;
    dueDate: string;
  };
  jobId: string;
}

// Lock tax rate to 13%
const LOCKED_TAX_RATE = 13;

export const InvoicePreviewStep = ({ formData, jobId }: InvoicePreviewStepProps) => {
  console.log('=== InvoicePreviewStep Debug ===');
  console.log('JobId received:', jobId);
  console.log('Form data:', formData);

  const calculateSubtotal = () => {
    return formData.items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);
  };

  const calculateTax = () => {
    return formData.items.reduce((sum: number, item: any) => {
      if (item.taxable) {
        return sum + (item.quantity * item.unitPrice * (LOCKED_TAX_RATE / 100));
      }
      return sum;
    }, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  return (
    <UnifiedDocumentPreview
      documentType="invoice"
      documentNumber={formData.invoiceNumber}
      lineItems={formData.items}
      taxRate={LOCKED_TAX_RATE}
      calculateSubtotal={calculateSubtotal}
      calculateTotalTax={calculateTax}
      calculateGrandTotal={calculateTotal}
      notes={formData.notes}
      issueDate={formData.issueDate}
      dueDate={formData.dueDate}
      jobId={jobId}
    />
  );
};
