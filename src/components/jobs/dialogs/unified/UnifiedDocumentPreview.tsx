
import React from "react";
import { DocumentPreviewHeader } from "./components/DocumentPreviewHeader";
import { DocumentInfoGrid } from "./components/DocumentInfoGrid";
import { DocumentLineItemsTable } from "./components/DocumentLineItemsTable";
import { DocumentTotalsSection } from "./components/DocumentTotalsSection";
import { DocumentPreviewFooter } from "./components/DocumentPreviewFooter";
import { NotesSection } from "./components/NotesSection";

export type DocumentType = "estimate" | "invoice";

export interface UnifiedDocumentPreviewProps {
  documentType: DocumentType;
  documentNumber: string;
  lineItems: any[];
  calculateSubtotal: () => number;
  calculateTotalTax: () => number;
  calculateGrandTotal: () => number;
  notes: string;
  issueDate: string;
  dueDate: string;
  jobInfo?: any;
  clientInfo?: any;
  companyInfo?: any;
}

export const UnifiedDocumentPreview = ({
  documentType,
  documentNumber,
  lineItems,
  calculateSubtotal,
  calculateTotalTax,
  calculateGrandTotal,
  notes,
  issueDate,
  dueDate,
  jobInfo,
  clientInfo,
  companyInfo
}: UnifiedDocumentPreviewProps) => {
  return (
    <div className="bg-white p-8 max-w-4xl mx-auto border border-gray-200 rounded-lg">
      <DocumentPreviewHeader 
        documentType={documentType}
        documentNumber={documentNumber}
        companyInfo={companyInfo}
      />
      
      <DocumentInfoGrid
        documentType={documentType}
        issueDate={issueDate}
        dueDate={dueDate}
        jobInfo={jobInfo}
        clientInfo={clientInfo}
      />
      
      <DocumentLineItemsTable lineItems={lineItems} />
      
      <DocumentTotalsSection
        subtotal={calculateSubtotal()}
        taxAmount={calculateTotalTax()}
        total={calculateGrandTotal()}
      />
      
      <NotesSection notes={notes} />
      
      <DocumentPreviewFooter 
        documentType={documentType}
        companyInfo={companyInfo}
      />
    </div>
  );
};
