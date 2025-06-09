
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { UnifiedItemsStep } from "./unified/UnifiedItemsStep";
import { SendDialog } from "./shared/SendDialog";
import { useUnifiedDocumentBuilder } from "./unified/useUnifiedDocumentBuilder";
import { useInvoiceSendingInterface } from "./shared/hooks/useSendingInterface";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { generateNextId } from "@/utils/idGeneration";
import { useJobData } from "./unified/hooks/useJobData";
import { useIsMobile } from "@/hooks/use-mobile";

interface SteppedInvoiceBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  existingInvoice?: any;
  onInvoiceCreated?: () => void;
}

type BuilderStep = "items" | "send";

export const SteppedInvoiceBuilder = ({
  open,
  onOpenChange,
  jobId,
  existingInvoice,
  onInvoiceCreated
}: SteppedInvoiceBuilderProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const { clientInfo, jobAddress, loading: jobDataLoading } = useJobData(jobId);
  
  const [currentStep, setCurrentStep] = useState<BuilderStep>("items");
  const [savedInvoice, setSavedInvoice] = useState<any>(null);
  const [invoiceCreated, setInvoiceCreated] = useState(false);

  // Create contactInfo object for compatibility
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
    documentType: "invoice",
    existingDocument: existingInvoice,
    jobId,
    open
  });

  // Reset step when dialog opens/closes
  useEffect(() => {
    if (open) {
      setCurrentStep("items");
      setSavedInvoice(existingInvoice || null);
      setInvoiceCreated(!!existingInvoice);
    }
  }, [open, existingInvoice]);

  // Generate invoice number if creating new
  useEffect(() => {
    const generateInvoiceNumber = async () => {
      if (open && !existingInvoice && !documentNumber) {
        try {
          const newNumber = await generateNextId('invoice');
          setDocumentNumber(newNumber);
        } catch (error) {
          console.error("Error generating invoice number:", error);
          const fallbackNumber = `INV-${Date.now()}`;
          setDocumentNumber(fallbackNumber);
        }
      }
    };

    generateInvoiceNumber();
  }, [open, existingInvoice, documentNumber, setDocumentNumber]);

  const handleSaveAndContinue = async () => {
    if (lineItems.length === 0) {
      toast.error("Please add at least one item to the invoice");
      return;
    }

    if (!jobId) {
      toast.error("Job ID is required to save invoice");
      return;
    }
    
    try {
      console.log("💾 Saving invoice before continuing to send step...");
      
      const invoice = await saveDocumentChanges();
      
      if (invoice) {
        setSavedInvoice(invoice);
        setInvoiceCreated(true);
        console.log("✅ Invoice saved successfully:", invoice.id);
        toast.success("Invoice saved successfully!");
        
        // Move to send step
        setCurrentStep("send");
      } else {
        toast.error("Failed to save invoice. Please try again.");
        return;
      }
    } catch (error: any) {
      console.error("Error in handleSaveAndContinue:", error);
      toast.error("Failed to save invoice: " + (error.message || "Unknown error"));
    }
  };

  const handleSaveAndSend = async () => {
    try {
      const savedInvoice = await saveDocumentChanges();
      if (savedInvoice && onInvoiceCreated) {
        onInvoiceCreated();
      }
      return savedInvoice !== null;
    } catch (error) {
      console.error("Error saving invoice:", error);
      return false;
    }
  };

  const handleSendSuccess = () => {
    onOpenChange(false);
    
    if (onInvoiceCreated) {
      onInvoiceCreated();
    }

    setTimeout(() => {
      navigate(`/jobs/${jobId}`, { 
        state: { activeTab: "invoices" },
        replace: true 
      });
    }, 100);
  };

  const handleSendCancel = () => {
    setCurrentStep("items");
  };

  const handleDialogClose = () => {
    if (currentStep === "send") {
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
      await saveDocumentChanges();
      toast.success("Invoice saved as draft");
      onOpenChange(false);
      
      if (onInvoiceCreated) {
        onInvoiceCreated();
      }
    } catch (error) {
      console.error("Error saving invoice:", error);
      toast.error("Failed to save invoice");
    }
  };

  const stepTitles = {
    items: existingInvoice ? "Edit Invoice" : "Create Invoice",
    send: "Send Invoice"
  };

  const currentStepNumber = currentStep === "items" ? 1 : 2;

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
                  Step {currentStepNumber} of 2
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

      {/* Send Dialog */}
      <SendDialog
        isOpen={currentStep === "send"}
        onClose={() => handleSendCancel()}
        documentId={savedInvoice?.id || existingInvoice?.id || ''}
        documentNumber={savedInvoice?.invoice_number || savedInvoice?.number || documentNumber}
        documentType="invoice"
        total={calculateGrandTotal()}
        contactInfo={contactInfo}
        onSuccess={handleSendSuccess}
        onSave={handleSaveAndSend}
        useSendingHook={useInvoiceSendingInterface}
      />
    </>
  );
};
