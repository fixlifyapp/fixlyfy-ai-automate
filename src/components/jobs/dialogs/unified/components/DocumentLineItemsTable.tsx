
import React from "react";
import { LineItem } from "@/components/jobs/builder/types";
import { formatCurrency } from "@/lib/utils";
import { DocumentType } from "../../UnifiedDocumentBuilder";

interface DocumentLineItemsTableProps {
  documentType: DocumentType;
  lineItems: LineItem[];
}

export const DocumentLineItemsTable = ({
  documentType,
  lineItems
}: DocumentLineItemsTableProps) => {
  return (
    <div className="px-8 py-6">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
        {documentType === 'estimate' ? 'Estimated Services & Materials' : 'Services & Materials'}
      </h3>
      
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Description</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Qty</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Unit Price</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Total</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item, index) => (
              <tr key={item.id} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                <td className="px-4 py-3">
                  <div>
                    <p className="text-gray-900 font-medium">
                      {item.description || item.name}
                    </p>
                    {item.taxable && (
                      <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded mt-1">
                        Taxable
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="text-gray-900">{item.quantity}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-gray-900">
                    {formatCurrency(item.unitPrice)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-gray-900 font-medium">
                    {formatCurrency(item.quantity * item.unitPrice)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
