
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface InvoicePreviewWindowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: any;
  jobId: string;
}

export const InvoicePreviewWindow = ({
  open,
  onOpenChange,
  invoice,
  jobId
}: InvoicePreviewWindowProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Invoice Preview</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <p>Invoice preview for {invoice?.invoice_number}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
