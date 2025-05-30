
import React from "react";
import { LineItem } from "@/components/jobs/builder/types";
import { UnifiedDocumentPreview } from "@/components/jobs/dialogs/unified/UnifiedDocumentPreview";

interface InvoicePreviewProps {
  invoice_number: string;
  lineItems: LineItem[];
  taxRate: number;
  calculateSubtotal: () => number;
  calculateTotalTax: () => number;
  calculateGrandTotal: () => number;
  notes: string;
  jobId?: string;
  clientInfo?: any;
  issueDate?: string;
  dueDate?: string;
}

export const InvoicePreview = ({
  invoice_number,
  lineItems,
  taxRate,
  calculateSubtotal,
  calculateTotalTax,
  calculateGrandTotal,
  notes,
  jobId,
  clientInfo,
  issueDate,
  dueDate
}: InvoicePreviewProps) => {
  return (
    <UnifiedDocumentPreview
      documentType="invoice"
      documentNumber={invoice_number}
      lineItems={lineItems}
      taxRate={taxRate}
      calculateSubtotal={calculateSubtotal}
      calculateTotalTax={calculateTotalTax}
      calculateGrandTotal={calculateGrandTotal}
      notes={notes}
      clientInfo={clientInfo}
      issueDate={issueDate}
      dueDate={dueDate}
    />
  );
};
