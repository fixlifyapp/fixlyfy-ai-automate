
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Send, DollarSign } from "lucide-react";
import { InvoiceFormStep } from "../forms/invoice/InvoiceFormStep";
import { InvoicePreviewStep } from "../forms/invoice/InvoicePreviewStep";
import { InvoicePaymentStep } from "../forms/invoice/InvoicePaymentStep";
import { useInvoiceBuilder } from "../hooks/useInvoiceBuilder";
import { Estimate } from "@/hooks/useEstimates";
import { Invoice } from "@/hooks/useInvoices";

interface InvoiceBuilderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  estimate?: Estimate;
  invoice?: Invoice;
  onInvoiceCreated?: (invoice: Invoice) => void;
}

export const InvoiceBuilderDialog = ({
  open,
  onOpenChange,
  jobId,
  estimate,
  invoice,
  onInvoiceCreated
}: InvoiceBuilderDialogProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const {
    formData,
    isSubmitting,
    updateFormData,
    createInvoice,
    updateInvoice,
    recordPayment,
    resetForm,
    initializeFromEstimate,
    initializeFromInvoice
  } = useInvoiceBuilder(jobId);

  useEffect(() => {
    if (open) {
      if (estimate) {
        initializeFromEstimate(estimate);
      } else if (invoice) {
        initializeFromInvoice(invoice);
      } else {
        resetForm();
      }
      setCurrentStep(1);
    }
  }, [open, estimate, invoice, initializeFromEstimate, initializeFromInvoice, resetForm]);

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreateInvoice = async () => {
    try {
      const newInvoice = await createInvoice();
      if (newInvoice) {
        onInvoiceCreated?.(newInvoice);
        handleNext();
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
    }
  };

  const handleUpdateInvoice = async () => {
    if (!invoice) return;
    
    try {
      const updatedInvoice = await updateInvoice(invoice.id);
      if (updatedInvoice) {
        onInvoiceCreated?.(updatedInvoice);
        handleNext();
      }
    } catch (error) {
      console.error("Error updating invoice:", error);
    }
  };

  const handlePayment = async (amount: number, method: string, reference?: string, notes?: string) => {
    if (!formData.invoiceId) return;
    
    try {
      await recordPayment(formData.invoiceId, amount, method, reference, notes);
      onOpenChange(false);
    } catch (error) {
      console.error("Error recording payment:", error);
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return `${invoice ? 'Edit' : 'Create'} Invoice`;
      case 2: return "Review Invoice";
      case 3: return "Payment & Send";
      default: return "Create Invoice";
    }
  };

  const canProceed = () => {
    if (currentStep === 1) {
      return formData.items.length > 0 && formData.items.every(item => 
        item.description && item.quantity > 0 && item.unitPrice > 0
      );
    }
    return true;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            {getStepTitle()}
            <span className="text-sm text-muted-foreground ml-auto">
              Step {currentStep} of 3
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step Indicator */}
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  step === currentStep
                    ? "border-primary bg-primary text-primary-foreground"
                    : step < currentStep
                    ? "border-green-500 bg-green-500 text-white"
                    : "border-muted-foreground text-muted-foreground"
                }`}
              >
                {step}
              </div>
            ))}
          </div>

          {/* Step Content */}
          {currentStep === 1 && (
            <InvoiceFormStep
              formData={formData}
              onUpdateFormData={updateFormData}
              isFromEstimate={!!estimate}
            />
          )}

          {currentStep === 2 && (
            <InvoicePreviewStep
              formData={formData}
              jobId={jobId}
            />
          )}

          {currentStep === 3 && (
            <InvoicePaymentStep
              invoice={formData}
              onPayment={handlePayment}
              onSendInvoice={() => onOpenChange(false)}
            />
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={currentStep === 1 ? () => onOpenChange(false) : handlePrevious}
              disabled={isSubmitting}
            >
              {currentStep === 1 ? (
                "Cancel"
              ) : (
                <>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </>
              )}
            </Button>

            {currentStep < 3 ? (
              <Button
                onClick={currentStep === 1 ? (invoice ? handleUpdateInvoice : handleCreateInvoice) : handleNext}
                disabled={!canProceed() || isSubmitting}
              >
                {currentStep === 1 ? (
                  isSubmitting ? "Saving..." : (invoice ? "Update Invoice" : "Create Invoice")
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={() => onOpenChange(false)}
                variant="outline"
              >
                <Send className="h-4 w-4 mr-2" />
                Complete
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
