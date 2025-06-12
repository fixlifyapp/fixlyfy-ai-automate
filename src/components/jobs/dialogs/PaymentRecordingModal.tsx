
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, CreditCard, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { usePaymentActions } from "@/hooks/usePaymentActions";

interface PaymentRecordingModalProps {
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
  onPaymentRecorded?: () => void;
}

export const PaymentRecordingModal = ({
  isOpen,
  onClose,
  invoice,
  jobId,
  onPaymentRecorded
}: PaymentRecordingModalProps) => {
  const [amount, setAmount] = useState(invoice.balance?.toString() || invoice.total.toString());
  const [method, setMethod] = useState("cash");
  const [date, setDate] = useState<Date>(new Date());
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  
  const { addPayment, isProcessing } = usePaymentActions(jobId, () => {
    if (onPaymentRecorded) onPaymentRecorded();
  });

  const remainingBalance = invoice.balance ?? (invoice.total - (invoice.amount_paid ?? 0));
  const maxPayment = Math.max(0, remainingBalance);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const paymentAmount = parseFloat(amount);
    
    if (!paymentAmount || paymentAmount <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }
    
    if (paymentAmount > maxPayment) {
      toast.error(`Payment amount cannot exceed remaining balance of $${maxPayment.toFixed(2)}`);
      return;
    }

    const success = await addPayment({
      invoiceId: invoice.id,
      amount: paymentAmount,
      method,
      reference: reference.trim() || undefined,
      notes: notes.trim() || undefined
    });

    if (success) {
      toast.success("Payment recorded successfully!");
      handleClose();
    }
  };

  const handleClose = () => {
    setAmount(invoice.balance?.toString() || invoice.total.toString());
    setMethod("cash");
    setDate(new Date());
    setReference("");
    setNotes("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-green-600" />
            Record Payment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invoice Summary */}
          <div className="bg-blue-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Invoice:</span>
              <span>#{invoice.invoice_number}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-medium">Total:</span>
              <span>${invoice.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-medium">Paid:</span>
              <span>${(invoice.amount_paid ?? 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold border-t pt-2">
              <span>Remaining:</span>
              <span className="text-red-600">${remainingBalance.toFixed(2)}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Payment Amount */}
            <div>
              <Label htmlFor="amount">Payment Amount *</Label>
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
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Maximum: ${maxPayment.toFixed(2)}
              </p>
            </div>

            {/* Payment Method */}
            <div>
              <Label htmlFor="method">Payment Method *</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="debit_card">Debit Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Date */}
            <div>
              <Label>Payment Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => date && setDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Reference Number */}
            <div>
              <Label htmlFor="reference">Reference Number</Label>
              <Input
                id="reference"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Check number, transaction ID, etc."
              />
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional payment details..."
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isProcessing || !amount}
                className="flex-1"
              >
                {isProcessing ? "Recording..." : "Record Payment"}
              </Button>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
