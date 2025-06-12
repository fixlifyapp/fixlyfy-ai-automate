
import React from "react";
import { formatCurrency } from "@/lib/utils";

interface DocumentTotalsSectionProps {
  subtotal: number;
  taxRate: number;
  tax_amount: number;
  total: number;
}

export const DocumentTotalsSection = ({
  subtotal,
  taxRate,
  tax_amount,
  total
}: DocumentTotalsSectionProps) => {
  return (
    <div className="px-8 py-6 bg-gray-50">
      <div className="flex justify-end">
        <div className="w-80 bg-white rounded-lg border border-gray-200 p-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Subtotal</span>
              <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Tax ({(taxRate * 100).toFixed(1)}%)</span>
              <span className="font-medium text-gray-900">{formatCurrency(tax_amount)}</span>
            </div>
            
            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between items-center p-3 rounded-lg bg-blue-50">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-xl font-bold text-blue-600">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
