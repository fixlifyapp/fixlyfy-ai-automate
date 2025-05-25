
import React from "react";
import { LineItem } from "../../builder/types";

interface InvoicePreviewProps {
  invoiceNumber: string;
  lineItems: LineItem[];
  taxRate: number;
  calculateSubtotal: () => number;
  calculateTotalTax: () => number;
  calculateGrandTotal: () => number;
  notes?: string;
  clientInfo?: any;
  issueDate?: string;
  dueDate?: string;
}

export const InvoicePreview = ({
  invoiceNumber,
  lineItems,
  taxRate,
  calculateSubtotal,
  calculateTotalTax,
  calculateGrandTotal,
  notes,
  clientInfo,
  issueDate,
  dueDate
}: InvoicePreviewProps) => {
  const subtotal = calculateSubtotal();
  const tax = calculateTotalTax();
  const total = calculateGrandTotal();

  return (
    <div className="bg-white p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
          <p className="text-gray-600 mt-2">#{invoiceNumber}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Issue Date: {issueDate || new Date().toLocaleDateString()}</p>
          <p className="text-sm text-gray-600">Due Date: {dueDate || new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Client Info */}
      {clientInfo && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-2">Bill To:</h3>
          <div className="text-gray-700">
            <p>{clientInfo.name}</p>
            {clientInfo.company && <p>{clientInfo.company}</p>}
            {clientInfo.email && <p>{clientInfo.email}</p>}
            {clientInfo.phone && <p>{clientInfo.phone}</p>}
            {clientInfo.address && <p>{clientInfo.address}</p>}
          </div>
        </div>
      )}

      {/* Line Items */}
      <div className="mb-8">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="text-left py-2">Description</th>
              <th className="text-right py-2">Qty</th>
              <th className="text-right py-2">Rate</th>
              <th className="text-right py-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item, index) => (
              <tr key={index} className="border-b border-gray-200">
                <td className="py-3">
                  <div>
                    <p className="font-medium">{item.name || item.description}</p>
                    {item.description && item.name !== item.description && (
                      <p className="text-sm text-gray-600">{item.description}</p>
                    )}
                  </div>
                </td>
                <td className="text-right py-3">{item.quantity}</td>
                <td className="text-right py-3">${item.unitPrice.toFixed(2)}</td>
                <td className="text-right py-3">${(item.quantity * item.unitPrice).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-64">
          <div className="flex justify-between py-2">
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2">
            <span>Tax ({taxRate}%):</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2 border-t-2 border-gray-300 font-bold text-lg">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {notes && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-2">Notes:</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{notes}</p>
        </div>
      )}
    </div>
  );
};
