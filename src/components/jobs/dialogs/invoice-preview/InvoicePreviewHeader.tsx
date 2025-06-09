
import React from 'react';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText } from 'lucide-react';

interface Invoice {
  invoice_number?: string;
  id: string;
}

interface InvoicePreviewHeaderProps {
  invoice: Invoice;
}

export const InvoicePreviewHeader = ({ invoice }: InvoicePreviewHeaderProps) => {
  return (
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <FileText className="h-5 w-5" />
        Invoice {invoice.invoice_number || invoice.id}
      </DialogTitle>
    </DialogHeader>
  );
};
