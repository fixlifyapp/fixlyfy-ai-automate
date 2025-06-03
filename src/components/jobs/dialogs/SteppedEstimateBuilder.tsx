
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { LineItemsManager } from "./unified/LineItemsManager";
import { EstimateUpsellStep } from "./estimate-builder/EstimateUpsellStep";
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

type BuilderStep = "items" | "upsell" | "send";

interface UpsellItem {
  id: string;
  title: string;
  description: string;
  price: number;
  icon: any;
  selected: boolean;
}

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
  const [selectedUpsells, setSelectedUpsells] = useState<UpsellItem[]>([]);
  const [upsellNotes, setUpsellNotes] = useState("");
  
  console.log("=== STEPPED ESTIMATE BUILDER PROPS ===");
  console.log("Job ID:", jobId);
  console.log("Job ID type:", typeof jobId);
  console.log("Existing estimate:", existingEstimate);
  console.log("Dialog open:", open);
  console.log("Current step:", currentStep);
  
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
      console.log("Dialog opened, resetting state");
      setCurrentStep("items");
      setSavedEstimate(null);
      setSelectedUpsells([]);
      setUpsellNotes("");
    }
  }, [open]);

  // Generate estimate number if creating new
  useEffect(() => {
    if (open && !existingEstimate && !documentNumber) {
      const newNumber = `EST-${Date.now()}`;
      console.log("Generated new estimate number:", newNumber);
      setDocumentNumber(newNumber);
    }
  }, [open, existingEstimate, documentNumber, setDocumentNumber]);

  const handleSaveAndContinue = async () => {
    console.log("=== SAVE AND CONTINUE TO UPSELL ===");
    console.log("Line items:", lineItems);
    console.log("Line items count:", lineItems.length);
    console.log("Job ID:", jobId);
    console.log("Job ID type:", typeof jobId);
    console.log("Document number:", documentNumber);
    console.log("Subtotal:", calculateSubtotal());
    console.log("Total tax:", calculateTotalTax());
    console.log("Grand total:", calculateGrandTotal());
    
    if (lineItems.length === 0) {
      console.log("❌ No line items, showing error");
      toast.error("Please add at least one item to the estimate");
      return;
    }

    if (!jobId) {
      console.log("❌ No job ID, showing error");
      toast.error("Job ID is required to save estimate");
      return;
    }

    // Validate job ID format
    if (typeof jobId !== 'string') {
      console.log("❌ Job ID is not a string:", typeof jobId);
      toast.error("Invalid job ID format");
      return;
    }

    console.log("✅ Starting save process...");
    
    try {
      console.log("📞 Calling saveDocumentChanges...");
      const estimate = await saveDocumentChanges();
      
      console.log("📋 Save result:", estimate);
      
      if (estimate) {
        console.log("✅ Estimate saved successfully:", estimate);
        setSavedEstimate(estimate);
        setCurrentStep("upsell");
        toast.success("Estimate saved! Choose additional services.");
      } else {
        console.log("❌ Save returned null/undefined");
        toast.error("Failed to save estimate. Please try again.");
      }
    } catch (error: any) {
      console.error("❌ Error in handleSaveAndContinue:", error);
      console.error("Error stack:", error.stack);
      toast.error("Failed to save estimate: " + (error.message || "Unknown error"));
    }
  };

  const handleUpsellContinue = async (upsells: UpsellItem[], notes: string) => {
    console.log("=== UPSELL CONTINUE ===");
    console.log("Selected upsells:", upsells);
    console.log("Upsell notes:", notes);
    
    setSelectedUpsells(upsells);
    setUpsellNotes(notes);
    
    // Add upsell items to line items if any selected
    if (upsells.length > 0) {
      const upsellLineItems = upsells.map(upsell => ({
        id: `upsell-${upsell.id}-${Date.now()}`,
        description: upsell.title + (upsell.description ? ` - ${upsell.description}` : ''),
        quantity: 1,
        unitPrice: upsell.price,
        taxable: true,
        discount: 0,
        ourPrice: 0,
        name: upsell.title,
        price: upsell.price,
        total: upsell.price
      }));
      
      setLineItems(prev => [...prev, ...upsellLineItems]);
      
      // Save updated estimate with upsells
      try {
        const updatedEstimate = await saveDocumentChanges();
        if (updatedEstimate) {
          setSavedEstimate(updatedEstimate);
          console.log("✅ Estimate updated with upsells");
        }
      } catch (error) {
        console.error("Failed to save upsells:", error);
        toast.error("Failed to save additional services");
        return;
      }
    }
    
    // Combine notes
    const combinedNotes = [notes, upsellNotes].filter(Boolean).join('\n\n');
    setNotes(combinedNotes);
    
    setCurrentStep("send");
  };

  const handleSendSuccess = () => {
    console.log("=== SEND SUCCESS ===");
    console.log("Estimate sent successfully, closing builder and calling callback");
    
    // Close the dialog
    onOpenChange(false);
    
    // Call the callback to refresh the estimates list
    if (onEstimateCreated) {
      console.log("Calling onEstimateCreated callback");
      onEstimateCreated();
    }

    // Small delay to ensure dialog closes before navigation
    setTimeout(() => {
      console.log("Navigating to estimates tab");
      navigate(`/jobs/${jobId}`, { 
        state: { activeTab: "estimates" },
        replace: true 
      });
    }, 100);
  };

  const handleSendCancel = () => {
    console.log("Send cancelled, going back to upsell step");
    setCurrentStep("upsell");
  };

  const handleUpsellBack = () => {
    console.log("Going back to items step");
    setCurrentStep("items");
  };

  const handleDialogClose = () => {
    console.log("Dialog close requested, current step:", currentStep);
    if (currentStep === "send") {
      setCurrentStep("upsell");
    } else if (currentStep === "upsell") {
      setCurrentStep("items");
    } else {
      onOpenChange(false);
    }
  };

  const stepTitles = {
    items: existingEstimate ? "Edit Estimate" : "Create Estimate",
    upsell: "Enhance Your Service",
    send: "Send Estimate"
  };

  const currentStepNumber = currentStep === "items" ? 1 : currentStep === "upsell" ? 2 : 3;

  console.log("=== RENDERING STEPPED ESTIMATE BUILDER ===");
  console.log("Current step:", currentStep);
  console.log("Step number:", currentStepNumber);
  console.log("Line items count:", lineItems.length);
  console.log("Saved estimate:", !!savedEstimate);
  console.log("Is submitting:", isSubmitting);
  console.log("Document number:", documentNumber);

  return (
    <>
      <Dialog open={open && currentStep !== "send"} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                Step {currentStepNumber} of 3
              </span>
              {stepTitles[currentStep]}
              {documentNumber && <span className="text-sm text-muted-foreground">({documentNumber})</span>}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {currentStep === "items" && (
              <>
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
                    {isSubmitting ? "Saving..." : "Save & Continue"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}

            {currentStep === "upsell" && (
              <EstimateUpsellStep
                estimateTotal={calculateGrandTotal()}
                onContinue={handleUpsellContinue}
                onBack={handleUpsellBack}
              />
            )}
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
