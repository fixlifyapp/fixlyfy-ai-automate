
import React from "react";
import { formatCurrency } from "@/lib/utils";
import { DocumentType } from "../../UnifiedDocumentBuilder";

interface DocumentTotalsSectionProps {
  documentType: DocumentType;
  subtotal: number;
  tax: number;
  total: number;
  taxRate: number;
}

export const DocumentTotalsSection = ({
  documentType,
  subtotal,
  tax,
  total,
  taxRate
}: DocumentTotalsSectionProps) => {
  const documentColor = documentType === 'estimate' ? 'text-blue-700' : 'text-purple-700';

  return (
    <div className="px-8 py-8 bg-gray-50 border-t">
      <div className="flex justify-end">
        <div className="w-96">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center text-lg">
                <span className="font-medium text-gray-700">Subtotal:</span>
                <span className="font-semibold text-gray-900">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-lg">
                <span className="font-medium text-gray-700">Tax ({taxRate}%):</span>
                <span className="font-semibold text-gray-900">{formatCurrency(tax)}</span>
              </div>
              <div className="border-t-2 border-gray-200 pt-4">
                <div className={`flex justify-between items-center text-2xl font-bold ${documentColor}`}>
                  <span>Total:</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
