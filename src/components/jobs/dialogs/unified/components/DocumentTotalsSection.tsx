
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
  return (
    <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
      <div className="flex justify-end">
        <div className="w-80">
          <div className="space-y-2">
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-700">Subtotal</span>
              <span className="text-gray-900 font-medium">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-700">Tax ({taxRate}%)</span>
              <span className="text-gray-900 font-medium">{formatCurrency(tax)}</span>
            </div>
            <div className="border-t border-gray-300 pt-2">
              <div className="flex justify-between items-center py-2">
                <span className="text-lg font-semibold text-gray-900">Total</span>
                <span className="text-lg font-semibold text-fixlyfy">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
