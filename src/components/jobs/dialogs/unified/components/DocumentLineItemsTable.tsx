
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
    <div className="px-4 sm:px-8 py-4 sm:py-6">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6 break-words">
        {documentType === 'estimate' ? 'Estimated Services & Materials' : 'Services & Materials'}
      </h3>
      
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900">Description</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-gray-900 w-16 sm:w-20">Qty</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-semibold text-gray-900 w-20 sm:w-28">Rate</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-semibold text-gray-900 w-24 sm:w-28">Amount</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, index) => (
                <tr key={item.id} className="border-t border-gray-200">
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div>
                      <p className="font-medium text-gray-900 text-xs sm:text-sm break-words">
                        {item.description || item.name}
                      </p>
                      {item.taxable && (
                        <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full mt-1 sm:mt-2">
                          Taxable
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                    <span className="text-gray-900 text-xs sm:text-sm">{item.quantity}</span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                    <span className="text-gray-900 text-xs sm:text-sm">
                      {formatCurrency(item.unitPrice)}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                    <span className="font-semibold text-gray-900 text-xs sm:text-sm">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
