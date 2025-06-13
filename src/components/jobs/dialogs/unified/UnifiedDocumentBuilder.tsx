
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, FileText, DollarSign, Shield, Send } from "lucide-react";
import { UnifiedItemsStep } from "./UnifiedItemsStep";
import { WarrantyUpsellStep } from "./WarrantyUpsellStep";
import { SendDocumentStep } from "./SendDocumentStep";
import { useUnifiedDocumentBuilder } from "./useUnifiedDocumentBuilder";
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

const STEPS = [
  { id: 'items', title: 'Items & Details', icon: FileText },
  { id: 'warranties', title: 'Warranties', icon: Shield },
  { id: 'send', title: 'Send Document', icon: Send }
] as const;

type StepId = typeof STEPS[number]['id'];

export const UnifiedDocumentBuilder = ({
  open,
  onOpenChange,
  documentType,
  jobId,
  existingDocument,
  onDocumentCreated,
  onSyncToInvoice
}: UnifiedDocumentBuilderProps) => {
  const [currentStep, setCurrentStep] = useState<StepId>("items");
  const [selectedWarranties, setSelectedWarranties] = useState<string[]>([]);
  
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

  const currentStepIndex = STEPS.findIndex(step => step.id === currentStep);
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100;

  const handleAddWarranty = (warranty: any) => {
    const warrantyLineItem = {
      id: `warranty-${warranty.id}-${Date.now()}`,
      description: warranty.name,
      quantity: 1,
      unitPrice: warranty.price,
      total: warranty.price,
      taxable: false,
      ourPrice: warranty.cost,
      name: warranty.name,
      price: warranty.price,
      discount: 0
    };

    setLineItems(prev => [...prev, warrantyLineItem]);
    setSelectedWarranties(prev => [...prev, warranty.id]);
  };

  const handleRemoveWarranty = (warrantyId: string) => {
    setLineItems(prev => prev.filter(item => !item.id.includes(`warranty-${warrantyId}`)));
    setSelectedWarranties(prev => prev.filter(id => id !== warrantyId));
  };

  const handleNext = async () => {
    if (currentStep === 'items') {
      setCurrentStep('warranties');
    } else if (currentStep === 'warranties') {
      // Save document before proceeding to send step
      const saved = await saveDocumentChanges();
      if (saved) {
        setCurrentStep('send');
      }
    }
  };

  const handleBack = () => {
    if (currentStep === 'warranties') {
      setCurrentStep('items');
    } else if (currentStep === 'send') {
      setCurrentStep('warranties');
    }
  };

  const handleSendSuccess = () => {
    onDocumentCreated?.();
    onOpenChange(false);
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
            <Badge variant="outline" className="font-mono">
              {documentNumber}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="px-6 pb-4">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((step, index) => (
              <div 
                key={step.id}
                className={`flex items-center gap-2 ${
                  index <= currentStepIndex ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index <= currentStepIndex ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}>
                  {index < currentStepIndex ? '✓' : index + 1}
                </div>
                <span className="text-sm font-medium hidden sm:block">{step.title}</span>
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto">
          {currentStep === "items" && (
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
          )}

          {currentStep === "warranties" && (
            <WarrantyUpsellStep
              lineItems={lineItems}
              onAddWarranty={handleAddWarranty}
              onRemoveWarranty={handleRemoveWarranty}
              onContinue={handleNext}
              onBack={handleBack}
              selectedWarranties={selectedWarranties}
            />
          )}

          {currentStep === "send" && (
            <SendDocumentStep
              documentType={documentType}
              documentNumber={documentNumber}
              jobData={jobData}
              lineItems={lineItems}
              taxRate={taxRate}
              notes={notes}
              total={calculateGrandTotal()}
              onSave={saveDocumentChanges}
              onBack={handleBack}
              onSuccess={handleSendSuccess}
            />
          )}
        </div>

        {/* Navigation Footer */}
        <div className="flex items-center justify-between p-6 border-t">
          <div className="flex gap-2">
            {currentStep !== 'items' && (
              <Button 
                variant="outline" 
                onClick={handleBack}
                className="gap-2"
                disabled={isSubmitting}
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            {currentStep === 'items' && (
              <Button 
                onClick={handleNext}
                className="gap-2"
                disabled={lineItems.length === 0}
              >
                Add Warranties
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
            
            {currentStep === 'warranties' && (
              <Button 
                onClick={handleNext}
                className="gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Continue to Send'}
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
