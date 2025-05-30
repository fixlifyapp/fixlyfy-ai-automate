
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
    <div className="px-8 py-8 bg-gray-50">
      <div className="flex justify-end">
        <div className="w-80">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Subtotal</span>
                <span className="font-semibold text-gray-900">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Tax ({taxRate}%)</span>
                <span className="font-semibold text-gray-900">{formatCurrency(tax)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-fixlyfy">Total</span>
                  <span className="text-xl font-bold text-fixlyfy">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
