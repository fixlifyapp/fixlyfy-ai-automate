
import React from 'react';

interface ClientInfo {
  name?: string;
  email?: string;
  phone?: string;
}

interface Invoice {
  invoice_number?: string;
  total?: number;
  status?: string;
  created_at?: string;
  notes?: string;
}

interface InvoicePreviewContentProps {
  invoice: Invoice;
  clientInfo?: ClientInfo;
  jobAddress?: string;
}

export const InvoicePreviewContent = ({ invoice, clientInfo, jobAddress }: InvoicePreviewContentProps) => {
  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-2">Bill To:</h3>
          <div className="text-sm text-muted-foreground">
            <p>{clientInfo?.name || 'Client Name'}</p>
            <p>{clientInfo?.email}</p>
            <p>{clientInfo?.phone}</p>
            {jobAddress && <p className="mt-2">{jobAddress}</p>}
          </div>
        </div>
        <div className="text-right">
          <h3 className="font-semibold mb-2">Invoice Details:</h3>
          <div className="text-sm text-muted-foreground">
            <p>Invoice #: {invoice.invoice_number || 'INV-001'}</p>
            <p>Date: {invoice.created_at ? new Date(invoice.created_at).toLocaleDateString() : new Date().toLocaleDateString()}</p>
            <p>Status: {invoice.status || 'Draft'}</p>
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-4">Invoice Items</h3>
        <div className="text-center py-8 text-muted-foreground">
          <p>Invoice items will be displayed here</p>
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between items-center font-semibold text-lg">
          <span>Total:</span>
          <span>${invoice.total?.toFixed(2) || '0.00'}</span>
        </div>
      </div>

      {invoice.notes && (
        <div className="border-t pt-4">
          <h3 className="font-semibold mb-2">Notes:</h3>
          <p className="text-sm text-muted-foreground">{invoice.notes}</p>
        </div>
      )}
    </div>
  );
};
