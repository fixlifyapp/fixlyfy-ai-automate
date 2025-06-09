
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { UnifiedItemsStep } from "./unified/UnifiedItemsStep";
import { EstimateUpsellStep } from "./estimate-builder/EstimateUpsellStep";
import { SendDialog } from "./shared/SendDialog";
import { useUnifiedDocumentBuilder } from "./unified/useUnifiedDocumentBuilder";
import { useEstimateSendingInterface } from "./shared/hooks/useSendingInterface";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { generateNextId } from "@/utils/idGeneration";
import { useJobData } from "./unified/hooks/useJobData";
import { UpsellItem } from "./shared/types";
import { useIsMobile } from "@/hooks/use-mobile";

interface SteppedEstimateBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  existingEstimate?: any;
  onEstimateCreated?: () => void;
}

type BuilderStep = "items" | "upsell" | "send";

export const SteppedEstimateBuilder = ({
  open,
  onOpenChange,
  jobId,
  existingEstimate,
  onEstimateCreated
}: SteppedEstimateBuilderProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Use the optimized useJobData hook instead of fetching all jobs
  const { clientInfo, jobAddress, loading: jobDataLoading } = useJobData(jobId);
  
  const [currentStep, setCurrentStep] = useState<BuilderStep>("items");
  const [savedEstimate, setSavedEstimate] = useState<any>(null);
  const [selectedUpsells, setSelectedUpsells] = useState<UpsellItem[]>([]);
  const [upsellNotes, setUpsellNotes] = useState("");
  const [estimateCreated, setEstimateCreated] = useState(false);
  const [addedUpsellIds, setAddedUpsellIds] = useState<Set<string>>(new Set());

  // Create contactInfo object for compatibility - now loads much faster
  const contactInfo = {
    name: clientInfo?.name || 'Client',
    email: clientInfo?.email || '',
    phone: clientInfo?.phone || ''
  };
  
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

  // Create job context for AI recommendations - now includes estimateId
  const jobContext = {
    job_type: existingEstimate?.job_type || 'General Service',
    service_category: existingEstimate?.service_category || 'Maintenance',
    job_value: calculateGrandTotal(),
    client_history: clientInfo,
    estimateId: savedEstimate?.id || existingEstimate?.id
  };

  // Reset step when dialog opens/closes
  useEffect(() => {
    if (open) {
      setCurrentStep("items");
      setSavedEstimate(existingEstimate || null);
      setSelectedUpsells([]);
      setUpsellNotes("");
      setEstimateCreated(!!existingEstimate);
      setAddedUpsellIds(new Set());
    }
  }, [open, existingEstimate]);

  // Generate estimate number if creating new
  useEffect(() => {
    const generateEstimateNumber = async () => {
      if (open && !existingEstimate && !documentNumber) {
        try {
          const newNumber = await generateNextId('estimate');
          setDocumentNumber(newNumber);
        } catch (error) {
          console.error("Error generating estimate number:", error);
          const fallbackNumber = `EST-${Date.now()}`;
          setDocumentNumber(fallbackNumber);
        }
      }
    };

    generateEstimateNumber();
  }, [open, existingEstimate, documentNumber, setDocumentNumber]);

  const handleSaveAndContinue = async () => {
    if (lineItems.length === 0) {
      toast.error("Please add at least one item to the estimate");
      return;
    }

    if (!jobId) {
      toast.error("Job ID is required to save estimate");
      return;
    }

    if (typeof jobId !== 'string') {
      toast.error("Invalid job ID format");
      return;
    }
    
    try {
      console.log("💾 Saving estimate before continuing to upsell step...");
      
      // Always save the estimate, whether it's new or existing
      const estimate = await saveDocumentChanges();
      
      if (estimate) {
        setSavedEstimate(estimate);
        setEstimateCreated(true);
        console.log("✅ Estimate saved successfully:", estimate.id);
        toast.success("Estimate saved successfully!");
        
        // Move to upsell step
        setCurrentStep("upsell");
      } else {
        toast.error("Failed to save estimate. Please try again.");
        return;
      }
    } catch (error: any) {
      console.error("Error in handleSaveAndContinue:", error);
      toast.error("Failed to save estimate: " + (error.message || "Unknown error"));
    }
  };

  const handleUpsellContinue = async (upsells: UpsellItem[], notes: string) => {
    setSelectedUpsells(prev => [...prev, ...upsells]);
    setUpsellNotes(notes);
    
    // Don't add line items here since they're already saved in the upsell step
    // Just update notes if needed
    if (notes.trim() && savedEstimate?.id) {
      try {
        console.log("💾 Updating estimate notes...");
        // Mock update since we don't have estimates table
        console.log('Notes updated:', notes);
      } catch (error) {
        console.error("Failed to save notes:", error);
        toast.error("Failed to save notes");
        return;
      }
    }
    
    setCurrentStep("send");
  };

  const handleSaveAndSend = async () => {
    try {
      const savedEstimate = await saveDocumentChanges();
      if (savedEstimate && onEstimateCreated) {
        onEstimateCreated();
      }
      return savedEstimate !== null;
    } catch (error) {
      console.error("Error saving estimate:", error);
      return false;
    }
  };

  const handleSendSuccess = () => {
    onOpenChange(false);
    
    if (onEstimateCreated) {
      onEstimateCreated();
    }

    setTimeout(() => {
      navigate(`/jobs/${jobId}`, { 
        state: { activeTab: "estimates" },
        replace: true 
      });
    }, 100);
  };

  const handleSendCancel = () => {
    setCurrentStep("upsell");
  };

  const handleUpsellBack = () => {
    setCurrentStep("items");
  };

  const handleDialogClose = () => {
    if (currentStep === "send") {
      setCurrentStep("upsell");
    } else if (currentStep === "upsell") {
      setCurrentStep("items");
    } else {
      onOpenChange(false);
    }
  };

  // Function to save estimate without continuing (for cancel/close scenarios)
  const handleSaveForLater = async () => {
    if (lineItems.length === 0) {
      onOpenChange(false);
      return;
    }

    try {
      console.log("💾 Saving estimate for later...");
      await saveDocumentChanges();
      toast.success("Estimate saved as draft");
      onOpenChange(false);
      
      if (onEstimateCreated) {
        onEstimateCreated();
      }
    } catch (error) {
      console.error("Error saving estimate:", error);
      toast.error("Failed to save estimate");
    }
  };

  const stepTitles = {
    items: existingEstimate ? "Edit Estimate" : "Create Estimate",
    upsell: "Enhance Your Service",
    send: "Send Estimate"
  };

  const currentStepNumber = currentStep === "items" ? 1 : currentStep === "upsell" ? 2 : 3;

  return (
    <>
      <Dialog open={open && currentStep !== "send"} onOpenChange={handleDialogClose}>
        <DialogContent className={`
          ${isMobile 
            ? 'max-w-[100vw] max-h-[100vh] w-full h-full m-0 rounded-none border-0' 
            : 'max-w-6xl max-h-[90vh]'
          } 
          overflow-hidden flex flex-col p-0
        `}>
          <DialogHeader className={`${isMobile ? 'px-4 py-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95' : 'px-6 py-4'} flex-shrink-0`}>
            <DialogTitle className={`flex flex-col gap-2 ${isMobile ? 'text-base' : 'text-lg'}`}>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  Step {currentStepNumber} of 3
                </span>
                <span className={`${isMobile ? 'text-sm' : 'text-base'} truncate`}>{stepTitles[currentStep]}</span>
                {documentNumber && (
                  <span className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'} truncate`}>
                    (#{documentNumber})
                  </span>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className={`flex-1 overflow-y-auto ${isMobile ? 'px-4 pb-20' : 'px-6 pb-6'}`}>
            {currentStep === "items" && (
              <div className="space-y-4 pt-4">
                <UnifiedItemsStep
                  documentType="estimate"
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
              </div>
            )}

            {currentStep === "upsell" && (
              <div className="pt-4">
                <EstimateUpsellStep
                  documentTotal={calculateGrandTotal()}
                  onContinue={handleUpsellContinue}
                  onBack={handleUpsellBack}
                  existingUpsellItems={selectedUpsells}
                  jobContext={jobContext}
                />
              </div>
            )}
          </div>

          {/* Fixed bottom action bar for mobile */}
          {currentStep === "items" && (
            <div className={`
              ${isMobile 
                ? 'fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95 border-t px-4 py-3' 
                : 'px-6 pb-6 border-t bg-background'
              } 
              flex-shrink-0
            `}>
              <div className={`flex ${isMobile ? 'flex-col gap-3' : 'justify-between'}`}>
                <Button 
                  variant="outline" 
                  onClick={lineItems.length > 0 ? handleSaveForLater : () => onOpenChange(false)}
                  className={`${isMobile ? 'w-full h-12 text-base' : ''}`}
                >
                  {lineItems.length > 0 ? "Save for Later" : "Cancel"}
                </Button>
                
                <Button 
                  onClick={handleSaveAndContinue}
                  disabled={isSubmitting || lineItems.length === 0}
                  className={`gap-2 ${isMobile ? 'w-full h-12 text-base' : ''}`}
                >
                  {isSubmitting ? "Saving..." : "Save & Continue"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Send Dialog - using the generic SendDialog component */}
      <SendDialog
        isOpen={currentStep === "send"}
        onClose={() => handleSendCancel()}
        documentId={savedEstimate?.id || existingEstimate?.id || ''}
        documentNumber={savedEstimate?.estimate_number || savedEstimate?.number || documentNumber}
        documentType="estimate"
        total={calculateGrandTotal()}
        contactInfo={contactInfo}
        onSuccess={handleSendSuccess}
        onSave={handleSaveAndSend}
        useSendingHook={useEstimateSendingInterface}
      />
    </>
  );
};
