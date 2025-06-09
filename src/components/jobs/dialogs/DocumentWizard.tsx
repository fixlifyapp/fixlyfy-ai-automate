
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, FileText, Package, Shield, Send } from 'lucide-react';
import { ProductSelector } from './wizard/ProductSelector';
import { WarrantyUpsell } from './wizard/WarrantyUpsell';
import { SendDocument } from './wizard/SendDocument';
import { useIsMobile } from '@/hooks/use-mobile';

type DocumentType = 'estimate' | 'invoice';

interface LineItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  taxable: boolean;
  isWarranty?: boolean;
}

interface DocumentData {
  type: DocumentType;
  items: LineItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  notes: string;
  sendVia: 'email' | 'sms';
  sendTo: string;
}

interface DocumentWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: DocumentType;
  jobId: string;
  clientInfo?: {
    name: string;
    email?: string;
    phone?: string;
  };
  onDocumentCreated?: (document: DocumentData) => void;
}

export const DocumentWizard = ({
  open,
  onOpenChange,
  type,
  jobId,
  clientInfo,
  onDocumentCreated
}: DocumentWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [documentData, setDocumentData] = useState<DocumentData>({
    type,
    items: [],
    subtotal: 0,
    taxAmount: 0,
    total: 0,
    notes: '',
    sendVia: 'email',
    sendTo: clientInfo?.email || clientInfo?.phone || ''
  });
  const isMobile = useIsMobile();

  const steps = [
    { number: 1, title: 'Products', icon: Package, description: 'Select products and services' },
    { number: 2, title: 'Warranties', icon: Shield, description: 'Add warranty options' },
    { number: 3, title: 'Send', icon: Send, description: 'Send to customer' }
  ];

  const calculateTotals = (items: LineItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = items
      .filter(item => item.taxable)
      .reduce((sum, item) => sum + (item.quantity * item.unitPrice * 0.13), 0);
    const total = subtotal + taxAmount;
    
    return { subtotal, taxAmount, total };
  };

  const updateItems = (items: LineItem[]) => {
    const totals = calculateTotals(items);
    setDocumentData(prev => ({
      ...prev,
      items,
      ...totals
    }));
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onDocumentCreated?.(documentData);
    onOpenChange(false);
  };

  const progress = (currentStep / 3) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-4xl max-h-[90vh] overflow-hidden ${isMobile ? 'p-0 m-2' : ''}`}>
        <DialogHeader className={isMobile ? 'p-4 pb-2' : ''}>
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-primary" />
            <DialogTitle>
              Create {type === 'estimate' ? 'Estimate' : 'Invoice'}
            </DialogTitle>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <Progress value={progress} className="h-2 mb-4" />
            <div className={`grid grid-cols-3 gap-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
              {steps.map((step) => (
                <div 
                  key={step.number}
                  className={`flex items-center gap-2 p-2 rounded ${
                    currentStep === step.number 
                      ? 'bg-primary/10 text-primary' 
                      : currentStep > step.number 
                        ? 'text-muted-foreground' 
                        : 'text-muted-foreground'
                  }`}
                >
                  <step.icon className={`h-4 w-4 ${isMobile ? 'hidden' : ''}`} />
                  <div>
                    <div className="font-medium">{step.title}</div>
                    {!isMobile && (
                      <div className="text-xs opacity-70">{step.description}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogHeader>

        {/* Step Content */}
        <div className={`flex-1 overflow-y-auto ${isMobile ? 'p-4' : 'p-6'}`}>
          {currentStep === 1 && (
            <ProductSelector
              items={documentData.items}
              onItemsChange={updateItems}
              documentType={type}
            />
          )}
          
          {currentStep === 2 && (
            <WarrantyUpsell
              currentItems={documentData.items}
              onItemsChange={updateItems}
              documentType={type}
            />
          )}
          
          {currentStep === 3 && (
            <SendDocument
              documentData={documentData}
              onDataChange={setDocumentData}
              clientInfo={clientInfo}
            />
          )}
        </div>

        {/* Navigation */}
        <div className={`border-t bg-muted/30 flex items-center justify-between ${isMobile ? 'p-4' : 'p-6'}`}>
          <Button 
            variant="outline" 
            onClick={prevStep}
            disabled={currentStep === 1}
            className={isMobile ? 'text-xs px-3' : ''}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Step {currentStep} of 3
            </span>
            
            {currentStep === 3 ? (
              <Button onClick={handleComplete} className={isMobile ? 'text-xs px-3' : ''}>
                <Send className="h-4 w-4 mr-2" />
                Send {type === 'estimate' ? 'Estimate' : 'Invoice'}
              </Button>
            ) : (
              <Button onClick={nextStep} className={isMobile ? 'text-xs px-3' : ''}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
