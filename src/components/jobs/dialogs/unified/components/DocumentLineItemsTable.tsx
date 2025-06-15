
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
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        {documentType === 'estimate' ? 'Estimated Services & Materials' : 'Services & Materials'}
      </h3>
      
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Description</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 w-20">Qty</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 w-28">Rate</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 w-28">Amount</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item, index) => (
              <tr key={item.id} className="border-t border-gray-200">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">
                      {item.description || item.name}
                    </p>
                    {item.taxable && (
                      <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full mt-2">
                        Taxable
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-gray-900">{item.quantity}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-gray-900">
                    {formatCurrency(item.unitPrice)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="font-semibold text-gray-900">
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
