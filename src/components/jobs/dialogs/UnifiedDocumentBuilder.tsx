
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, FileText, DollarSign, Calculator } from "lucide-react";
import { toast } from "sonner";
import { useUnifiedDocumentBuilder } from "./unified/useUnifiedDocumentBuilder";
import { UnifiedItemsStep } from "./unified/UnifiedItemsStep";
import { EstimatePreviewStep } from "./unified/EstimatePreviewStep";
import { InvoicePreviewStep } from "./unified/InvoicePreviewStep";
import { formatCurrency } from "@/lib/utils";

export type DocumentType = "estimate" | "invoice";

interface UnifiedDocumentBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentType: DocumentType;
  jobId: string;
  existingDocument?: any; // Use generic type to handle both estimates and invoices
  onDocumentCreated?: (document?: any) => void;
  onSyncToInvoice?: () => void;
}

export const UnifiedDocumentBuilder = ({
  open,
  onOpenChange,
  documentType,
  jobId,
  existingDocument,
  onDocumentCreated,
  onSyncToInvoice
}: UnifiedDocumentBuilderProps) => {
  const [currentStep, setCurrentStep] = useState<"items" | "preview">("items");
  const [isSaving, setIsSaving] = useState(false);

  // Transform existing document to match expected types
  const transformedDocument = existingDocument ? {
    ...existingDocument,
    // Add missing properties for Invoice type
    ...(documentType === "invoice" && {
      invoice_number: existingDocument.invoice_number || existingDocument.estimate_number || `INV-${Date.now()}`,
      number: existingDocument.number || existingDocument.invoice_number || existingDocument.estimate_number,
      date: existingDocument.date || existingDocument.created_at,
      amount_paid: existingDocument.amount_paid || 0,
      balance: existingDocument.balance || existingDocument.total || 0
    }),
    // Add missing properties for Estimate type
    ...(documentType === "estimate" && {
      amount: existingDocument.amount || existingDocument.total || 0,
      number: existingDocument.number || existingDocument.estimate_number,
      date: existingDocument.date || existingDocument.created_at
    })
  } : undefined;

  const {
    // State
    lineItems,
    taxRate,
    notes,
    documentNumber,
    isInitialized,
    isSubmitting,

    // Data objects
    formData,
    jobData,

    // Calculations
    calculateSubtotal,
    calculateTotalTax,
    calculateGrandTotal,

    // Line item actions
    handleAddProduct,
    handleRemoveLineItem,
    handleUpdateLineItem,

    // Document operations
    saveDocumentChanges,
    convertToInvoice,

    // Setters
    setTaxRate,
    setNotes
  } = useUnifiedDocumentBuilder({
    documentType,
    existingDocument: transformedDocument,
    jobId,
    open,
    onSyncToInvoice
  });

  // Reset to items step when dialog opens
  useEffect(() => {
    if (open) {
      setCurrentStep("items");
    }
  }, [open]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const savedDocument = await saveDocumentChanges();
      
      if (savedDocument && onDocumentCreated) {
        onDocumentCreated(savedDocument);
      }
      
      toast.success(`${documentType} saved successfully`);
      onOpenChange(false);
    } catch (error: any) {
      console.error(`Error saving ${documentType}:`, error);
      toast.error(`Failed to save ${documentType}: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConvertToInvoice = async () => {
    if (documentType !== "estimate") return;
    
    try {
      const invoice = await convertToInvoice();
      if (invoice && onDocumentCreated) {
        onDocumentCreated(invoice);
      }
      toast.success("Estimate converted to invoice successfully");
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error converting to invoice:", error);
      toast.error(`Failed to convert to invoice: ${error.message}`);
    }
  };

  const canProceedToPreview = lineItems.length > 0;

  const renderStepContent = () => {
    switch (currentStep) {
      case "items":
        return (
          <UnifiedItemsStep
            documentType={documentType}
            documentNumber={documentNumber}
            lineItems={lineItems}
            taxRate={taxRate}
            notes={notes}
            onLineItemsChange={() => {}} // Handled internally by the hook
            onTaxRateChange={setTaxRate}
            onNotesChange={setNotes}
            onAddProduct={handleAddProduct}
            onRemoveLineItem={handleRemoveLineItem}
            onUpdateLineItem={handleUpdateLineItem}
            calculateSubtotal={calculateSubtotal}
            calculateTotalTax={calculateTotalTax}
            calculateGrandTotal={calculateGrandTotal}
          />
        );
      case "preview":
        if (documentType === "estimate") {
          return (
            <EstimatePreviewStep
              estimateNumber={documentNumber}
              lineItems={lineItems}
              subtotal={calculateSubtotal()}
              taxAmount={calculateTotalTax()}
              total={calculateGrandTotal()}
              notes={notes}
              jobData={jobData}
              onSave={handleSave}
              onConvertToInvoice={handleConvertToInvoice}
              onBack={() => setCurrentStep("items")}
              isSaving={isSaving}
            />
          );
        } else {
          return (
            <InvoicePreviewStep
              invoiceNumber={documentNumber}
              lineItems={lineItems}
              subtotal={calculateSubtotal()}
              taxAmount={calculateTotalTax()}
              total={calculateGrandTotal()}
              notes={notes}
              jobData={jobData}
              onSave={handleSave}
              onBack={() => setCurrentStep("items")}
              isSaving={isSaving}
            />
          );
        }
      default:
        return null;
    }
  };

  const getTitle = () => {
    if (existingDocument) {
      return `Edit ${documentType === "estimate" ? "Estimate" : "Invoice"}`;
    }
    return `Create ${documentType === "estimate" ? "Estimate" : "Invoice"}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center gap-2">
            {documentType === "estimate" ? (
              <FileText className="h-5 w-5" />
            ) : (
              <DollarSign className="h-5 w-5" />
            )}
            {getTitle()}
            {documentNumber && (
              <span className="text-sm text-muted-foreground">
                #{documentNumber}
              </span>
            )}
          </DialogTitle>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        {/* Step Navigation */}
        <div className="flex items-center justify-center space-x-8 py-4 border-b">
          <button
            onClick={() => setCurrentStep("items")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              currentStep === "items"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Calculator className="h-4 w-4" />
            Items & Pricing
          </button>
          <button
            onClick={() => canProceedToPreview && setCurrentStep("preview")}
            disabled={!canProceedToPreview}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              currentStep === "preview"
                ? "bg-primary text-primary-foreground"
                : canProceedToPreview
                ? "text-muted-foreground hover:text-foreground"
                : "text-muted-foreground/50 cursor-not-allowed"
            }`}
          >
            <FileText className="h-4 w-4" />
            Preview & Send
          </button>
        </div>

        {/* Step Content */}
        <div className="py-6">
          {isInitialized ? renderStepContent() : (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
        </div>

        {/* Summary Footer */}
        {currentStep === "items" && lineItems.length > 0 && (
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {lineItems.length} item{lineItems.length !== 1 ? "s" : ""} • 
                Subtotal: {formatCurrency(calculateSubtotal())} • 
                Tax: {formatCurrency(calculateTotalTax())}
              </div>
              <div className="flex items-center gap-4">
                <span className="text-lg font-semibold">
                  Total: {formatCurrency(calculateGrandTotal())}
                </span>
                <Button 
                  onClick={() => setCurrentStep("preview")}
                  disabled={!canProceedToPreview || isSubmitting}
                >
                  Continue to Preview
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
