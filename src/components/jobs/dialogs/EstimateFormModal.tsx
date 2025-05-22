
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
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useRBAC } from "@/components/auth/RBACProvider";

interface EstimateFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  client: string;
  onSuccess?: () => void;
  title?: string;
}

export const EstimateFormModal = ({
  open,
  onOpenChange,
  jobId,
  client,
  onSuccess,
  title = "Create Estimate"
}: EstimateFormModalProps) => {
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [validUntil, setValidUntil] = useState(() => {
    // Default to 30 days from now
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentUser } = useRBAC();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate an estimate number
      const estimateNumber = `EST-${Date.now().toString().slice(-6)}`;
      
      // Insert the estimate into the database
      const { data, error } = await supabase
        .from('estimates')
        .insert({
          job_id: jobId,
          estimate_number: estimateNumber,
          total: parseFloat(amount),
          notes: notes,
          date: new Date().toISOString(),
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      
      // Record in job history
      await supabase.from('job_history').insert({
        job_id: jobId,
        type: 'estimate_created',
        title: 'Estimate Created',
        description: `Estimate #${estimateNumber} created for $${amount}`,
        user_id: currentUser?.id,
        user_name: currentUser?.name,
        meta: { estimate_id: data.id, amount: parseFloat(amount) }
      });

      toast.success("Estimate created successfully");
      onOpenChange(false);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error creating estimate:", error);
      toast.error("Failed to create estimate");
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
            Create an estimate for {client}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
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
              <Label htmlFor="validUntil" className="text-right">
                Valid Until
              </Label>
              <Input
                id="validUntil"
                type="date"
                className="col-span-3"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Textarea
                id="notes"
                placeholder="Add any details about this estimate..."
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
              {isSubmitting ? "Creating..." : "Create Estimate"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
