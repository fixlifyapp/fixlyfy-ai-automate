import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PaymentMethod } from "@/types/payment";
import { Check, DollarSign, CreditCard, FileText } from "lucide-react";
import { ToastTimer } from "@/components/ui/toast";
import { roundToCurrency } from "@/lib/utils";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  balance: number;
  onPaymentProcessed: (amount: number, method: PaymentMethod, reference?: string, notes?: string) => void;
}

export const PaymentDialog = ({ open, onOpenChange, balance, onPaymentProcessed }: PaymentDialogProps) => {
  const [amount, setAmount] = useState<number>(0);
  const [method, setMethod] = useState<PaymentMethod>("credit-card");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Update amount when balance changes, with proper rounding
  useEffect(() => {
    const roundedBalance = roundToCurrency(balance);
    setAmount(roundedBalance);
  }, [balance]);

  const handleSubmit = async () => {
    const roundedAmount = roundToCurrency(amount);
    if (roundedAmount <= 0) return;
    
    setIsLoading(true);
    try {
      await onPaymentProcessed(roundedAmount, method, reference, notes);
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error("Payment processing error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    const roundedBalance = roundToCurrency(balance);
    setAmount(roundedBalance);
    setMethod("credit-card");
    setReference("");
    setNotes("");
  };

  const getMethodIcon = (paymentMethod: PaymentMethod) => {
    switch (paymentMethod) {
      case "credit-card":
        return <CreditCard size={18} className="text-blue-500" />;
      case "cash":
        return <DollarSign size={18} className="text-green-500" />;
      case "e-transfer":
        return <FileText size={18} className="text-purple-500" />;
      case "cheque":
        return <FileText size={18} className="text-orange-500" />;
      default:
        return <CreditCard size={18} />;
    }
  };

  const remainingBalance = roundToCurrency(balance - amount);

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) resetForm();
      onOpenChange(newOpen);
    }}>
      <DialogContent className="max-w-md sm:max-w-lg sm:rounded-lg fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-xl flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            Record Payment
          </DialogTitle>
          <DialogDescription>
            Enter payment details below to record a new payment.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="payment-amount" className="text-sm font-medium">
              Payment Amount ($)
            </Label>
            <Input 
              id="payment-amount"
              type="number"
              min="0"
              step="0.01"
              value={amount.toFixed(2)}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Remaining balance: ${remainingBalance.toFixed(2)}
            </p>
          </div>
          
          <div>
            <Label className="text-sm font-medium">Payment Method</Label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {(['credit-card', 'cash', 'e-transfer', 'cheque'] as PaymentMethod[]).map((paymentMethod) => (
                <Button
                  key={paymentMethod}
                  type="button"
                  variant={method === paymentMethod ? "default" : "outline"}
                  className={`justify-start h-auto py-2 px-3 ${method === paymentMethod ? "" : "border-muted-foreground/20"}`}
                  onClick={() => setMethod(paymentMethod)}
                >
                  <div className="flex items-center gap-2">
                    {getMethodIcon(paymentMethod)}
                    <span className="capitalize">
                      {paymentMethod.replace('-', ' ')}
                    </span>
                  </div>
                  {method === paymentMethod && (
                    <Check className="ml-auto h-4 w-4" />
                  )}
                </Button>
              ))}
            </div>
          </div>
          
          <div>
            <Label htmlFor="payment-reference" className="text-sm font-medium">
              Reference Number
              <span className="text-xs font-normal text-muted-foreground ml-1">
                (Optional)
              </span>
            </Label>
            <Input
              id="payment-reference"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Transaction ID, check #, etc."
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="payment-notes" className="text-sm font-medium">
              Notes
              <span className="text-xs font-normal text-muted-foreground ml-1">
                (Optional)
              </span>
            </Label>
            <Textarea
              id="payment-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional payment details..."
              className="mt-1"
              rows={3}
            />
          </div>
        </div>
        
        <DialogFooter className="border-t pt-4 mt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={amount <= 0 || isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? "Processing..." : "Record Payment"}
          </Button>
        </DialogFooter>
        <ToastTimer />
      </DialogContent>
    </Dialog>
  );
};
