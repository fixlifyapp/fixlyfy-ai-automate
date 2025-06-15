
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send, CreditCard, ArrowRight } from "lucide-react";
import { Invoice } from "@/hooks/useInvoices";
import { Estimate } from "@/hooks/useEstimates";
import { UnifiedDocumentPreview } from "./UnifiedDocumentPreview";
import { UniversalSendDialog } from "../shared/UniversalSendDialog";
import { UnifiedPaymentDialog } from "../UnifiedPaymentDialog";
import { useDocumentOperations } from "./hooks/useDocumentOperations";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

interface UnifiedPreviewStepProps {
  documentType: "estimate" | "invoice";
  document: Invoice | Estimate;
  jobId: string;
  onBack: () => void;
  onAction: (action: 'send' | 'pay' | 'convert') => void;
  clientInfo?: any;
}

export const UnifiedPreviewStep = ({
  documentType,
  document,
  jobId,
  onBack,
  onAction,
  clientInfo
}: UnifiedPreviewStepProps) => {
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const isMobile = useIsMobile();

  // Use document operations hook for conversion
  const { convertToInvoice, isSubmitting } = useDocumentOperations({
    documentType,
    existingDocument: document,
    jobId,
    formData: {
      documentNumber: (document as any).estimate_number || (document as any).invoice_number || '',
      items: Array.isArray(document.items) ? document.items : [],
      notes: document.notes || '',
      status: document.status || 'draft',
      total: document.total || 0
    },
    lineItems: Array.isArray(document.items) ? document.items.map((item: any) => ({
      id: item.id || `item-${Date.now()}`,
      description: item.description || '',
      quantity: item.quantity || 1,
      unitPrice: item.unitPrice || item.unit_price || 0,
      taxable: item.taxable !== undefined ? item.taxable : true,
      total: (item.quantity || 1) * (item.unitPrice || item.unit_price || 0)
    })) : [],
    notes: document.notes || '',
    calculateGrandTotal: () => document.total || 0
  });

  const handleSend = () => {
    setShowSendDialog(true);
  };

  const handlePayment = () => {
    if (documentType === "invoice") {
      setShowPaymentDialog(true);
    }
  };

  const handleConvert = async () => {
    if (documentType === "estimate" && !isSubmitting) {
      try {
        const newInvoice = await convertToInvoice();
        if (newInvoice) {
          toast.success("Estimate converted to invoice successfully!");
          onAction('convert');
        }
      } catch (error) {
        console.error('Error converting estimate to invoice:', error);
        toast.error('Failed to convert estimate to invoice');
      }
    }
  };

  const handleSendSuccess = () => {
    setShowSendDialog(false);
    onAction('send');
  };

  const handlePaymentSuccess = () => {
    setShowPaymentDialog(false);
    onAction('pay');
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

  const canAcceptPayment = (doc: Invoice | Estimate) => {
    if (documentType !== "invoice") return false;
    const status = doc.status?.toLowerCase();
    return status === 'sent' || status === 'partial' || status === 'overdue' || status === 'draft' || status === 'unpaid';
  };

  const documentNumber = (document as any).estimate_number || (document as any).invoice_number || '';

  // Calculate values using available properties or fallback to calculation functions
  const calculateSubtotal = () => {
    // Try to use existing subtotal property first, then fallback to calculation
    const existingSubtotal = (document as any).subtotal;
    if (existingSubtotal !== undefined && existingSubtotal !== null) {
      return existingSubtotal;
    }
    
    // Fallback: calculate from items
    if (Array.isArray(document.items)) {
      return document.items.reduce((sum: number, item: any) => {
        const quantity = item.quantity || 1;
        const unitPrice = item.unitPrice || 0;
        return sum + (quantity * unitPrice);
      }, 0);
    }
    return 0;
  };

  const calculateTotalTax = () => {
    // Try to use existing tax_amount property first
    const existingTax = (document as any).tax_amount;
    if (existingTax !== undefined && existingTax !== null) {
      return existingTax;
    }
    
    // Fallback: calculate from subtotal and tax rate
    const taxRate = document.tax_rate || 13;
    const subtotal = calculateSubtotal();
    return (subtotal * taxRate) / 100;
  };

  const calculateGrandTotal = () => {
    return document.total || (calculateSubtotal() + calculateTotalTax());
  };

  return (
    <>
      <div className="space-y-6">
        {/* Document Preview */}
        <div className="border rounded-lg overflow-hidden">
          <UnifiedDocumentPreview
            documentType={documentType}
            documentNumber={documentNumber}
            lineItems={Array.isArray(document.items) ? document.items.map((item: any) => ({
              id: item.id || `item-${Date.now()}`,
              description: item.description || '',
              quantity: item.quantity || 1,
              unitPrice: item.unitPrice || item.unit_price || 0,
              taxable: item.taxable !== undefined ? item.taxable : true,
              total: (item.quantity || 1) * (item.unitPrice || item.unit_price || 0)
            })) : []}
            taxRate={document.tax_rate || 13}
            calculateSubtotal={calculateSubtotal}
            calculateTotalTax={calculateTotalTax}
            calculateGrandTotal={calculateGrandTotal}
            notes={document.notes || ''}
            clientInfo={clientInfo}
            jobId={jobId}
            issueDate={documentType === "invoice" 
              ? (document as Invoice).issue_date || (document as Invoice).created_at
              : (document as Estimate).created_at}
            dueDate={documentType === "invoice" 
              ? (document as Invoice).due_date
              : (document as Estimate).valid_until}
          />
        </div>

        {/* Action Buttons - Mobile Optimized */}
        <div className={`flex ${isMobile ? 'flex-col gap-3' : 'justify-between'} pt-4 border-t`}>
          <Button 
            variant="outline" 
            onClick={onBack}
            className={`gap-2 ${isMobile ? 'w-full h-12 text-sm' : ''}`}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {documentType === "estimate" ? "Services" : "Upsells"}
          </Button>
          
          <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-2`}>
            <Button
              variant="outline"
              onClick={handleSend}
              className={`gap-2 ${isMobile ? 'w-full h-12 text-sm' : ''}`}
            >
              <Send className="h-4 w-4" />
              Send {documentType}
            </Button>
            
            {canAcceptPayment(document) && (
              <Button
                onClick={handlePayment}
                className={`gap-2 bg-green-600 hover:bg-green-700 ${isMobile ? 'w-full h-12 text-sm' : ''}`}
              >
                <CreditCard className="h-4 w-4" />
                Record Payment
              </Button>
            )}
            
            {documentType === "estimate" && (
              <Button
                onClick={handleConvert}
                disabled={isSubmitting}
                className={`gap-2 ${isMobile ? 'w-full h-12 text-sm' : ''}`}
              >
                {isSubmitting ? "Converting..." : "Convert to Invoice"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Send Dialog */}
      <UniversalSendDialog
        isOpen={showSendDialog}
        onClose={() => setShowSendDialog(false)}
        documentType={documentType}
        documentId={document.id}
        documentNumber={documentNumber}
        total={document.total || 0}
        contactInfo={getClientInfo()}
        onSuccess={handleSendSuccess}
      />

      {/* Payment Dialog */}
      {documentType === "invoice" && (
        <UnifiedPaymentDialog
          isOpen={showPaymentDialog}
          onClose={() => setShowPaymentDialog(false)}
          invoice={document as Invoice}
          jobId={jobId}
          onPaymentAdded={handlePaymentSuccess}
        />
      )}
    </>
  );
};
