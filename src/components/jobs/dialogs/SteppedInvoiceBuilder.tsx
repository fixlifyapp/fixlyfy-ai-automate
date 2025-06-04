
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { InvoiceItemsStep } from "./invoice-builder/InvoiceItemsStep";
import { InvoiceSendStep } from "./invoice-builder/InvoiceSendStep";
import { useInvoiceBuilder } from "../hooks/useInvoiceBuilder";
import { Estimate } from "@/hooks/useEstimates";
import { Invoice } from "@/hooks/useInvoices";

interface SteppedInvoiceBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  existingInvoice?: Invoice;
  estimateToConvert?: Estimate;
  onInvoiceCreated?: (invoice: Invoice) => void;
}

export const SteppedInvoiceBuilder = ({
  open,
  onOpenChange,
  jobId,
  existingInvoice,
  estimateToConvert,
  onInvoiceCreated
}: SteppedInvoiceBuilderProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleting, setIsCompleting] = useState(false);

  const {
    formData,
    lineItems,
    taxRate,
    notes,
    invoiceNumber,
    isSubmitting,
    setLineItems,
    setTaxRate,
    setNotes,
    handleAddProduct,
    handleRemoveLineItem,
    handleUpdateLineItem,
    calculateSubtotal,
    calculateTotalTax,
    calculateGrandTotal,
    saveInvoiceChanges,
    resetForm,
    initializeFromEstimate,
    initializeFromInvoice
  } = useInvoiceBuilder(jobId);

  // Initialize form data when dialog opens
  useEffect(() => {
    if (open) {
      if (existingInvoice) {
        initializeFromInvoice(existingInvoice);
      } else if (estimateToConvert) {
        initializeFromEstimate(estimateToConvert);
      } else {
        resetForm();
      }
      setCurrentStep(1);
    }
  }, [open, existingInvoice, estimateToConvert, initializeFromEstimate, initializeFromInvoice, resetForm]);

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveAndSend = async () => {
    setIsCompleting(true);
    try {
      const savedInvoice = await saveInvoiceChanges();
      if (savedInvoice && onInvoiceCreated) {
        onInvoiceCreated(savedInvoice);
      }
      return savedInvoice !== null;
    } catch (error) {
      console.error("Error saving invoice:", error);
      return false;
    } finally {
      setIsCompleting(false);
    }
  };

  const steps = [
    { number: 1, title: "Items & Pricing", description: "Add line items and set pricing" },
    { number: 2, title: "Send Invoice", description: "Review and send to client" }
  ];

  const isStepComplete = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return lineItems.length > 0;
      case 2:
        return false; // Send step is never "complete" until actually sent
      default:
        return false;
    }
  };

  const canProceedToNext = () => {
    return isStepComplete(currentStep);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {existingInvoice ? "Edit Invoice" : estimateToConvert ? "Convert Estimate to Invoice" : "Create New Invoice"}
          </DialogTitle>
          
          {/* Step Indicator */}
          <div className="flex items-center justify-center space-x-4 py-4">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  currentStep === step.number
                    ? "border-primary bg-primary text-primary-foreground"
                    : isStepComplete(step.number)
                    ? "border-green-500 bg-green-500 text-white"
                    : "border-gray-300 bg-white text-gray-500"
                }`}>
                  {isStepComplete(step.number) ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span className="text-sm font-medium">{step.number}</span>
                  )}
                </div>
                
                <div className="ml-3 text-left">
                  <div className={`text-sm font-medium ${
                    currentStep === step.number ? "text-primary" : "text-gray-500"
                  }`}>
                    Step {step.number} of {steps.length}
                  </div>
                  <div className="text-xs text-gray-500">{step.title}</div>
                </div>
                
                {index < steps.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-gray-400 mx-4" />
                )}
              </div>
            ))}
          </div>
        </DialogHeader>
        
        <div className="py-6">
          {currentStep === 1 && (
            <InvoiceItemsStep
              lineItems={lineItems}
              taxRate={taxRate}
              notes={notes}
              onAddProduct={handleAddProduct}
              onRemoveLineItem={handleRemoveLineItem}
              onUpdateLineItem={handleUpdateLineItem}
              onTaxRateChange={setTaxRate}
              onNotesChange={setNotes}
              calculateSubtotal={calculateSubtotal}
              calculateTotalTax={calculateTotalTax}
              calculateGrandTotal={calculateGrandTotal}
            />
          )}
          
          {currentStep === 2 && (
            <InvoiceSendStep
              invoiceNumber={invoiceNumber}
              lineItems={lineItems}
              notes={notes}
              total={calculateGrandTotal()}
              jobId={jobId}
              onSave={handleSaveAndSend}
              onClose={() => onOpenChange(false)}
            />
          )}
        </div>
        
        {/* Navigation Footer */}
        <div className="flex justify-between items-center pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          
          <div className="text-sm text-gray-500">
            Step {currentStep} of {steps.length}
          </div>
          
          {currentStep < steps.length ? (
            <Button
              onClick={handleNext}
              disabled={!canProceedToNext()}
              className="gap-2"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              disabled={isCompleting || isSubmitting}
              className="gap-2"
            >
              {isCompleting || isSubmitting ? "Processing..." : "Complete"}
              <Check className="h-4 w-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
