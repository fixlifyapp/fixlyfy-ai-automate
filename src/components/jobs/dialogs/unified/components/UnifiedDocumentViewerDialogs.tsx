
import React from "react";
import { Invoice } from "@/hooks/useInvoices";
import { Estimate } from "@/hooks/useEstimates";
import { UniversalSendDialog } from "../../shared/UniversalSendDialog";
import { SteppedInvoiceBuilder } from "../../SteppedInvoiceBuilder";
import { UnifiedDocumentBuilder } from "../../UnifiedDocumentBuilder";

interface UnifiedDocumentViewerDialogsProps {
  documentType: "invoice" | "estimate";
  document: Invoice | Estimate;
  jobId: string;
  showSendDialog: boolean;
  setShowSendDialog: (show: boolean) => void;
  showEditDialog: boolean;
  setShowEditDialog: (show: boolean) => void;
  showConvertDialog: boolean;
  setShowConvertDialog: (show: boolean) => void;
  documentNumber: string;
  calculateGrandTotal: () => number;
  getClientInfo: () => { name: string; email: string; phone: string };
  handleSendSuccess: () => void;
  handleEditSuccess: () => void;
  handleConvertSuccess: () => void;
}

export const UnifiedDocumentViewerDialogs = ({
  documentType,
  document,
  jobId,
  showSendDialog,
  setShowSendDialog,
  showEditDialog,
  setShowEditDialog,
  showConvertDialog,
  setShowConvertDialog,
  documentNumber,
  calculateGrandTotal,
  getClientInfo,
  handleSendSuccess,
  handleEditSuccess,
  handleConvertSuccess
}: UnifiedDocumentViewerDialogsProps) => {
  return (
    <>
      {/* Send Dialog */}
      <UniversalSendDialog
        isOpen={showSendDialog}
        onClose={() => setShowSendDialog(false)}
        documentType={documentType}
        documentId={document.id}
        documentNumber={documentNumber}
        total={calculateGrandTotal()}
        contactInfo={getClientInfo()}
        onSuccess={handleSendSuccess}
      />

      {/* Edit Dialog for Invoices */}
      {documentType === "invoice" && (
        <SteppedInvoiceBuilder
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          jobId={jobId}
          existingInvoice={document as Invoice}
          onInvoiceCreated={handleEditSuccess}
        />
      )}

      {/* Edit Dialog for Estimates */}
      {documentType === "estimate" && (
        <UnifiedDocumentBuilder
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          documentType="estimate"
          jobId={jobId}
          existingDocument={document as Estimate}
          onDocumentCreated={handleEditSuccess}
        />
      )}

      {/* Convert Estimate to Invoice Dialog */}
      {documentType === "estimate" && (
        <SteppedInvoiceBuilder
          open={showConvertDialog}
          onOpenChange={setShowConvertDialog}
          jobId={jobId}
          estimateToConvert={document as Estimate}
          onInvoiceCreated={handleConvertSuccess}
        />
      )}
    </>
  );
};
