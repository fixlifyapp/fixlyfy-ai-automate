
import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Invoice } from "@/hooks/useInvoices";
import { Estimate } from "@/hooks/useEstimates";
import { useUnifiedDocumentViewer } from "./unified/hooks/useUnifiedDocumentViewer";
import { UnifiedDocumentViewerHeader } from "./unified/components/UnifiedDocumentViewerHeader";
import { UnifiedDocumentViewerContent } from "./unified/components/UnifiedDocumentViewerContent";
import { UnifiedDocumentViewerDialogs } from "./unified/components/UnifiedDocumentViewerDialogs";
import { useDocumentOperations } from "./unified/hooks/useDocumentOperations";
import { toast } from "sonner";

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
    handleSendSuccess,
    handleEditSuccess
  } = useUnifiedDocumentViewer({
    document,
    documentType,
    jobId,
    onConvertToInvoice,
    onDocumentUpdated
  });

  // Use document operations hook for conversion
  const { convertToInvoice, isSubmitting } = useDocumentOperations({
    documentType,
    existingDocument: document,
    jobId,
    formData: {
      documentNumber,
      items: lineItems.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxable: item.taxable
      })),
      notes: document.notes || '',
      status: document.status || 'draft',
      total: calculateGrandTotal()
    },
    lineItems,
    notes: document.notes || '',
    calculateGrandTotal
  });

  const handleConvert = async () => {
    if (documentType === "estimate" && !isSubmitting) {
      try {
        const newInvoice = await convertToInvoice();
        if (newInvoice && onConvertToInvoice) {
          onConvertToInvoice(document as Estimate);
        }
        if (onDocumentUpdated) {
          onDocumentUpdated();
        }
        // Close the viewer after successful conversion
        onOpenChange(false);
      } catch (error) {
        console.error('Error converting estimate to invoice:', error);
        toast.error('Failed to convert estimate to invoice');
      }
    }
  };

  console.log('UnifiedDocumentViewer Debug:', {
    documentType,
    documentNumber,
    lineItems: lineItems?.length || 0,
    document,
    loading
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

  // Format dates to show 24-hour format with date
  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const issueDate = documentType === "invoice" 
    ? formatDateTime((document as Invoice).issue_date || (document as Invoice).created_at)
    : formatDateTime((document as Estimate).created_at);

  const dueDate = documentType === "invoice" 
    ? formatDateTime((document as Invoice).due_date)
    : formatDateTime((document as Estimate).valid_until);

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
            issueDate={issueDate}
            dueDate={dueDate}
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
        showConvertDialog={false}
        setShowConvertDialog={() => {}}
        documentNumber={documentNumber}
        calculateGrandTotal={calculateGrandTotal}
        getClientInfo={getClientInfo}
        handleSendSuccess={handleSendSuccess}
        handleEditSuccess={handleEditSuccess}
        handleConvertSuccess={() => {}}
      />
    </>
  );
};
