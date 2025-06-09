
import React from 'react';
import { SteppedInvoiceBuilder } from './SteppedInvoiceBuilder';
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
    <SteppedInvoiceBuilder
      open={open}
      onOpenChange={onOpenChange}
      jobId={jobId}
      existingInvoice={invoice}
      estimateToConvert={estimate}
      onInvoiceCreated={onInvoiceCreated}
    />
  );
};
