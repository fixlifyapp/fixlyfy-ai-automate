
import React from "react";
import { EstimatePreviewWindowProps } from "./EstimatePreviewWindowProps";
import { UnifiedDocumentViewer } from "./UnifiedDocumentViewer";

export const EstimatePreviewWindow = ({
  open,
  onOpenChange,
  estimate,
  onConvertToInvoice
}: EstimatePreviewWindowProps) => {
  // Extract jobId from estimate or use a fallback
  const jobId = estimate.job_id || '';

  const handleConvertToInvoice = (estimateToConvert: any) => {
    if (onConvertToInvoice) {
      onConvertToInvoice(estimateToConvert);
    }
  };

  return (
    <UnifiedDocumentViewer
      open={open}
      onOpenChange={onOpenChange}
      document={estimate}
      documentType="estimate"
      jobId={jobId}
      onConvertToInvoice={handleConvertToInvoice}
    />
  );
};
