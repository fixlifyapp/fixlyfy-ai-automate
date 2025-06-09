
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface InvoiceSendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => Promise<boolean>;
  onAddWarranty: () => void;
  invoiceNumber: string;
  jobId: string;
}

export const InvoiceSendDialog = ({
  open,
  onOpenChange,
  onSave,
  onAddWarranty,
  invoiceNumber,
  jobId
}: InvoiceSendDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Invoice</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <p>Send invoice {invoiceNumber}?</p>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={() => onSave()}>Send</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
