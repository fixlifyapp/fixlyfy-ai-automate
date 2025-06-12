
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, Save, FileText, DollarSign } from "lucide-react";
import { UnifiedItemsStep } from "./unified/UnifiedItemsStep";
import { UnifiedReviewStep } from "./unified/UnifiedReviewStep";
import { useUnifiedDocumentBuilder } from "./unified/useUnifiedDocumentBuilder";
import { Estimate } from "@/hooks/useEstimates";
import { Invoice } from "@/hooks/useInvoices";
import { toast } from "sonner";

export type DocumentType = "estimate" | "invoice";

interface UnifiedDocumentBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentType: DocumentType;
  jobId: string;
  existingDocument?: Estimate | Invoice;
  onDocumentCreated?: () => void;
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
  const [currentStep, setCurrentStep] = useState<"items" | "review">("items");
  
  const {
    // State
    lineItems,
    setLineItems,
    taxRate,
    setTaxRate,
    notes,
    setNotes,
    documentNumber,
    isInitialized,
    isSubmitting,

    // Data objects
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
    convertToInvoice
  } = useUnifiedDocumentBuilder({
    documentType,
    existingDocument,
    jobId,
    open,
    onSyncToInvoice
  });

  const handleSave = async () => {
    try {
      await saveDocumentChanges();
      toast.success(`${documentType === 'estimate' ? 'Estimate' : 'Invoice'} saved successfully`);
      onDocumentCreated?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving document:', error);
      toast.error('Failed to save document');
    }
  };

  const handleConvert = async () => {
    if (documentType !== 'estimate') return;
    
    try {
      await convertToInvoice();
      toast.success('Estimate converted to invoice successfully');
      onDocumentCreated?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error converting to invoice:', error);
      toast.error('Failed to convert estimate to invoice');
    }
  };

  if (!isInitialized) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {documentType === "estimate" ? <FileText className="h-5 w-5" /> : <DollarSign className="h-5 w-5" />}
            {existingDocument ? "Edit" : "Create"} {documentType === "estimate" ? "Estimate" : "Invoice"}
            <span className="text-sm font-mono text-muted-foreground">
              {documentNumber}
            </span>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={currentStep} onValueChange={(value) => setCurrentStep(value as "items" | "review")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="items">Items & Details</TabsTrigger>
            <TabsTrigger value="review">Review & Save</TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="space-y-4">
            <UnifiedItemsStep
              documentType={documentType}
              documentNumber={documentNumber}
              lineItems={lineItems}
              taxRate={taxRate}
              notes={notes}
              onLineItemsChange={setLineItems}
              onTaxRateChange={setTaxRate}
              onNotesChange={setNotes}
              onAddProduct={handleAddProduct}
              onRemoveLineItem={handleRemoveLineItem}
              onUpdateLineItem={handleUpdateLineItem}
              calculateSubtotal={calculateSubtotal}
              calculateTotalTax={calculateTotalTax}
              calculateGrandTotal={calculateGrandTotal}
            />
          </TabsContent>

          <TabsContent value="review" className="space-y-4">
            <UnifiedReviewStep
              documentType={documentType}
              documentNumber={documentNumber}
              jobData={jobData}
              lineItems={lineItems}
              taxRate={taxRate}
              notes={notes}
              calculateSubtotal={calculateSubtotal}
              calculateTotalTax={calculateTotalTax}
              calculateGrandTotal={calculateGrandTotal}
            />
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex gap-2">
            {currentStep === "review" && (
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep("items")}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to Items
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            {currentStep === "items" && (
              <Button 
                onClick={() => setCurrentStep("review")}
                className="gap-2"
              >
                Review
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}

            {currentStep === "review" && (
              <>
                <Button 
                  variant="outline" 
                  onClick={handleSave}
                  disabled={isSubmitting}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save {documentType === "estimate" ? "Estimate" : "Invoice"}
                </Button>

                {documentType === "estimate" && (
                  <Button 
                    onClick={handleConvert}
                    disabled={isSubmitting}
                    className="gap-2"
                  >
                    <DollarSign className="h-4 w-4" />
                    Convert to Invoice
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
