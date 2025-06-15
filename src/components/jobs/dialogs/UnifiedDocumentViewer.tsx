
import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Invoice } from "@/hooks/useInvoices";
import { Estimate } from "@/hooks/useEstimates";
import { useUnifiedDocumentViewer } from "./unified/hooks/useUnifiedDocumentViewer";
import { UnifiedDocumentViewerHeader } from "./unified/components/UnifiedDocumentViewerHeader";
import { UnifiedDocumentViewerContent } from "./unified/components/UnifiedDocumentViewerContent";
import { UnifiedDocumentViewerDialogs } from "./unified/components/UnifiedDocumentViewerDialogs";

interface UnifiedDocumentViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: Invoice | Estimate;
  documentType: "invoice" | "estimate";
  jobId: string;
  onEdit?: () => void;
  onConvertToInvoice?: (estimate: Estimate) => void;
  onDocumentUpdated?: () => void;
}

export const UnifiedDocumentViewer = ({
  open,
  onOpenChange,
  document,
  documentType,
  jobId,
  onEdit,
  onConvertToInvoice,
  onDocumentUpdated
}: UnifiedDocumentViewerProps) => {
  const {
    showSendDialog,
    setShowSendDialog,
    showEditDialog,
    setShowEditDialog,
    showConvertDialog,
    setShowConvertDialog,
    clientInfo,
    loading,
    lineItems,
    taxRate,
    documentNumber,
    calculateSubtotal,
    calculateTotalTax,
    calculateGrandTotal,
    getClientInfo,
    handleEdit,
    handleSend,
    handleConvert,
    handleSendSuccess,
    handleEditSuccess,
    handleConvertSuccess
  } = useUnifiedDocumentViewer({
    document,
    documentType,
    jobId,
    onConvertToInvoice,
    onDocumentUpdated
  });

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const showConvertButton = documentType === "estimate" && !!onConvertToInvoice;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
          <UnifiedDocumentViewerHeader
            documentType={documentType}
            documentNumber={documentNumber}
            onEdit={handleEdit}
            onSend={handleSend}
            onConvert={handleConvert}
            showConvertButton={showConvertButton}
          />

          <UnifiedDocumentViewerContent
            documentType={documentType}
            documentNumber={documentNumber}
            lineItems={lineItems}
            taxRate={taxRate}
            calculateSubtotal={calculateSubtotal}
            calculateTotalTax={calculateTotalTax}
            calculateGrandTotal={calculateGrandTotal}
            notes={document.notes || ''}
            clientInfo={clientInfo}
            jobId={jobId}
            issueDate={documentType === "invoice" 
              ? (document as Invoice).issue_date 
              : (document as Estimate).created_at
            }
            dueDate={documentType === "invoice" 
              ? (document as Invoice).due_date 
              : (document as Estimate).valid_until
            }
          />
        </DialogContent>
      </Dialog>

      <UnifiedDocumentViewerDialogs
        documentType={documentType}
        document={document}
        jobId={jobId}
        showSendDialog={showSendDialog}
        setShowSendDialog={setShowSendDialog}
        showEditDialog={showEditDialog}
        setShowEditDialog={setShowEditDialog}
        showConvertDialog={showConvertDialog}
        setShowConvertDialog={setShowConvertDialog}
        documentNumber={documentNumber}
        calculateGrandTotal={calculateGrandTotal}
        getClientInfo={getClientInfo}
        handleSendSuccess={handleSendSuccess}
        handleEditSuccess={handleEditSuccess}
        handleConvertSuccess={handleConvertSuccess}
      />
    </>
  );
};
