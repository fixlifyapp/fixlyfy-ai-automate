
import React from "react";
import { formatCurrency } from "@/lib/utils";
import { DocumentType } from "../../UnifiedDocumentBuilder";
import { useTaxSettings } from "@/hooks/useTaxSettings";

interface DocumentTotalsSectionProps {
  documentType: DocumentType;
  subtotal: number;
  tax: number;
  total: number;
}

export const DocumentTotalsSection = ({
  documentType,
  subtotal,
  tax,
  total
}: DocumentTotalsSectionProps) => {
  const { taxConfig } = useTaxSettings();
  const totalColor = documentType === 'estimate' ? 'text-blue-600' : 'text-green-600';
  const totalBg = documentType === 'estimate' ? 'bg-blue-50' : 'bg-green-50';

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
              <span className="text-gray-700">
                {taxConfig.label} ({taxConfig.rate}%)
              </span>
              <span className="font-medium text-gray-900">{formatCurrency(tax)}</span>
            </div>
            
            <div className="border-t border-gray-200 pt-3">
              <div className={`flex justify-between items-center p-3 rounded-lg ${totalBg}`}>
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className={`text-xl font-bold ${totalColor}`}>
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
