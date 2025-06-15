
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign } from "lucide-react";
import { QuickAmountButtons } from "./QuickAmountButtons";

interface PaymentFormProps {
  amount: string;
  setAmount: (amount: string) => void;
  method: string;
  setMethod: (method: string) => void;
  reference: string;
  setReference: (reference: string) => void;
  notes: string;
  setNotes: (notes: string) => void;
  remainingBalance: number;
  maxPayment: number;
  isFormDisabled: boolean;
}

export const PaymentForm = ({
  amount,
  setAmount,
  method,
  setMethod,
  reference,
  setReference,
  notes,
  setNotes,
  remainingBalance,
  maxPayment,
  isFormDisabled
}: PaymentFormProps) => {
  return (
    <div className="space-y-4">
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
        <QuickAmountButtons
          remainingBalance={remainingBalance}
          maxPayment={maxPayment}
          onAmountSelect={setAmount}
          disabled={isFormDisabled}
        />
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
    </div>
  );
};
