
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, FileText, Loader2 } from "lucide-react";
import { LineItemsManager } from "./unified/LineItemsManager";
import { WarrantySelectionDialog } from "./WarrantySelectionDialog";
import { EstimateSendDialog } from "./estimate-builder/EstimateSendDialog";
import { useUnifiedDocumentBuilder } from "./unified/useUnifiedDocumentBuilder";
import { useJobs } from "@/hooks/useJobs";
import { toast } from "sonner";
import { Estimate } from "@/hooks/useEstimates";
import { Product } from "../builder/types";

interface SteppedEstimateBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  clientInfo?: any;
  onEstimateCreated?: (estimate: Estimate) => void;
  existingEstimate?: Estimate;
}

export const SteppedEstimateBuilder = ({
  open,
  onOpenChange,
  jobId,
  clientInfo,
  onEstimateCreated,
  existingEstimate
}: SteppedEstimateBuilderProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showWarrantyDialog, setShowWarrantyDialog] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [selectedWarranty, setSelectedWarranty] = useState<Product | null>(null);
  const [warrantyNote, setWarrantyNote] = useState("");
  const [savedEstimate, setSavedEstimate] = useState<Estimate | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { jobs } = useJobs();
  const job = jobs.find(j => j.id === jobId);

  const {
    lineItems,
    taxRate,
    notes,
    documentNumber,
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
    saveDocumentChanges
  } = useUnifiedDocumentBuilder({
    documentType: "estimate",
    existingDocument: existingEstimate,
    jobId,
    open,
  });

  const finalClientInfo = clientInfo || job?.client || { name: '', email: '', phone: '' };

  // Reset to step 1 when dialog opens for new estimate
  useEffect(() => {
    if (open && !existingEstimate) {
      setCurrentStep(1);
      setSavedEstimate(null);
      setSelectedWarranty(null);
      setWarrantyNote("");
      setIsSaving(false);
    }
  }, [open, existingEstimate]);

  // If editing existing estimate, go to step 3 directly
  useEffect(() => {
    if (open && existingEstimate) {
      setCurrentStep(3);
      setSavedEstimate(existingEstimate);
    }
  }, [open, existingEstimate]);

  const handleNext = () => {
    if (currentStep === 1) {
      if (lineItems.length === 0) {
        toast.error("Please add at least one product before proceeding");
        return;
      }
      // Go to step 2 - warranty recommendation
      setCurrentStep(2);
      setShowWarrantyDialog(true);
    }
  };

  const handleWarrantySelection = async (warranty: Product | null, note: string) => {
    console.log("=== WARRANTY SELECTION ===");
    console.log("Selected warranty:", warranty);
    console.log("Note:", note);
    
    setIsSaving(true);
    
    try {
      if (warranty) {
        setSelectedWarranty(warranty);
        setWarrantyNote(note);
        handleAddProduct(warranty);
        toast.success(`${warranty.name} added to estimate`);
      }
      
      setShowWarrantyDialog(false);

      // Try to save estimate after warranty step
      try {
        console.log("Attempting to save estimate...");
        const savedDocument = await saveDocumentChanges();
        console.log("Save result:", savedDocument);
        
        // Check if we got an estimate back (with proper type guard)
        if (savedDocument && (
          ('estimate_number' in savedDocument) || 
          ('number' in savedDocument && !('invoice_number' in savedDocument))
        )) {
          const estimate = savedDocument as Estimate;
          setSavedEstimate(estimate);
          if (onEstimateCreated) {
            onEstimateCreated(estimate);
          }
          toast.success("Estimate saved successfully!");
        } else {
          console.warn("Save returned unexpected format:", savedDocument);
          toast.warning("Estimate saved, but format was unexpected");
        }
      } catch (saveError) {
        console.error('Error saving estimate:', saveError);
        toast.error('Failed to save estimate, but you can still proceed to send');
      }

      // Always proceed to step 3, regardless of save success
      console.log("Moving to step 3...");
      setCurrentStep(3);
      
    } catch (error) {
      console.error('Error in warranty selection:', error);
      toast.error('Error processing warranty selection');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendSuccess = () => {
    setShowSendDialog(false);
    onOpenChange(false);
    toast.success("Estimate sent successfully!");
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return "Add Products & Services";
      case 2: return "Warranty Recommendation";
      case 3: return "Send Estimate";
      default: return "Create Estimate";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const handleManualSaveAndSend = async () => {
    console.log("=== MANUAL SAVE AND SEND ===");
    setIsSaving(true);
    
    try {
      const savedDocument = await saveDocumentChanges();
      console.log("Manual save result:", savedDocument);
      
      if (savedDocument) {
        // Update saved estimate if we got one back
        if (('estimate_number' in savedDocument) || 
            ('number' in savedDocument && !('invoice_number' in savedDocument))) {
          setSavedEstimate(savedDocument as Estimate);
        }
        toast.success("Estimate saved successfully!");
      }
      
      setShowSendDialog(true);
    } catch (error) {
      console.error('Error saving estimate:', error);
      toast.error('Failed to save estimate');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0 pb-6 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-blue-600" />
                <div>
                  <DialogTitle className="text-xl">
                    {getStepTitle()}
                  </DialogTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-sm">{documentNumber}</Badge>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-600">{finalClientInfo.name || 'Client'}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <Badge variant="outline" className="text-sm">Step {currentStep} of 3</Badge>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Total Amount</div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(calculateGrandTotal())}
                </div>
              </div>
            </div>

            {/* Step Progress Indicator */}
            <div className="flex items-center gap-4 mt-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step}
                  </div>
                  {step < 3 && (
                    <div className={`h-1 w-16 ml-2 ${
                      step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </DialogHeader>

          <div className="flex-1 min-h-0 overflow-y-auto p-6">
            {currentStep === 1 && (
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
            )}

            {currentStep === 2 && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  {isSaving ? (
                    <>
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                      <div className="text-lg font-medium mb-4">Saving estimate...</div>
                      <div className="text-sm text-gray-600">Please wait while we save your estimate.</div>
                    </>
                  ) : (
                    <>
                      <div className="text-lg font-medium mb-4">Preparing warranty recommendations...</div>
                      <div className="text-sm text-gray-600">Please wait while we set up warranty options for your customer.</div>
                    </>
                  )}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                  <div className="text-lg font-medium">Estimate Ready to Send!</div>
                  <div className="text-sm text-gray-600">
                    Your estimate is ready. Click "Send Estimate" to choose how to deliver it to your customer.
                  </div>
                  {savedEstimate && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="text-sm text-green-800">
                        ✓ Estimate {savedEstimate.estimate_number || savedEstimate.number} saved successfully
                      </div>
                    </div>
                  )}
                  {selectedWarranty && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="text-sm text-blue-800">
                        ✓ {selectedWarranty.name} warranty added ({formatCurrency(selectedWarranty.price)})
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex-shrink-0 flex justify-between items-center pt-6 border-t">
            <div>
              {currentStep > 1 && currentStep < 3 && (
                <Button 
                  variant="outline" 
                  onClick={handleBack}
                  className="gap-2"
                  disabled={isSaving}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              )}
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              
              {currentStep === 1 && (
                <Button 
                  onClick={handleNext}
                  disabled={lineItems.length === 0 || isSaving}
                  className="gap-2"
                >
                  Next: Warranty Options
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}

              {currentStep === 3 && (
                <Button 
                  onClick={savedEstimate ? () => setShowSendDialog(true) : handleManualSaveAndSend}
                  className="gap-2"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Send Estimate
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Warranty Selection Dialog */}
      <WarrantySelectionDialog
        open={showWarrantyDialog}
        onOpenChange={setShowWarrantyDialog}
        onConfirm={handleWarrantySelection}
      />

      {/* Send Dialog */}
      <EstimateSendDialog
        open={showSendDialog}
        onOpenChange={setShowSendDialog}
        estimateNumber={savedEstimate?.estimate_number || savedEstimate?.number || documentNumber}
        contactInfo={finalClientInfo}
        clientInfo={finalClientInfo}
        jobId={jobId}
        onSuccess={handleSendSuccess}
        onCancel={() => setShowSendDialog(false)}
        onSave={async () => true} // Already saved in step 2
      />
    </>
  );
};
