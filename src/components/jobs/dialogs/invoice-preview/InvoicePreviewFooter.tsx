
import React from 'react';
import { Button } from '@/components/ui/button';
import { Send, X } from 'lucide-react';

interface InvoicePreviewFooterProps {
  onClose: () => void;
  onSend: () => void;
}

export const InvoicePreviewFooter = ({ onClose, onSend }: InvoicePreviewFooterProps) => {
  return (
    <div className="border-t p-6 flex justify-between">
      <Button variant="outline" onClick={onClose}>
        <X className="h-4 w-4 mr-2" />
        Close
      </Button>
      <Button onClick={onSend}>
        <Send className="h-4 w-4 mr-2" />
        Send Invoice
      </Button>
    </div>
  );
};
