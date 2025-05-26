
import React from "react";
import { LineItem } from "../../builder/types";
import { formatCurrency } from "@/lib/utils";
import { DocumentType } from "../UnifiedDocumentBuilder";

interface UnifiedDocumentPreviewProps {
  documentType: DocumentType;
  documentNumber: string;
  lineItems: LineItem[];
  taxRate: number;
  calculateSubtotal: () => number;
  calculateTotalTax: () => number;
  calculateGrandTotal: () => number;
  notes: string;
  clientInfo?: any;
  issueDate?: string;
  dueDate?: string;
}

export const UnifiedDocumentPreview = ({
  documentType,
  documentNumber,
  lineItems,
  taxRate,
  calculateSubtotal,
  calculateTotalTax,
  calculateGrandTotal,
  notes,
  clientInfo,
  issueDate,
  dueDate
}: UnifiedDocumentPreviewProps) => {
  const subtotal = calculateSubtotal();
  const tax = calculateTotalTax();
  const total = calculateGrandTotal();

  const documentTitle = documentType === 'estimate' ? 'ESTIMATE' : 'INVOICE';

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{documentTitle}</h1>
          <p className="text-lg text-gray-600 mt-1">#{documentNumber}</p>
        </div>
        <div className="text-right space-y-1">
          <div className="text-2xl font-bold text-primary">FixLyfy</div>
          <div className="text-sm text-gray-600">Professional Services</div>
        </div>
      </div>

      {/* Client and Date Information */}
      <div className="grid grid-cols-2 gap-8">
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">
            {documentType === 'estimate' ? 'Estimate For:' : 'Bill To:'}
          </h3>
          <div className="text-gray-700">
            <p className="font-medium">{clientInfo?.name || 'Client Name'}</p>
            {clientInfo?.email && <p>{clientInfo.email}</p>}
            {clientInfo?.phone && <p>{clientInfo.phone}</p>}
          </div>
        </div>
        <div className="text-right">
          <div className="space-y-2">
            <div>
              <span className="text-gray-600">{documentType === 'estimate' ? 'Estimate Date:' : 'Issue Date:'}</span>
              <span className="ml-2 font-medium">{issueDate}</span>
            </div>
            {documentType === 'invoice' && dueDate && (
              <div>
                <span className="text-gray-600">Due Date:</span>
                <span className="ml-2 font-medium">{dueDate}</span>
              </div>
            )}
            {documentType === 'estimate' && (
              <div>
                <span className="text-gray-600">Valid Until:</span>
                <span className="ml-2 font-medium">{new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Description</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">Qty</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">Unit Price</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {lineItems.map((item, index) => (
              <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {item.description || item.name}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 text-center">
                  {item.quantity}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right">
                  {formatCurrency(item.unitPrice)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                  {formatCurrency(item.quantity * item.unitPrice)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-64 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax ({taxRate}%):</span>
            <span className="font-medium">{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Total:</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {notes && (
        <div className="border-t pt-6">
          <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="border-t pt-6 text-center text-sm text-gray-500">
        <p>Thank you for your business!</p>
        {documentType === 'estimate' && (
          <p className="mt-1">This estimate is valid for 30 days from the date issued.</p>
        )}
      </div>
    </div>
  );
};
