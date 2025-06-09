
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { LineItem } from '@/components/jobs/builder/types';

interface UnifiedDocumentPreviewProps {
  documentType: 'estimate' | 'invoice';
  documentNumber: string;
  lineItems: LineItem[];
  calculateSubtotal: () => number;
  calculateTotalTax: () => number;
  calculateGrandTotal: () => number;
  notes: string;
  clientInfo?: {
    name: string;
    email: string;
    phone: string;
  };
  jobId?: string;
  issueDate: string;
  dueDate?: string;
}

export const UnifiedDocumentPreview = ({
  documentType,
  documentNumber,
  lineItems,
  calculateSubtotal,
  calculateTotalTax,
  calculateGrandTotal,
  notes,
  clientInfo,
  jobId,
  issueDate,
  dueDate
}: UnifiedDocumentPreviewProps) => {
  const documentTitle = documentType === 'estimate' ? 'Estimate' : 'Invoice';

  return (
    <div className="max-w-4xl mx-auto bg-white">
      {/* Header */}
      <div className="border-b pb-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{documentTitle}</h1>
            <p className="text-lg text-muted-foreground">#{documentNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Issue Date</p>
            <p className="font-medium">{issueDate}</p>
            {dueDate && (
              <>
                <p className="text-sm text-muted-foreground mt-2">Due Date</p>
                <p className="font-medium">{dueDate}</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Client Information */}
      {clientInfo && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Bill To:</h3>
          <div className="text-sm">
            <p className="font-medium">{clientInfo.name}</p>
            {clientInfo.email && <p>{clientInfo.email}</p>}
            {clientInfo.phone && <p>{clientInfo.phone}</p>}
          </div>
        </div>
      )}

      {/* Line Items */}
      <div className="mb-6">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
              <th className="border border-gray-300 px-4 py-2 text-center">Qty</th>
              <th className="border border-gray-300 px-4 py-2 text-right">Rate</th>
              <th className="border border-gray-300 px-4 py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item) => (
              <tr key={item.id}>
                <td className="border border-gray-300 px-4 py-2">
                  <div className="font-medium">{item.name}</div>
                  {item.description && (
                    <div className="text-sm text-muted-foreground">{item.description}</div>
                  )}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">{item.quantity}</td>
                <td className="border border-gray-300 px-4 py-2 text-right">
                  {formatCurrency(item.unitPrice)}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-right">
                  {formatCurrency(item.quantity * item.unitPrice)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-6">
        <div className="w-64">
          <div className="flex justify-between py-2">
            <span>Subtotal:</span>
            <span>{formatCurrency(calculateSubtotal())}</span>
          </div>
          <div className="flex justify-between py-2">
            <span>Tax:</span>
            <span>{formatCurrency(calculateTotalTax())}</span>
          </div>
          <div className="flex justify-between py-2 border-t font-bold text-lg">
            <span>Total:</span>
            <span>{formatCurrency(calculateGrandTotal())}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {notes && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Notes:</h3>
          <p className="text-sm whitespace-pre-wrap">{notes}</p>
        </div>
      )}
    </div>
  );
};
