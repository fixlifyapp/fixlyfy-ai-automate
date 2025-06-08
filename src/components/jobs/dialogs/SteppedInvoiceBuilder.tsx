
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { UnifiedItemsStep } from "./unified/UnifiedItemsStep";
import { InvoiceUpsellStep } from "./invoice-builder/InvoiceUpsellStep";
import { SendDialog } from "./shared/SendDialog";
import { useInvoiceBuilder } from "../hooks/useInvoiceBuilder";
import { useInvoiceSendingInterface } from "./shared/hooks/useSendingInterface";
import { Estimate } from "@/hooks/useEstimates";
import { Invoice } from "@/hooks/useInvoices";
import { UpsellItem } from "./shared/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useJobData } from "./unified/hooks/useJobData";
import { useIsMobile } from "@/hooks/use-mobile";

interface SteppedInvoiceBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  existingInvoice?: Invoice;
  estimateToConvert?: Estimate;
  onInvoiceCreated?: (invoice: Invoice) => void;
}

type BuilderStep = "items" | "upsell" | "send";

export const SteppedInvoiceBuilder = ({
  open,
  onOpenChange,
  jobId,
  existingInvoice,
  estimateToConvert,
  onInvoiceCreated
}: SteppedInvoiceBuilderProps) => {
  const isMobile = useIsMobile();
  const [currentStep, setCurrentStep] = useState<BuilderStep>("items");
  const [isCompleting, setIsCompleting] = useState(false);
  const [savedInvoice, setSavedInvoice] = useState<any>(null);
  const [selectedUpsells, setSelectedUpsells] = useState<UpsellItem[]>([]);
  const [upsellNotes, setUpsellNotes] = useState("");
  const [invoiceCreated, setInvoiceCreated] = useState(false);

  // Get job and client data
  const { clientInfo, loading: jobLoading } = useJobData(jobId);

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
    handleUpdateLineItem: originalHandleUpdateLineItem,
    calculateSubtotal,
    calculateTotalTax,
    calculateGrandTotal,
    saveInvoiceChanges,
    resetForm,
    initializeFromEstimate,
    initializeFromInvoice
  } = useInvoiceBuilder(jobId);

  // Create a wrapper function to match the standardized interface
  const handleUpdateLineItem = (id: string, field: string, value: any) => {
    originalHandleUpdateLineItem(id, { [field]: value });
  };

  // Initialize form data when dialog opens
  useEffect(() => {
    if (open) {
      if (existingInvoice) {
        initializeFromInvoice(existingInvoice);
        setInvoiceCreated(true);
        setSavedInvoice(existingInvoice);
      } else if (estimateToConvert) {
        initializeFromEstimate(estimateToConvert);
      } else {
        resetForm();
      }
      setCurrentStep("items");
      setSelectedUpsells([]);
      setUpsellNotes("");
    }
  }, [open, existingInvoice, estimateToConvert, initializeFromEstimate, initializeFromInvoice, resetForm]);

  const handleSaveAndContinue = async () => {
    if (lineItems.length === 0) {
      toast.error("Please add at least one item to the invoice");
      return;
    }

    try {
      console.log("💾 Saving invoice before continuing to upsell step...");
      
      // Always save the invoice, whether it's new or existing
      const invoice = await saveInvoiceChanges();
      
      if (invoice) {
        setSavedInvoice(invoice);
        setInvoiceCreated(true);
        console.log("✅ Invoice saved successfully:", invoice.id);
        toast.success("Invoice saved successfully!");
        
        // Move to upsell step
        setCurrentStep("upsell");
      } else {
        toast.error("Failed to save invoice. Please try again.");
        return;
      }
    } catch (error: any) {
      console.error("Error in handleSaveAndContinue:", error);
      toast.error("Failed to save invoice: " + (error.message || "Unknown error"));
    }
  };

  // Create job context including invoiceId
  const jobContext = {
    job_type: 'General Service',
    service_category: 'Maintenance',
    job_value: calculateGrandTotal(),
    client_history: null,
    invoiceId: savedInvoice?.id || existingInvoice?.id
  };

  const handleUpsellContinue = async (upsells: UpsellItem[], notes: string) => {
    setSelectedUpsells(prev => [...prev, ...upsells]);
    setUpsellNotes(notes);
    
    // Don't add line items here since they're already saved in the upsell step
    // Just update notes if needed
    if (notes.trim() && savedInvoice?.id) {
      try {
        console.log("💾 Updating invoice notes...");
        const { error } = await supabase
          .from('invoices')
          .update({ notes: notes.trim() })
          .eq('id', savedInvoice.id);
          
        if (error) {
          console.error('Error updating notes:', error);
          toast.error('Failed to save notes');
          return;
        }
      } catch (error) {
        console.error("Failed to save notes:", error);
        toast.error("Failed to save notes");
        return;
      }
    }
    
    setCurrentStep("send");
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

  const handleDialogClose = () => {
    if (currentStep === "send") {
      setCurrentStep("upsell");
    } else if (currentStep === "upsell") {
      setCurrentStep("items");
    } else {
      onOpenChange(false);
    }
  };

  // Function to save invoice without continuing (for cancel/close scenarios)
  const handleSaveForLater = async () => {
    if (lineItems.length === 0) {
      onOpenChange(false);
      return;
    }

    try {
      console.log("💾 Saving invoice for later...");
      const invoice = await saveInvoiceChanges();
      if (invoice) {
        toast.success("Invoice saved as draft");
        onOpenChange(false);
        
        if (onInvoiceCreated) {
          onInvoiceCreated(invoice);
        }
      }
    } catch (error) {
      console.error("Error saving invoice:", error);
      toast.error("Failed to save invoice");
    }
  };

  // Get client info for sending
  const getClientInfo = () => {
    if (clientInfo) {
      return {
        name: clientInfo.name || '',
        email: clientInfo.email || '',
        phone: clientInfo.phone || ''
      };
    }
    return { name: '', email: '', phone: '' };
  };

  const steps = [
    { number: 1, title: "Items & Pricing", description: "Add line items and set pricing" },
    { number: 2, title: "Additional Services", description: "Add warranties and extras" },
    { number: 3, title: "Send Invoice", description: "Review and send to client" }
  ];

  const isStepComplete = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return lineItems.length > 0;
      case 2:
        return true; // Upsell step is always optional
      case 3:
        return false; // Send step is never "complete" until actually sent
      default:
        return false;
    }
  };

  const stepTitles = {
    items: existingInvoice ? "Edit Invoice" : "Create Invoice",
    upsell: "Enhance Your Invoice",
    send: "Send Invoice"
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
            <DialogTitle className={`flex flex-col gap-3 ${isMobile ? 'text-base' : 'text-lg'}`}>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  Step {currentStepNumber} of 3
                </span>
                <span className={`${isMobile ? 'text-sm' : 'text-base'} truncate`}>{stepTitles[currentStep]}</span>
                {invoiceNumber && (
                  <span className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'} truncate`}>
                    (#{invoiceNumber})
                  </span>
                )}
              </div>
            </DialogTitle>
            
            {/* Step Indicator - Mobile Responsive */}
            <div className={`flex items-center justify-center space-x-1 py-2 ${isMobile ? 'overflow-x-auto scrollbar-hide' : ''}`}>
              {steps.map((step, index) => (
                <div key={step.number} className={`flex items-center ${isMobile ? 'flex-shrink-0' : ''}`}>
                  <div className={`flex items-center justify-center ${isMobile ? 'w-6 h-6' : 'w-8 h-8'} rounded-full border-2 ${
                    currentStepNumber === step.number
                      ? "border-primary bg-primary text-primary-foreground"
                      : isStepComplete(step.number)
                      ? "border-green-500 bg-green-500 text-white"
                      : "border-gray-300 bg-white text-gray-500"
                  }`}>
                    {isStepComplete(step.number) ? (
                      <Check className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                    ) : (
                      <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>{step.number}</span>
                    )}
                  </div>
                  
                  {!isMobile && (
                    <div className="ml-3 text-left">
                      <div className={`text-sm font-medium ${
                        currentStepNumber === step.number ? "text-primary" : "text-gray-500"
                      }`}>
                        {step.title}
                      </div>
                      <div className="text-xs text-gray-500">{step.description}</div>
                    </div>
                  )}
                  
                  {index < steps.length - 1 && (
                    <ArrowRight className={`h-3 w-3 text-gray-400 ${isMobile ? 'mx-1' : 'mx-4'}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Mobile Step Title */}
            {isMobile && (
              <div className="text-center">
                <div className="text-sm font-medium text-primary">
                  {steps[currentStepNumber - 1]?.title}
                </div>
                <div className="text-xs text-gray-500">
                  {steps[currentStepNumber - 1]?.description}
                </div>
              </div>
            )}
          </DialogHeader>
          
          <div className={`flex-1 overflow-y-auto ${isMobile ? 'px-4 pb-20' : 'px-6 pb-6'}`}>
            {currentStep === "items" && (
              <div className="space-y-4 pt-4">
                <UnifiedItemsStep
                  documentType="invoice"
                  documentNumber={invoiceNumber}
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
                <InvoiceUpsellStep
                  documentTotal={calculateGrandTotal()}
                  onContinue={handleUpsellContinue}
                  onBack={() => setCurrentStep("items")}
                  existingUpsellItems={selectedUpsells}
                  estimateToConvert={estimateToConvert}
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
      
      {/* Send Dialog using standardized interface */}
      <SendDialog
        isOpen={currentStep === "send"}
        onClose={() => onOpenChange(false)}
        documentId={savedInvoice?.id || existingInvoice?.id || ''}
        documentNumber={invoiceNumber}
        documentType="invoice"
        total={calculateGrandTotal()}
        contactInfo={getClientInfo()}
        onSuccess={() => onOpenChange(false)}
        onSave={handleSaveAndSend}
        useSendingHook={useInvoiceSendingInterface}
      />
    </>
  );
};
