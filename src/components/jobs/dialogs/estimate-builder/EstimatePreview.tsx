
import React from "react";
import { LineItem } from "@/components/jobs/builder/types";
import { UnifiedDocumentPreview } from "../unified/UnifiedDocumentPreview";

interface EstimatePreviewProps {
  estimateNumber: string;
  lineItems: LineItem[];
  notes: string;
  taxRate: number;
  calculateSubtotal: () => number;
  calculateTotalTax: () => number;
  calculateGrandTotal: () => number;
  jobId?: string;
  clientInfo?: {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  } | null;
}

export const EstimatePreview = ({
  estimateNumber,
  lineItems,
  notes,
  taxRate,
  calculateSubtotal,
  calculateTotalTax,
  calculateGrandTotal,
  jobId,
  clientInfo,
}: EstimatePreviewProps) => {
  return (
    <UnifiedDocumentPreview
      documentType="estimate"
      documentNumber={estimateNumber}
      lineItems={lineItems}
      taxRate={taxRate}
      calculateSubtotal={calculateSubtotal}
      calculateTotalTax={calculateTotalTax}
      calculateGrandTotal={calculateGrandTotal}
      notes={notes}
      clientInfo={clientInfo}
      issueDate={new Date().toLocaleDateString()}
    />
  );
};
