
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
    <div className="px-8 py-8">
      <h3 className="text-lg font-bold text-fixlyfy mb-6 uppercase tracking-wide">
        {documentType === 'estimate' ? 'Estimated Services & Materials' : 'Services & Materials'}
      </h3>
      
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="w-full">
          <thead className="bg-fixlyfy text-white">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Description</th>
              <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">Qty</th>
              <th className="px-6 py-4 text-right text-sm font-semibold uppercase tracking-wider">Unit Price</th>
              <th className="px-6 py-4 text-right text-sm font-semibold uppercase tracking-wider">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {lineItems.map((item, index) => (
              <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">
                      {item.description || item.name}
                    </p>
                    {item.taxable && (
                      <span className="inline-block px-2 py-1 text-xs bg-fixlyfy/10 text-fixlyfy rounded-full mt-1 font-medium">
                        Taxable
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-gray-900 font-medium">{item.quantity}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-gray-900 font-medium">
                    {formatCurrency(item.unitPrice)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-gray-900 font-semibold">
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
