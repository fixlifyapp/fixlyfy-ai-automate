
import React from "react";
import { DocumentPreviewHeader } from "./components/DocumentPreviewHeader";
import { DocumentInfoGrid } from "./components/DocumentInfoGrid";
import { DocumentLineItemsTable } from "./components/DocumentLineItemsTable";
import { DocumentTotalsSection } from "./components/DocumentTotalsSection";
import { NotesSection } from "./components/NotesSection";
import { DocumentType } from "../UnifiedDocumentBuilder";
import { LineItem } from "../../builder/types";

interface UnifiedReviewStepProps {
  documentType: DocumentType;
  documentNumber: string;
  jobData: {
    id: string;
    title: string;
    client?: any;
    description?: string;
  };
  lineItems: LineItem[];
  taxRate: number;
  notes: string;
  calculateSubtotal: () => number;
  calculateTotalTax: () => number;
  calculateGrandTotal: () => number;
}

export const UnifiedReviewStep = ({
  documentType,
  documentNumber,
  jobData,
  lineItems,
  taxRate,
  notes,
  calculateSubtotal,
  calculateTotalTax,
  calculateGrandTotal
}: UnifiedReviewStepProps) => {
  return (
    <div className="space-y-6">
      <DocumentPreviewHeader
        documentType={documentType}
        documentNumber={documentNumber}
        jobData={jobData}
      />

      <DocumentInfoGrid
        jobData={jobData}
        documentType={documentType}
      />

      <DocumentLineItemsTable
        lineItems={lineItems}
        documentType={documentType}
      />

      <DocumentTotalsSection
        subtotal={calculateSubtotal()}
        taxRate={taxRate}
        taxAmount={calculateTotalTax()}
        total={calculateGrandTotal()}
      />

      {notes && (
        <NotesSection notes={notes} />
      )}
    </div>
  );
};
