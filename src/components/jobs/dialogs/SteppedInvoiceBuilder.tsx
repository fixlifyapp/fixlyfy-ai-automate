
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
import { InvoiceSendStep } from "./invoice-builder/InvoiceSendStep";
import { useInvoiceBuilder } from "../hooks/useInvoiceBuilder";
import { Estimate } from "@/hooks/useEstimates";
import { Invoice } from "@/hooks/useInvoices";

interface SteppedInvoiceBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  existingInvoice?: Invoice;
  estimateToConvert?: Estimate;
  onInvoiceCreated?: (invoice: Invoice) => void;
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
  const [savedInvoice, setSavedInvoice] = useState<any>(null);
  const [selectedUpsells, setSelectedUpsells] = useState<UpsellItem[]>([]);
  const [upsellNotes, setUpsellNotes] = useState("");
  const [invoiceCreated, setInvoiceCreated] = useState(false);
  const [addedUpsellIds, setAddedUpsellIds] = useState<Set<string>>(new Set());

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
    handleUpdateLineItem,
    calculateSubtotal,
    calculateTotalTax,
    calculateGrandTotal,
    saveInvoiceChanges,
    resetForm,
    initializeFromEstimate,
    initializeFromInvoice
  } = useInvoiceBuilder(jobId);

  // Initialize form data when dialog opens
  useEffect(() => {
    if (open) {
      if (existingInvoice) {
        initializeFromInvoice(existingInvoice);
        setInvoiceCreated(true);
      } else if (estimateToConvert) {
        initializeFromEstimate(estimateToConvert);
      } else {
        resetForm();
      }
      setCurrentStep("items");
      setSelectedUpsells([]);
      setUpsellNotes("");
      setAddedUpsellIds(new Set());
    }
  }, [open, existingInvoice, estimateToConvert, initializeFromEstimate, initializeFromInvoice, resetForm]);

  const handleSaveAndContinue = async () => {
    if (lineItems.length === 0) {
      return;
    }

    try {
      if (!invoiceCreated || !savedInvoice) {
        const invoice = await saveInvoiceChanges();
        if (invoice) {
          setSavedInvoice(invoice);
          setInvoiceCreated(true);
        } else {
          return;
        }
      }
      setCurrentStep("upsell");
    } catch (error) {
      console.error("Error saving invoice:", error);
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
        const updatedInvoice = await saveInvoiceChanges();
        if (updatedInvoice) {
          setSavedInvoice(updatedInvoice);
        }
      } catch (error) {
        console.error("Failed to save upsells:", error);
        return;
      }
    }
    
    const combinedNotes = [notes, upsellNotes].filter(Boolean).join('\n\n');
    setNotes(combinedNotes);
    
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

  const canProceedToNext = () => {
    return isStepComplete(currentStep === "items" ? 1 : currentStep === "upsell" ? 2 : 3);
  };

  const stepTitles = {
    items: existingInvoice ? "Edit Invoice" : "Create Invoice",
    upsell: "Enhance Your Invoice",
    send: "Send Invoice"
  };

  const currentStepNumber = currentStep === "items" ? 1 : currentStep === "upsell" ? 2 : 3;

  return (
    <Dialog open={open && currentStep !== "send"} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
              Step {currentStepNumber} of 3
            </span>
            {stepTitles[currentStep]}
            {invoiceNumber && <span className="text-sm text-muted-foreground">(#{invoiceNumber})</span>}
          </DialogTitle>
          
          {/* Step Indicator */}
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
            <InvoiceUpsellStep
              invoiceTotal={calculateGrandTotal()}
              onContinue={handleUpsellContinue}
              onBack={() => setCurrentStep("items")}
              existingUpsellItems={selectedUpsells}
            />
          )}
        </div>
      </DialogContent>
      
      {/* Send Dialog - rendered outside the main dialog */}
      {currentStep === "send" && (
        <Dialog open={true} onOpenChange={() => setCurrentStep("upsell")}>
          <DialogContent className="max-w-3xl">
            <InvoiceSendStep
              invoiceNumber={invoiceNumber}
              lineItems={lineItems}
              notes={notes}
              total={calculateGrandTotal()}
              jobId={jobId}
              onSave={handleSaveAndSend}
              onClose={() => onOpenChange(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
};
