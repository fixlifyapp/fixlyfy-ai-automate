
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
  const documentColor = documentType === 'estimate' ? 'text-blue-700' : 'text-purple-700';

  return (
    <div className="px-8 py-8">
      <h3 className={`font-bold text-xl ${documentColor} mb-6 flex items-center`}>
        <div className={`w-1 h-6 ${documentType === 'estimate' ? 'bg-blue-700' : 'bg-purple-700'} mr-3`}></div>
        {documentType === 'estimate' ? 'Estimated Services & Materials' : 'Services & Materials'}
      </h3>
      
      <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Description</th>
              <th className="px-6 py-4 text-center text-sm font-bold uppercase tracking-wider">Qty</th>
              <th className="px-6 py-4 text-right text-sm font-bold uppercase tracking-wider">Unit Price</th>
              <th className="px-6 py-4 text-right text-sm font-bold uppercase tracking-wider">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {lineItems.map((item, index) => (
              <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-5">
                  <div>
                    <p className="font-semibold text-gray-900 text-base">
                      {item.description || item.name}
                    </p>
                    {item.taxable && (
                      <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-700 rounded mt-1">
                        Taxable
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-5 text-center">
                  <span className="text-gray-900 font-semibold text-base">{item.quantity}</span>
                </td>
                <td className="px-6 py-5 text-right">
                  <span className="text-gray-900 font-semibold text-base">
                    {formatCurrency(item.unitPrice)}
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                  <span className="text-gray-900 font-bold text-lg">
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
