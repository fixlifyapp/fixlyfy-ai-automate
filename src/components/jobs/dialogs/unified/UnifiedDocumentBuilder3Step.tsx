
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { UnifiedItemsStep } from "./UnifiedItemsStep";
import { UnifiedUpsellStep } from "./UnifiedUpsellStep";
import { UnifiedPreviewStep } from "./UnifiedPreviewStep";
import { useUnifiedDocumentBuilder } from "./useUnifiedDocumentBuilder";
import { Estimate } from "@/hooks/useEstimates";
import { Invoice } from "@/hooks/useInvoices";
import { UpsellItem } from "../shared/types";
import { toast } from "sonner";
import { useJobData } from "./hooks/useJobData";
import { useIsMobile } from "@/hooks/use-mobile";

interface UnifiedDocumentBuilder3StepProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentType: "estimate" | "invoice";
  jobId: string;
  existingDocument?: Invoice | Estimate;
  estimateToConvert?: Estimate;
  onDocumentCreated?: (document: Invoice | Estimate) => void;
}

type BuilderStep = "items" | "upsell" | "preview";

export const UnifiedDocumentBuilder3Step = ({
  open,
  onOpenChange,
  documentType,
  jobId,
  existingDocument,
  estimateToConvert,
  onDocumentCreated
}: UnifiedDocumentBuilder3StepProps) => {
  const [currentStep, setCurrentStep] = useState<BuilderStep>("items");
  const [savedDocument, setSavedDocument] = useState<Invoice | Estimate | null>(null);
  const [selectedUpsells, setSelectedUpsells] = useState<UpsellItem[]>([]);
  const [documentCreated, setDocumentCreated] = useState(false);
  const isMobile = useIsMobile();

  // Get job and client data
  const { clientInfo, loading: jobLoading } = useJobData(jobId);

  // Use the unified document builder hook
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
    handleAddProduct,
    handleRemoveLineItem,
    handleUpdateLineItem,
    calculateSubtotal,
    calculateTotalTax,
    calculateGrandTotal,
    saveDocumentChanges
  } = useUnifiedDocumentBuilder({
    documentType,
    existingDocument: existingDocument || estimateToConvert,
    jobId,
    open
  });

  // Initialize form data when dialog opens
  useEffect(() => {
    if (open) {
      if (existingDocument) {
        setDocumentCreated(true);
        setSavedDocument(existingDocument);
      } else if (estimateToConvert) {
        setDocumentCreated(false);
        setSavedDocument(null);
      }
      setCurrentStep("items");
      setSelectedUpsells([]);
    }
  }, [open, existingDocument, estimateToConvert]);

  const handleSaveAndContinue = async () => {
    if (lineItems.length === 0) {
      toast.error(`Please add at least one item to the ${documentType}`);
      return;
    }

    try {
      console.log(`💾 Saving ${documentType} before continuing to upsell step...`);
      
      const document = await saveDocumentChanges();
      
      if (document) {
        setSavedDocument(document);
        setDocumentCreated(true);
        console.log(`✅ ${documentType} saved successfully:`, document.id);
        toast.success(`${documentType} saved successfully!`);
        
        setCurrentStep("upsell");
      } else {
        toast.error(`Failed to save ${documentType}. Please try again.`);
        return;
      }
    } catch (error: any) {
      console.error("Error in handleSaveAndContinue:", error);
      toast.error(`Failed to save ${documentType}: ` + (error.message || "Unknown error"));
    }
  };

  const handleUpsellContinue = (upsells: UpsellItem[], upsellNotes: string) => {
    setSelectedUpsells(prev => [...prev, ...upsells]);
    if (upsellNotes.trim()) {
      setNotes(prev => prev ? `${prev}\n\n${upsellNotes}` : upsellNotes);
    }
    setCurrentStep("preview");
  };

  const handlePreviewBack = () => {
    setCurrentStep("upsell");
  };

  const handleDialogClose = () => {
    if (currentStep === "preview") {
      setCurrentStep("upsell");
    } else if (currentStep === "upsell") {
      setCurrentStep("items");
    } else {
      onOpenChange(false);
    }
  };

  const handleSaveForLater = async () => {
    if (lineItems.length === 0) {
      onOpenChange(false);
      return;
    }

    try {
      console.log(`💾 Saving ${documentType} for later...`);
      const document = await saveDocumentChanges();
      if (document) {
        toast.success(`${documentType} saved as draft`);
        onOpenChange(false);
        
        if (onDocumentCreated) {
          onDocumentCreated(document);
        }
      }
    } catch (error) {
      console.error(`Error saving ${documentType}:`, error);
      toast.error(`Failed to save ${documentType}`);
    }
  };

  const handleDocumentAction = (action: 'send' | 'pay' | 'convert') => {
    console.log(`Document action: ${action}`);
    onOpenChange(false);
    
    if (onDocumentCreated && savedDocument) {
      onDocumentCreated(savedDocument);
    }
  };

  // Create job context including document ID
  const jobContext = {
    job_type: 'General Service',
    service_category: 'Maintenance',
    job_value: calculateGrandTotal(),
    client_history: clientInfo,
    documentId: savedDocument?.id || existingDocument?.id
  };

  const steps = [
    { number: 1, title: "Items & Pricing", description: "Add line items and set pricing" },
    { number: 2, title: "Additional Services", description: "Add warranties and extras" },
    { number: 3, title: "Preview & Actions", description: "Review and take action" }
  ];

  const isStepComplete = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return lineItems.length > 0;
      case 2:
        return true;
      case 3:
        return false;
      default:
        return false;
    }
  };

  const stepTitles = {
    items: existingDocument ? `Edit ${documentType}` : `Create ${documentType}`,
    upsell: "Enhance Your Service",
    preview: `${documentType} Preview & Actions`
  };

  const currentStepNumber = currentStep === "items" ? 1 : currentStep === "upsell" ? 2 : 3;

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className={`${isMobile ? 'w-[98vw] h-[98vh] max-w-none m-1 p-0' : 'max-w-6xl'} max-h-[90vh] overflow-y-auto`}>
        <DialogHeader className={`${isMobile ? 'p-4 pb-2 border-b' : 'pb-4'}`}>
          <DialogTitle className={`flex ${isMobile ? 'flex-col gap-1' : 'items-center gap-2'}`}>
            <div className={`flex ${isMobile ? 'justify-between items-center' : 'items-center gap-2'}`}>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                Step {currentStepNumber} of 3
              </span>
              {documentNumber && <span className="text-xs text-muted-foreground">(#{documentNumber})</span>}
            </div>
            <span className={`${isMobile ? 'text-base font-medium' : 'text-lg'}`}>{stepTitles[currentStep]}</span>
          </DialogTitle>
          
          {/* Step Indicator - Mobile Optimized */}
          {isMobile ? (
            <div className="flex justify-between items-center py-2">
              {steps.map((step, index) => (
                <div key={step.number} className="flex flex-col items-center flex-1">
                  <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 ${
                    currentStepNumber === step.number
                      ? "border-primary bg-primary text-primary-foreground"
                      : isStepComplete(step.number)
                      ? "border-green-500 bg-green-500 text-white"
                      : "border-gray-300 bg-white text-gray-500"
                  }`}>
                    {isStepComplete(step.number) ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <span className="text-xs font-medium">{step.number}</span>
                    )}
                  </div>
                  <div className="mt-1 text-center">
                    <div className={`text-xs font-medium ${
                      currentStepNumber === step.number ? "text-primary" : "text-gray-500"
                    }`}>
                      {step.title.split(' ')[0]}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`absolute top-3 w-8 h-0.5 bg-gray-300 ${
                      index === 0 ? 'left-[calc(33.33%+12px)] right-[calc(66.66%-12px)]' : 
                      'left-[calc(66.66%+12px)] right-[12px]'
                    }`} style={{
                      left: `calc(${((index + 1) * 33.33)}% + 12px)`,
                      right: `calc(${(100 - ((index + 2) * 33.33))}% + 12px)`
                    }} />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-4 py-4">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    currentStepNumber === step.number
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
                      currentStepNumber === step.number ? "text-primary" : "text-gray-500"
                    }`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-500">{step.description}</div>
                  </div>
                  
                  {index < steps.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-gray-400 mx-4" />
                  )}
                </div>
              ))}
            </div>
          )}
        </DialogHeader>
        
        <div className={`${isMobile ? 'p-4 pt-2' : 'py-6'}`}>
          {currentStep === "items" && (
            <>
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

              <div className={`flex ${isMobile ? 'flex-col gap-3' : 'justify-between'} pt-4 border-t mt-4`}>
                <Button 
                  variant="outline" 
                  onClick={lineItems.length > 0 ? handleSaveForLater : () => onOpenChange(false)}
                  className={`${isMobile ? 'w-full h-12 text-sm' : ''}`}
                >
                  {lineItems.length > 0 ? "Save for Later" : "Cancel"}
                </Button>
                
                <Button 
                  onClick={handleSaveAndContinue}
                  disabled={isSubmitting || lineItems.length === 0}
                  className={`gap-2 ${isMobile ? 'w-full h-12 text-sm' : ''}`}
                >
                  {isSubmitting ? "Saving..." : "Save & Continue"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
          
          {currentStep === "upsell" && (
            <UnifiedUpsellStep
              documentType={documentType}
              documentTotal={calculateGrandTotal()}
              onContinue={handleUpsellContinue}
              onBack={() => setCurrentStep("items")}
              existingUpsellItems={selectedUpsells}
              jobContext={jobContext}
            />
          )}

          {currentStep === "preview" && savedDocument && (
            <UnifiedPreviewStep
              documentType={documentType}
              document={savedDocument}
              jobId={jobId}
              onBack={handlePreviewBack}
              onAction={handleDocumentAction}
              clientInfo={clientInfo}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
