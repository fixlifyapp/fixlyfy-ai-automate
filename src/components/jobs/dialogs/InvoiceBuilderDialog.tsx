
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SteppedInvoiceBuilder } from './SteppedInvoiceBuilder';

interface InvoiceBuilderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  existingInvoice?: any;
  onInvoiceCreated?: () => void;
}

export const InvoiceBuilderDialog = ({
  open,
  onOpenChange,
  jobId,
  existingInvoice,
  onInvoiceCreated
}: InvoiceBuilderDialogProps) => {
  return (
    <SteppedInvoiceBuilder
      open={open}
      onOpenChange={onOpenChange}
      jobId={jobId}
      existingInvoice={existingInvoice}
      onInvoiceCreated={onInvoiceCreated}
    />
  );
};
