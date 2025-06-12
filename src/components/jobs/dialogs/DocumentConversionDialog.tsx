
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { 
  FileText, 
  DollarSign, 
  ArrowRight, 
  Calendar,
  CreditCard,
  Check,
  AlertCircle
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { PaymentRecordingModal } from "./PaymentRecordingModal";

interface DocumentConversionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceDocument: {
    id: string;
    number: string;
    type: "estimate" | "invoice";
    total: number;
    lineItems: any[];
    client: string;
    jobId: string;
  };
  onConvert: (data: any) => Promise<any>;
  onPaymentRecorded?: () => void;
}

export const DocumentConversionDialog = ({
  open,
  onOpenChange,
  sourceDocument,
  onConvert,
  onPaymentRecorded
}: DocumentConversionDialogProps) => {
  const [isConverting, setIsConverting] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [convertedInvoice, setConvertedInvoice] = useState<any>(null);

  const targetType = sourceDocument.type === "estimate" ? "invoice" : "estimate";

  const handleConvert = async () => {
    setIsConverting(true);
    
    try {
      const conversionData = {
        sourceId: sourceDocument.id,
        targetType,
        lineItems: sourceDocument.lineItems
      };

      const result = await onConvert(conversionData);
      
      if (result && targetType === "invoice") {
        setConvertedInvoice(result);
        toast.success(`${sourceDocument.type} converted to ${targetType} successfully!`);
        
        // Ask if they want to record a payment
        setTimeout(() => {
          setShowPaymentModal(true);
        }, 500);
      } else {
        toast.success(`${sourceDocument.type} converted to ${targetType} successfully!`);
        onOpenChange(false);
      }
      
    } catch (error) {
      console.error("Conversion error:", error);
      toast.error("Failed to convert document");
    } finally {
      setIsConverting(false);
    }
  };

  const handlePaymentRecorded = () => {
    setShowPaymentModal(false);
    onOpenChange(false);
    if (onPaymentRecorded) {
      onPaymentRecorded();
    }
  };

  const handleSkipPayment = () => {
    setShowPaymentModal(false);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open && !showPaymentModal} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Convert {sourceDocument.type === "estimate" ? "Estimate" : "Invoice"}
              <ArrowRight className="h-4 w-4" />
              {targetType === "estimate" ? "Estimate" : "Invoice"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Source Document Info */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    <span className="font-semibold">Source Document</span>
                  </div>
                  <Badge variant="outline">{sourceDocument.type}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Number</p>
                    <p className="font-semibold">{sourceDocument.number}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Client</p>
                    <p className="font-semibold">{sourceDocument.client}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total</p>
                    <p className="font-semibold">{formatCurrency(sourceDocument.total)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Line Items</p>
                    <p className="font-semibold">{sourceDocument.lineItems.length} items</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Conversion Details */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  <span className="font-semibold">Conversion Details</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="text-sm">All line items and warranty selections will be copied</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <span className="text-sm">New {targetType} number will be auto-generated</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                  <FileText className="h-5 w-5 text-orange-600" />
                  <span className="text-sm">Original {sourceDocument.type} will be marked as converted</span>
                </div>
                {targetType === "invoice" && (
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <CreditCard className="h-5 w-5 text-purple-600" />
                    <span className="text-sm">Option to record payment after conversion</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Warning for estimate conversion */}
            {targetType === "estimate" && (
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800">Converting Invoice to Estimate</p>
                  <p className="text-amber-700 mt-1">
                    This will create a new estimate and mark the original invoice as converted. 
                    Any payment records will remain associated with the original invoice.
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleConvert} disabled={isConverting}>
                {isConverting ? "Converting..." : `Convert to ${targetType}`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Recording Modal */}
      {convertedInvoice && (
        <PaymentRecordingModal
          isOpen={showPaymentModal}
          onClose={handleSkipPayment}
          invoice={convertedInvoice}
          jobId={sourceDocument.jobId}
          onPaymentRecorded={handlePaymentRecorded}
        />
      )}
    </>
  );
};
