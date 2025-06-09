
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface SteppedInvoiceBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  existingInvoice?: any;
  onInvoiceCreated?: (invoice: any) => void;
}

export const SteppedInvoiceBuilder = ({
  open,
  onOpenChange,
  jobId,
  existingInvoice,
  onInvoiceCreated
}: SteppedInvoiceBuilderProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = async () => {
    // Mock invoice creation
    const mockInvoice = {
      id: `inv-${Date.now()}`,
      invoice_number: `INV-${Date.now()}`,
      job_id: jobId,
      total: 750,
      status: 'draft'
    };
    
    onInvoiceCreated?.(mockInvoice);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {existingInvoice ? 'Edit Invoice' : 'Create Invoice'}
            <span className="text-sm font-normal text-muted-foreground ml-2">
              Step {currentStep} of {totalSteps}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="py-6">
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Invoice Details</h3>
              <p className="text-muted-foreground">Configure the basic invoice information.</p>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Line Items</h3>
              <p className="text-muted-foreground">Add items and services to the invoice.</p>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Review & Send</h3>
              <p className="text-muted-foreground">Review the invoice before sending.</p>
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            {currentStep < totalSteps ? (
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleFinish}>
                Create Invoice
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
