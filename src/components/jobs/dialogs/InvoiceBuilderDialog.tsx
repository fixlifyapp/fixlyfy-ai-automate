
import React from 'react';
import { UnifiedDocumentBuilder } from './UnifiedDocumentBuilder';
import { Estimate } from "@/hooks/useEstimates";
import { Invoice } from "@/hooks/useInvoices";

interface InvoiceBuilderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  estimate?: Estimate;
  invoice?: Invoice;
  onInvoiceCreated?: (invoice: Invoice) => void;
}

export const InvoiceBuilderDialog = ({
  open,
  onOpenChange,
  jobId,
  estimate,
  invoice,
  onInvoiceCreated
}: InvoiceBuilderDialogProps) => {
  return (
    <UnifiedDocumentBuilder
      open={open}
      onOpenChange={onOpenChange}
      documentType="invoice"
      existingDocument={estimate || invoice}
      jobId={jobId}
      onDocumentCreated={onInvoiceCreated}
    />
  );
};
