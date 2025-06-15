
import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { usePaymentActions } from "@/hooks/usePaymentActions";

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
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("cash");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { addPayment, isProcessing } = usePaymentActions(jobId, () => {
    // Enhanced callback to ensure real-time refresh
    console.log('Payment action completed, triggering refresh');
    if (onPaymentAdded) {
      onPaymentAdded();
    }
  });

  const remainingBalance = (invoice.balance ?? (invoice.total - (invoice.amount_paid ?? 0)));
  const maxPayment = Math.max(0, remainingBalance);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent duplicate submissions
    if (isSubmitting || isProcessing) {
      console.log('Payment submission already in progress, ignoring duplicate click');
      return;
    }
    
    const paymentAmount = parseFloat(amount);
    
    if (!paymentAmount || paymentAmount <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }
    
    if (paymentAmount > maxPayment) {
      toast.error(`Payment amount cannot exceed remaining balance of $${maxPayment.toFixed(2)}`);
      return;
    }

    setIsSubmitting(true);
    
    // Clear any existing timeout
    if (submitTimeoutRef.current) {
      clearTimeout(submitTimeoutRef.current);
    }
    
    // Set a timeout to reset submitting state in case of unexpected errors
    submitTimeoutRef.current = setTimeout(() => {
      setIsSubmitting(false);
    }, 10000); // 10 second timeout

    try {
      console.log('Submitting payment for invoice:', invoice.id, 'amount:', paymentAmount);
      
      const success = await addPayment({
        invoiceId: invoice.id,
        amount: paymentAmount,
        method,
        reference: reference.trim() || undefined,
        notes: notes.trim() || undefined
      });

      if (success) {
        console.log('Payment recorded successfully, closing dialog and refreshing');
        
        // Reset form first
        setAmount("");
        setMethod("cash");
        setReference("");
        setNotes("");
        
        // Close dialog immediately
        onClose();
        
        // Show success message
        toast.success("Payment recorded successfully!");
        
        // Small delay to ensure dialog closes before refresh
        setTimeout(() => {
          if (onPaymentAdded) {
            console.log('Triggering payment refresh callback');
            onPaymentAdded();
          }
        }, 100);
      }
    } catch (error) {
      console.error('Error submitting payment:', error);
      toast.error('Failed to submit payment. Please try again.');
    } finally {
      setIsSubmitting(false);
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
        submitTimeoutRef.current = null;
      }
    }
  };

  const handleClose = () => {
    // Don't allow closing while submitting
    if (isSubmitting || isProcessing) {
      toast.error('Please wait for the payment to be processed');
      return;
    }
    
    setAmount("");
    setMethod("cash");
    setReference("");
    setNotes("");
    onClose();
  };

  const handleQuickAmount = (percentage: number) => {
    if (isSubmitting || isProcessing) return;
    
    let quickAmount: string;
    
    // For 100%, use the exact maxPayment to avoid precision issues
    if (percentage === 100) {
      quickAmount = maxPayment.toFixed(2);
    } else {
      quickAmount = (remainingBalance * percentage / 100).toFixed(2);
    }
    
    setAmount(quickAmount);
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
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Invoice:</strong> #{invoice.invoice_number}
            </p>
            <p className="text-sm text-blue-800">
              <strong>Total:</strong> ${invoice.total.toFixed(2)}
            </p>
            <p className="text-sm text-blue-800">
              <strong>Paid:</strong> ${(invoice.amount_paid ?? 0).toFixed(2)}
            </p>
            <p className="text-sm font-semibold text-blue-800">
              <strong>Remaining:</strong> ${remainingBalance.toFixed(2)}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="amount">Payment Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={maxPayment}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-9"
                  disabled={isFormDisabled}
                  required
                />
              </div>
              <div className="flex gap-2 mt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleQuickAmount(25)}
                  disabled={isFormDisabled}
                >
                  25%
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleQuickAmount(50)}
                  disabled={isFormDisabled}
                >
                  50%
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleQuickAmount(100)}
                  disabled={isFormDisabled}
                >
                  Full
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Maximum: ${maxPayment.toFixed(2)}
              </p>
            </div>

            <div>
              <Label htmlFor="method">Payment Method</Label>
              <Select value={method} onValueChange={setMethod} disabled={isFormDisabled}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="debit_card">Debit Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="e_transfer">E-Transfer</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="reference">Reference Number (Optional)</Label>
              <Input
                id="reference"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Check number, transaction ID, etc."
                disabled={isFormDisabled}
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional payment details..."
                rows={3}
                disabled={isFormDisabled}
              />
            </div>

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
