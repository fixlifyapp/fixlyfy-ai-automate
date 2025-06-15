
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Send, Edit, ArrowRight } from "lucide-react";
import { Invoice } from "@/hooks/useInvoices";
import { Estimate } from "@/hooks/useEstimates";
import { useJobData } from "./unified/hooks/useJobData";
import { useDocumentPreviewData } from "./unified/hooks/useDocumentPreviewData";
import { UnifiedDocumentPreview } from "./unified/UnifiedDocumentPreview";
import { UniversalSendDialog } from "./shared/UniversalSendDialog";
import { SteppedInvoiceBuilder } from "./SteppedInvoiceBuilder";
import { UnifiedDocumentBuilder } from "./UnifiedDocumentBuilder";

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
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showConvertDialog, setShowConvertDialog] = useState(false);

  const { clientInfo, jobAddress, loading } = useJobData(jobId);
  
  // Calculate line items and totals
  const lineItems = Array.isArray(document.items) ? document.items : [];
  const taxRate = document.tax_rate || 0;
  
  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const calculateTotalTax = () => {
    const subtotal = calculateSubtotal();
    return subtotal * (taxRate / 100);
  };

  const calculateGrandTotal = () => {
    return calculateSubtotal() + calculateTotalTax();
  };

  const getClientInfo = () => {
    if (clientInfo) {
      return {
        name: clientInfo.name || '',
        email: clientInfo.email || '',
        phone: clientInfo.phone || ''
      };
    }
    return { name: '', email: '', phone: '' };
  };

  const handleEdit = () => {
    setShowEditDialog(true);
  };

  const handleSend = () => {
    setShowSendDialog(true);
  };

  const handleConvert = () => {
    if (documentType === "estimate" && onConvertToInvoice) {
      setShowConvertDialog(true);
    }
  };

  const handleSendSuccess = () => {
    setShowSendDialog(false);
    if (onDocumentUpdated) {
      onDocumentUpdated();
    }
  };

  const handleEditSuccess = () => {
    setShowEditDialog(false);
    if (onDocumentUpdated) {
      onDocumentUpdated();
    }
  };

  const handleConvertSuccess = () => {
    setShowConvertDialog(false);
    onOpenChange(false);
    if (onDocumentUpdated) {
      onDocumentUpdated();
    }
  };

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

  const documentNumber = documentType === "invoice" 
    ? (document as Invoice).invoice_number 
    : (document as Estimate).estimate_number;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
          {/* Header with Actions */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-xl font-semibold">
                {documentType === "invoice" ? "Invoice" : "Estimate"} Preview
              </h2>
              <p className="text-sm text-muted-foreground">#{documentNumber}</p>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => window.print()}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              
              <Button variant="outline" onClick={handleSend}>
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
              
              <Button variant="outline" onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              
              {documentType === "estimate" && onConvertToInvoice && (
                <Button onClick={handleConvert} className="gap-2">
                  Convert to Invoice
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Document Preview */}
          <div className="flex-1 overflow-auto">
            <UnifiedDocumentPreview
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
          </div>
        </DialogContent>
      </Dialog>

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
