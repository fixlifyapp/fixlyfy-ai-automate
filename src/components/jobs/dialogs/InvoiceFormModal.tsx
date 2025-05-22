
import React, { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useRBAC } from "@/components/auth/RBACProvider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface InvoiceFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  client: string;
  estimateId?: string;
  onSuccess?: () => void;
  title?: string;
}

export const InvoiceFormModal = ({
  open,
  onOpenChange,
  jobId,
  client,
  estimateId,
  onSuccess,
  title = "Generate Invoice"
}: InvoiceFormModalProps) => {
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [dueDate, setDueDate] = useState(() => {
    // Default to 14 days from now
    const date = new Date();
    date.setDate(date.getDate() + 14);
    return date.toISOString().split('T')[0];
  });
  const [estimates, setEstimates] = useState<any[]>([]);
  const [selectedEstimateId, setSelectedEstimateId] = useState(estimateId || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentUser } = useRBAC();

  // Fetch estimates for this job
  useEffect(() => {
    if (open && jobId) {
      const fetchEstimates = async () => {
        try {
          const { data, error } = await supabase
            .from('estimates')
            .select('*')
            .eq('job_id', jobId)
            .eq('status', 'accepted');
            
          if (error) throw error;
          
          setEstimates(data || []);
          
          // If we have estimates and no estimateId was provided, select the first one
          if (data && data.length > 0 && !estimateId) {
            setSelectedEstimateId(data[0].id);
            setAmount(data[0].total.toString());
          }
        } catch (error) {
          console.error("Error fetching estimates:", error);
        }
      };
      
      fetchEstimates();
    }
  }, [open, jobId, estimateId]);

  // Update amount when estimate is selected
  const handleEstimateChange = (value: string) => {
    setSelectedEstimateId(value);
    const selected = estimates.find(est => est.id === value);
    if (selected) {
      setAmount(selected.total.toString());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate an invoice number
      const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
      
      // Insert the invoice into the database
      const { data, error } = await supabase
        .from('invoices')
        .insert({
          job_id: jobId,
          estimate_id: selectedEstimateId || null,
          invoice_number: invoiceNumber,
          date: new Date().toISOString(),
          total: parseFloat(amount),
          balance: parseFloat(amount),
          amount_paid: 0,
          notes: notes,
          status: 'unpaid'
        })
        .select()
        .single();

      if (error) throw error;
      
      // Update the estimate status if one was selected
      if (selectedEstimateId) {
        await supabase
          .from('estimates')
          .update({ status: 'invoiced' })
          .eq('id', selectedEstimateId);
      }
      
      // Record in job history
      await supabase.from('job_history').insert({
        job_id: jobId,
        type: 'invoice_created',
        title: 'Invoice Created',
        description: `Invoice #${invoiceNumber} created for $${amount}`,
        user_id: currentUser?.id,
        user_name: currentUser?.name,
        meta: { invoice_id: data.id, amount: parseFloat(amount) }
      });

      toast.success("Invoice generated successfully");
      onOpenChange(false);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error generating invoice:", error);
      toast.error("Failed to generate invoice");
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
            Generate an invoice for {client}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {estimates.length > 0 && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="estimate" className="text-right">
                  Estimate
                </Label>
                <div className="col-span-3">
                  <Select 
                    value={selectedEstimateId} 
                    onValueChange={handleEstimateChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select an estimate" />
                    </SelectTrigger>
                    <SelectContent>
                      {estimates.map((est) => (
                        <SelectItem key={est.id} value={est.id}>
                          ${est.total.toFixed(2)} - {est.estimate_number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
              <Label htmlFor="dueDate" className="text-right">
                Due Date
              </Label>
              <Input
                id="dueDate"
                type="date"
                className="col-span-3"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Textarea
                id="notes"
                placeholder="Add any details about this invoice..."
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Generating..." : "Generate Invoice"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
