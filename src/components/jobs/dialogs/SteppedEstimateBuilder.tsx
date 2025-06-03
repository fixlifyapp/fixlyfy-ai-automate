
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { LineItemsManager } from "./unified/LineItemsManager";
import { EstimateSendDialog } from "./estimate-builder/EstimateSendDialog";
import { useUnifiedDocumentBuilder } from "./unified/useUnifiedDocumentBuilder";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface SteppedEstimateBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  existingEstimate?: any;
  onEstimateCreated?: () => void;
}

type BuilderStep = "items" | "send";

export const SteppedEstimateBuilder = ({
  open,
  onOpenChange,
  jobId,
  existingEstimate,
  onEstimateCreated
}: SteppedEstimateBuilderProps) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<BuilderStep>("items");
  const [savedEstimate, setSavedEstimate] = useState<any>(null);
  
  const {
    lineItems,
    setLineItems,
    taxRate,
    setTaxRate,
    notes,
    setNotes,
    documentNumber,
    setDocumentNumber,
    isSubmitting,
    calculateSubtotal,
    calculateTotalTax,
    calculateGrandTotal,
    handleAddProduct,
    handleRemoveLineItem,
    handleUpdateLineItem,
    saveDocumentChanges
  } = useUnifiedDocumentBuilder({
    documentType: "estimate",
    existingDocument: existingEstimate,
    jobId,
    open
  });

  // Reset step when dialog opens/closes
  useEffect(() => {
    if (open) {
      setCurrentStep("items");
      setSavedEstimate(null);
    }
  }, [open]);

  // Generate estimate number if creating new
  useEffect(() => {
    if (open && !existingEstimate && !documentNumber) {
      setDocumentNumber(`EST-${Date.now()}`);
    }
  }, [open, existingEstimate, documentNumber, setDocumentNumber]);

  const handleSaveAndContinue = async () => {
    console.log("Saving estimate before proceeding to send step...");
    
    if (lineItems.length === 0) {
      toast.error("Please add at least one item to the estimate");
      return;
    }

    try {
      const estimate = await saveDocumentChanges();
      
      if (estimate) {
        console.log("Estimate saved successfully:", estimate);
        setSavedEstimate(estimate);
        setCurrentStep("send");
        toast.success("Estimate saved! Now choose how to send it.");
      } else {
        toast.error("Failed to save estimate. Please try again.");
      }
    } catch (error: any) {
      console.error("Error saving estimate:", error);
      toast.error("Failed to save estimate: " + error.message);
    }
  };

  const handleSendSuccess = () => {
    console.log("Estimate sent successfully, closing builder and navigating");
    onOpenChange(false);
    
    if (onEstimateCreated) {
      onEstimateCreated();
    }

    // Navigate back to job estimates tab
    setTimeout(() => {
      navigate(`/jobs/${jobId}`, { 
        state: { activeTab: "estimates" },
        replace: true 
      });
    }, 100);
  };

  const handleSendCancel = () => {
    console.log("Send cancelled, going back to items step");
    setCurrentStep("items");
  };

  const handleDialogClose = () => {
    if (currentStep === "send") {
      // If we're in send step, go back to items
      setCurrentStep("items");
    } else {
      // Close the dialog
      onOpenChange(false);
    }
  };

  const stepTitles = {
    items: existingEstimate ? "Edit Estimate" : "Create Estimate",
    send: "Send Estimate"
  };

  return (
    <>
      <Dialog open={open && currentStep === "items"} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {stepTitles[currentStep]}
              {documentNumber && <span className="text-sm text-muted-foreground">({documentNumber})</span>}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <LineItemsManager
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
              documentType="estimate"
            />

            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              
              <Button 
                onClick={handleSaveAndContinue}
                disabled={isSubmitting || lineItems.length === 0}
                className="gap-2"
              >
                {isSubmitting ? "Saving..." : "Save & Send"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Dialog */}
      <EstimateSendDialog
        open={currentStep === "send"}
        onOpenChange={(open) => !open && handleSendCancel()}
        estimateNumber={savedEstimate?.estimate_number || savedEstimate?.number || documentNumber}
        jobId={jobId}
        onSuccess={handleSendSuccess}
        onCancel={handleSendCancel}
        onSave={async () => {
          // Estimate is already saved, just return true
          return true;
        }}
      />
    </>
  );
};
