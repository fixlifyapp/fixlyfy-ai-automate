
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { toast } from "sonner";
import { PaymentSummaryCard } from "./payment/PaymentSummaryCard";
import { PaymentForm } from "./payment/PaymentForm";
import { usePaymentForm } from "./payment/usePaymentForm";

interface UnifiedPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: {
    id: string;
    invoice_number: string;
    total: number;
    amount_paid?: number;
    balance?: number;
  };
  jobId: string;
  onPaymentAdded?: () => void;
}

export const UnifiedPaymentDialog = ({
  isOpen,
  onClose,
  invoice,
  jobId,
  onPaymentAdded
}: UnifiedPaymentDialogProps) => {
  const {
    amount,
    setAmount,
    method,
    setMethod,
    reference,
    setReference,
    notes,
    setNotes,
    isSubmitting,
    isProcessing,
    remainingBalance,
    maxPayment,
    handleSubmit,
    resetForm
  } = usePaymentForm({ invoice, jobId, onPaymentAdded, onClose });

  const handleClose = () => {
    // Don't allow closing while submitting
    if (isSubmitting || isProcessing) {
      toast.error('Please wait for the payment to be processed');
      return;
    }
    
    resetForm();
    onClose();
  };

  const isFormDisabled = isSubmitting || isProcessing;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-green-600" />
            Record Payment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <PaymentSummaryCard 
            invoice={invoice} 
            remainingBalance={remainingBalance} 
          />

          <form onSubmit={handleSubmit} className="space-y-4">
            <PaymentForm
              amount={amount}
              setAmount={setAmount}
              method={method}
              setMethod={setMethod}
              reference={reference}
              setReference={setReference}
              notes={notes}
              setNotes={setNotes}
              remainingBalance={remainingBalance}
              maxPayment={maxPayment}
              isFormDisabled={isFormDisabled}
            />

            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                disabled={isFormDisabled || !amount}
                className="flex-1"
              >
                {isSubmitting || isProcessing ? "Recording..." : "Record Payment"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={isSubmitting || isProcessing}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
