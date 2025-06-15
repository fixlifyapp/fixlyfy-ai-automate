
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
import { UniversalSendDialog } from "./shared/UniversalSendDialog";
import { useUnifiedDocumentBuilder } from "./unified/useUnifiedDocumentBuilder";
import { useInvoiceSending } from "./shared/hooks/useInvoiceSending";
import { Estimate } from "@/hooks/useEstimates";
import { Invoice } from "@/hooks/useInvoices";
import { UpsellItem } from "./shared/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useJobData } from "./unified/hooks/useJobData";

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
  const [currentStep, setCurrentStep] = useState<BuilderStep>("items");
  const [isCompleting, setIsCompleting] = useState(false);
  const [savedInvoice, setSavedInvoice] = useState<Invoice | null>(null);
  const [selectedUpsells, setSelectedUpsells] = useState<UpsellItem[]>([]);
  const [upsellNotes, setUpsellNotes] = useState("");
  const [invoiceCreated, setInvoiceCreated] = useState(false);

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
    isInitialized,
    isSubmitting,
    handleAddProduct,
    handleRemoveLineItem,
    handleUpdateLineItem,
    calculateSubtotal,
    calculateTotalTax,
    calculateGrandTotal,
    saveDocumentChanges
  } = useUnifiedDocumentBuilder({
    documentType: "invoice",
    existingDocument: existingInvoice || estimateToConvert,
    jobId,
    open,
    onSyncToInvoice: undefined
  });

  // Initialize form data when dialog opens
  useEffect(() => {
    if (open) {
      if (existingInvoice) {
        setInvoiceCreated(true);
        setSavedInvoice(existingInvoice);
      } else if (estimateToConvert) {
        // The unified hook will handle estimate conversion
        setInvoiceCreated(false);
        setSavedInvoice(null);
      }
      setCurrentStep("items");
      setSelectedUpsells([]);
      setUpsellNotes("");
    }
  }, [open, existingInvoice, estimateToConvert]);

  const handleSaveAndContinue = async () => {
    if (lineItems.length === 0) {
      toast.error("Please add at least one item to the invoice");
      return;
    }

    try {
      console.log("💾 Saving invoice before continuing to upsell step...");
      
      const invoice = await saveDocumentChanges();
      
      if (invoice) {
        setSavedInvoice(invoice as Invoice);
        setInvoiceCreated(true);
        console.log("✅ Invoice saved successfully:", invoice.id);
        toast.success("Invoice saved successfully!");
        
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

  const handleDialogClose = () => {
    if (currentStep === "send") {
      setCurrentStep("upsell");
    } else if (currentStep === "upsell") {
      setCurrentStep("items");
    } else {
      onOpenChange(false);
    }
  };

  const handleSendDialogClose = () => {
    // Return to the upsell step instead of closing the entire dialog
    setCurrentStep("upsell");
  };

  const handleSendSuccess = () => {
    // Close the entire dialog after successful send
    onOpenChange(false);
  };

  const handleSaveForLater = async () => {
    if (lineItems.length === 0) {
      onOpenChange(false);
      return;
    }

    try {
      console.log("💾 Saving invoice for later...");
      const invoice = await saveDocumentChanges();
      if (invoice) {
        toast.success("Invoice saved as draft");
        onOpenChange(false);
        
        if (onInvoiceCreated) {
          onInvoiceCreated(invoice as Invoice);
        }
      }
    } catch (error) {
      console.error("Error saving invoice:", error);
      toast.error("Failed to save invoice");
    }
  };

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

  // Get the current invoice ID for the send dialog
  const getCurrentInvoiceId = () => {
    // Always prefer savedInvoice (newly created) over existingInvoice
    return savedInvoice?.id || existingInvoice?.id || '';
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
        return true;
      case 3:
        return false;
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
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                Step {currentStepNumber} of 3
              </span>
              {stepTitles[currentStep]}
              {documentNumber && <span className="text-sm text-muted-foreground">(#{documentNumber})</span>}
            </DialogTitle>
            
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
          </DialogHeader>
          
          <div className="py-6">
            {currentStep === "items" && (
              <>
                <UnifiedItemsStep
                  documentType="invoice"
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
                  <Button 
                    variant="outline" 
                    onClick={lineItems.length > 0 ? handleSaveForLater : () => onOpenChange(false)}
                  >
                    {lineItems.length > 0 ? "Save for Later" : "Cancel"}
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
              <InvoiceUpsellStep
                documentTotal={calculateGrandTotal()}
                onContinue={handleUpsellContinue}
                onBack={() => setCurrentStep("items")}
                existingUpsellItems={selectedUpsells}
                estimateToConvert={estimateToConvert}
                jobContext={jobContext}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      <UniversalSendDialog
        isOpen={currentStep === "send"}
        onClose={handleSendDialogClose}
        documentType="invoice"
        documentId={getCurrentInvoiceId()}
        documentNumber={documentNumber}
        total={calculateGrandTotal()}
        contactInfo={getClientInfo()}
        onSuccess={handleSendSuccess}
      />
    </>
  );
};
