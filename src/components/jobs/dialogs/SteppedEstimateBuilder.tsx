
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { UnifiedItemsStep } from "./unified/UnifiedItemsStep";
import { EstimateUpsellStep } from "./estimate-builder/EstimateUpsellStep";
import { EstimateSendDialog } from "./estimate-builder/EstimateSendDialog";
import { useUnifiedDocumentBuilder } from "./unified/useUnifiedDocumentBuilder";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { generateNextId } from "@/utils/idGeneration";
import { useJobData } from "./unified/hooks/useJobData";

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

  // Create job context for AI recommendations
  const jobContext = {
    job_type: existingEstimate?.job_type || 'General Service',
    service_category: existingEstimate?.service_category || 'Maintenance',
    job_value: calculateGrandTotal(),
    client_history: clientInfo
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
      if (!estimateCreated || !savedEstimate) {
        const estimate = await saveDocumentChanges();
        
        if (estimate) {
          setSavedEstimate(estimate);
          setEstimateCreated(true);
          toast.success("Estimate saved! Choose additional services.");
        } else {
          toast.error("Failed to save estimate. Please try again.");
          return;
        }
      }
      
      setCurrentStep("upsell");
    } catch (error: any) {
      console.error("Error in handleSaveAndContinue:", error);
      toast.error("Failed to save estimate: " + (error.message || "Unknown error"));
    }
  };

  const handleUpsellContinue = async (upsells: UpsellItem[], notes: string) => {
    setSelectedUpsells(prev => [...prev, ...upsells]);
    setUpsellNotes(notes);
    
    const newUpsells = upsells.filter(upsell => !addedUpsellIds.has(upsell.id));
    
    if (newUpsells.length > 0) {
      const upsellLineItems = newUpsells.map(upsell => ({
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
      setAddedUpsellIds(prev => new Set([...prev, ...newUpsells.map(u => u.id)]));
      
      try {
        const updatedEstimate = await saveDocumentChanges();
        if (updatedEstimate) {
          setSavedEstimate(updatedEstimate);
        }
      } catch (error) {
        console.error("Failed to save upsells:", error);
        toast.error("Failed to save additional services");
        return;
      }
    }
    
    const combinedNotes = [notes, upsellNotes].filter(Boolean).join('\n\n');
    setNotes(combinedNotes);
    
    setCurrentStep("send");
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

  const stepTitles = {
    items: existingEstimate ? "Edit Estimate" : "Create Estimate",
    upsell: "Enhance Your Service",
    send: "Send Estimate"
  };

  const currentStepNumber = currentStep === "items" ? 1 : currentStep === "upsell" ? 2 : 3;

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
              {documentNumber && <span className="text-sm text-muted-foreground">(#{documentNumber})</span>}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {currentStep === "items" && (
              <>
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
                existingUpsellItems={selectedUpsells}
                jobContext={jobContext}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Dialog */}
      <EstimateSendDialog
        isOpen={currentStep === "send"}
        onClose={() => handleSendCancel()}
        estimateId={savedEstimate?.id || ''}
        estimateNumber={savedEstimate?.estimate_number || savedEstimate?.number || documentNumber}
        total={calculateGrandTotal()}
        contactInfo={contactInfo}
        onSuccess={handleSendSuccess}
      />
    </>
  );
};
