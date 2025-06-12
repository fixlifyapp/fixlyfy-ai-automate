
import React, { useState } from "react";
import { DocumentManagement } from "../documents/DocumentManagement";
import { UnifiedDocumentBuilder } from "../dialogs/UnifiedDocumentBuilder";

interface ModernJobDocumentsTabProps {
  jobId: string;
}

export const ModernJobDocumentsTab = ({ jobId }: ModernJobDocumentsTabProps) => {
  const [showEstimateBuilder, setShowEstimateBuilder] = useState(false);
  const [showInvoiceBuilder, setShowInvoiceBuilder] = useState(false);

  const handleCreateEstimate = () => {
    setShowEstimateBuilder(true);
  };

  const handleCreateInvoice = () => {
    setShowInvoiceBuilder(true);
  };

  const handleDocumentCreated = () => {
    setShowEstimateBuilder(false);
    setShowInvoiceBuilder(false);
    // Refresh data if needed
  };

  return (
    <>
      <DocumentManagement
        jobId={jobId}
        onCreateEstimate={handleCreateEstimate}
        onCreateInvoice={handleCreateInvoice}
      />

      {/* Estimate Builder */}
      <UnifiedDocumentBuilder
        open={showEstimateBuilder}
        onOpenChange={setShowEstimateBuilder}
        documentType="estimate"
        jobId={jobId}
        onDocumentCreated={handleDocumentCreated}
      />

      {/* Invoice Builder */}
      <UnifiedDocumentBuilder
        open={showInvoiceBuilder}
        onOpenChange={setShowInvoiceBuilder}
        documentType="invoice"
        jobId={jobId}
        onDocumentCreated={handleDocumentCreated}
      />
    </>
  );
};
