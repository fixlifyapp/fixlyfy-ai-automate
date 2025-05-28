
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, X } from "lucide-react";

interface PaymentFormProps {
  invoices: Array<{
    id: string;
    invoice_number: string;
    balance: number;
    total: number;
  }>;
  onSubmit: (data: {
    invoiceId: string;
    amount: number;
    method: string;
    reference?: string;
    notes?: string;
  }) => Promise<boolean>;
  onCancel: () => void;
  isProcessing: boolean;
}

export const PaymentForm = ({ invoices, onSubmit, onCancel, isProcessing }: PaymentFormProps) => {
  const [formData, setFormData] = useState({
    invoiceId: '',
    amount: 0,
    method: 'credit-card',
    reference: '',
    notes: ''
  });

  const selectedInvoice = invoices.find(inv => inv.id === formData.invoiceId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.invoiceId || formData.amount <= 0) {
      return;
    }

    const success = await onSubmit(formData);
    if (success) {
      setFormData({
        invoiceId: '',
        amount: 0,
        method: 'credit-card',
        reference: '',
        notes: ''
      });
      onCancel();
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Record Payment
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="invoice">Invoice</Label>
            <Select 
              value={formData.invoiceId} 
              onValueChange={(value) => {
                const invoice = invoices.find(inv => inv.id === value);
                setFormData(prev => ({
                  ...prev,
                  invoiceId: value,
                  amount: invoice?.balance || 0
                }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an invoice" />
              </SelectTrigger>
              <SelectContent>
                {invoices
                  .filter(inv => inv.balance > 0)
                  .map((invoice) => (
                    <SelectItem key={invoice.id} value={invoice.id}>
                      {invoice.invoice_number} - ${invoice.balance.toFixed(2)} remaining
                    </SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="amount">Payment Amount</Label>
            <Input
              id="amount"
              type="number"
              min="0.01"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
              required
            />
            {selectedInvoice && (
              <p className="text-xs text-muted-foreground mt-1">
                Maximum: ${selectedInvoice.balance.toFixed(2)}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="method">Payment Method</Label>
            <Select value={formData.method} onValueChange={(value) => setFormData(prev => ({ ...prev, method: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="credit-card">Credit Card</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="e-transfer">E-Transfer</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="reference">Reference (Optional)</Label>
            <Input
              id="reference"
              placeholder="Transaction ID, check number, etc."
              value={formData.reference}
              onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Payment notes..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isProcessing || !formData.invoiceId || formData.amount <= 0} className="flex-1">
              {isProcessing ? "Recording..." : "Record Payment"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
