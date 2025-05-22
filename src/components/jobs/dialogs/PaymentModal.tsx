
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useRBAC } from "@/components/auth/RBACProvider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  client: string;
  balance?: number;
  onSuccess?: () => void;
  title?: string;
}

export const PaymentModal = ({
  open,
  onOpenChange,
  jobId,
  client,
  balance = 0,
  onSuccess,
  title = "Collect Payment"
}: PaymentModalProps) => {
  const [amount, setAmount] = useState(balance > 0 ? balance.toString() : "");
  const [method, setMethod] = useState("credit-card");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState("");
  const { currentUser } = useRBAC();

  // Fetch invoices for this job when modal opens
  React.useEffect(() => {
    if (open && jobId) {
      const fetchInvoices = async () => {
        try {
          const { data, error } = await supabase
            .from('invoices')
            .select('*')
            .eq('job_id', jobId)
            .neq('status', 'paid');
            
          if (error) throw error;
          
          setInvoices(data || []);
          
          // If we have invoices, select the first one
          if (data && data.length > 0) {
            setSelectedInvoiceId(data[0].id);
            setAmount(data[0].balance.toString());
          }
        } catch (error) {
          console.error("Error fetching invoices:", error);
        }
      };
      
      fetchInvoices();
    }
  }, [open, jobId]);

  // Update amount when invoice is selected
  const handleInvoiceChange = (value: string) => {
    setSelectedInvoiceId(value);
    const selected = invoices.find(inv => inv.id === value);
    if (selected) {
      setAmount(selected.balance.toString());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceId) {
      toast.error("Please select an invoice");
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsSubmitting(true);

    try {
      const paymentAmount = parseFloat(amount);
      const invoice = invoices.find(inv => inv.id === selectedInvoiceId);
      
      if (!invoice) {
        throw new Error("Invoice not found");
      }

      // Make sure payment amount doesn't exceed balance
      if (paymentAmount > invoice.balance) {
        toast.error("Payment amount cannot exceed invoice balance");
        setIsSubmitting(false);
        return;
      }
      
      // Record the payment
      const { data: paymentData, error: paymentError } = await supabase
        .from('payments')
        .insert({
          invoice_id: selectedInvoiceId,
          amount: paymentAmount,
          method: method,
          reference: reference,
          notes: notes,
          date: new Date().toISOString()
        })
        .select()
        .single();

      if (paymentError) throw paymentError;
      
      // Update the invoice
      const newAmountPaid = invoice.amount_paid + paymentAmount;
      const newBalance = invoice.total - newAmountPaid;
      const newStatus = newBalance === 0 ? 'paid' : 'partial';
      
      const { error: invoiceError } = await supabase
        .from('invoices')
        .update({
          amount_paid: newAmountPaid,
          balance: newBalance,
          status: newStatus
        })
        .eq('id', selectedInvoiceId);
        
      if (invoiceError) throw invoiceError;
      
      // Record in job history
      await supabase.from('job_history').insert({
        job_id: jobId,
        type: 'payment_received',
        title: 'Payment Received',
        description: `Payment of $${paymentAmount.toFixed(2)} received via ${method}`,
        user_id: currentUser?.id,
        user_name: currentUser?.name,
        meta: { 
          payment_id: paymentData.id, 
          amount: paymentAmount, 
          method,
          invoice_id: selectedInvoiceId
        }
      });

      toast.success("Payment recorded successfully");
      onOpenChange(false);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error recording payment:", error);
      toast.error("Failed to record payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Record a payment from {client}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {invoices.length > 0 ? (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="invoice" className="text-right">
                  Invoice
                </Label>
                <div className="col-span-3">
                  <Select 
                    value={selectedInvoiceId} 
                    onValueChange={handleInvoiceChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select an invoice" />
                    </SelectTrigger>
                    <SelectContent>
                      {invoices.map((inv) => (
                        <SelectItem key={inv.id} value={inv.id}>
                          ${inv.balance.toFixed(2)} - {inv.invoice_number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div className="text-center py-2 text-sm text-amber-500">
                No unpaid invoices found for this job
              </div>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <div className="col-span-3 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="pl-8"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="method" className="text-right">
                Method
              </Label>
              <Select 
                value={method} 
                onValueChange={setMethod}
              >
                <SelectTrigger className="w-full col-span-3">
                  <SelectValue placeholder="Payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit-card">Credit Card</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="e-transfer">E-Transfer</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reference" className="text-right">
                Reference
              </Label>
              <Input
                id="reference"
                placeholder="Transaction ID, Cheque #, etc."
                className="col-span-3"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Textarea
                id="notes"
                placeholder="Additional payment details..."
                className="col-span-3"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || invoices.length === 0}
            >
              {isSubmitting ? "Processing..." : "Record Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
