
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface EstimateSendDialogProps {
  open: boolean;
  onClose: () => void;
  estimateId: string;
  estimateNumber: string;
  total: number;
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
  onSuccess: () => void;
}

export const EstimateSendDialog = ({
  open,
  onClose,
  estimateId,
  estimateNumber,
  total,
  contactInfo,
  onSuccess
}: EstimateSendDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Estimate</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <p>Send estimate {estimateNumber} to {contactInfo.name}?</p>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={onSuccess}>Send</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
