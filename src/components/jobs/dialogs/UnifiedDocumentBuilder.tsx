
import React from "react";
import { UnifiedDocumentBuilder3Step } from "./unified/UnifiedDocumentBuilder3Step";
import { Estimate } from "@/hooks/useEstimates";
import { Invoice } from "@/hooks/useInvoices";

export type DocumentType = "estimate" | "invoice";

interface UnifiedDocumentBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentType: DocumentType;
  jobId: string;
  existingDocument?: Invoice | Estimate;
  estimateToConvert?: Estimate;
  onDocumentCreated?: (document: Invoice | Estimate) => void;
}

export const UnifiedDocumentBuilder = (props: UnifiedDocumentBuilderProps) => {
  return <UnifiedDocumentBuilder3Step {...props} />;
};
