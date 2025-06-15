
import React from "react";
import { LineItem } from "../../builder/types";
import { DocumentType } from "../UnifiedDocumentBuilder";
import { useDocumentPreviewData } from "./hooks/useDocumentPreviewData";
import { DocumentPreviewHeader } from "./components/DocumentPreviewHeader";
import { DocumentInfoGrid } from "./components/DocumentInfoGrid";
import { DocumentLineItemsTable } from "./components/DocumentLineItemsTable";
import { DocumentTotalsSection } from "./components/DocumentTotalsSection";
import { DocumentPreviewFooter } from "./components/DocumentPreviewFooter";

interface UnifiedDocumentPreviewProps {
  documentType: DocumentType;
  documentNumber: string;
  lineItems: LineItem[];
  taxRate?: number; // Make optional since we'll use locked rate
  calculateSubtotal: () => number;
  calculateTotalTax: () => number;
  calculateGrandTotal: () => number;
  notes: string;
  clientInfo?: any;
  issueDate?: string;
  dueDate?: string;
  jobId?: string;
}

// Lock tax rate to 13%
const LOCKED_TAX_RATE = 13;

export const UnifiedDocumentPreview = ({
  documentType,
  documentNumber,
  lineItems,
  calculateSubtotal,
  calculateTotalTax,
  calculateGrandTotal,
  notes,
  clientInfo,
  issueDate,
  dueDate,
  jobId
}: UnifiedDocumentPreviewProps) => {
  console.log('=== UnifiedDocumentPreview Debug ===');
  console.log('JobId prop received:', jobId);
  console.log('ClientInfo prop received:', clientInfo);
  console.log('Document type:', documentType);

  const { companyInfo, enhancedClientInfo, jobAddress, loading } = useDocumentPreviewData({
    clientInfo,
    jobId,
    documentNumber,
    documentType
  });

  console.log('Enhanced client info from hook:', enhancedClientInfo);
  console.log('Job address from hook:', jobAddress);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto bg-white shadow-2xl border border-gray-200">
        <div className="animate-pulse space-y-8 p-8">
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const subtotal = calculateSubtotal();
  const tax = calculateTotalTax();
  const total = calculateGrandTotal();

  const documentColor = documentType === 'estimate' ? 'text-blue-700' : 'text-purple-700';

  return (
    <div className="max-w-5xl mx-auto bg-white shadow-2xl border border-gray-200 print:shadow-none print:border-gray-300">
      <DocumentPreviewHeader
        documentType={documentType}
        documentNumber={documentNumber}
        companyInfo={companyInfo}
      />

      <DocumentInfoGrid
        documentType={documentType}
        enhancedClientInfo={enhancedClientInfo}
        jobAddress={jobAddress}
        issueDate={issueDate}
        dueDate={dueDate}
        taxRate={LOCKED_TAX_RATE}
        companyInfo={companyInfo}
      />

      <DocumentLineItemsTable
        documentType={documentType}
        lineItems={lineItems}
      />

      <DocumentTotalsSection
        documentType={documentType}
        subtotal={subtotal}
        tax={tax}
        total={total}
        taxRate={LOCKED_TAX_RATE}
      />

      {/* Notes Section */}
      {notes && (
        <div className="px-8 py-8 border-t">
          <h3 className={`font-bold text-xl ${documentColor} mb-4 flex items-center`}>
            <div className={`w-1 h-6 ${documentType === 'estimate' ? 'bg-blue-700' : 'bg-purple-700'} mr-3`}></div>
            Notes & Instructions
          </h3>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-base">{notes}</p>
          </div>
        </div>
      )}

      <DocumentPreviewFooter
        documentType={documentType}
        companyInfo={companyInfo}
      />
    </div>
  );
};
