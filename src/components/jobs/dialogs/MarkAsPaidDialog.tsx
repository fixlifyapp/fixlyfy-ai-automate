
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

interface MarkAsPaidDialogProps {
  selectedJobs: string[];
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function MarkAsPaidDialog({ selectedJobs, onOpenChange, onSuccess }: MarkAsPaidDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<string>("credit_card");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // In a real app, this would be an actual API call
      // await fetch('/api/invoices/mark-paid', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     jobIds: selectedJobs,
      //     paymentMethod,
      //     notes,
      //   }),
      // });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success(`Marked ${selectedJobs.length} jobs as paid`);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to mark jobs as paid:", error);
      toast.error("Failed to mark jobs as paid. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Mark Invoices as Paid</DialogTitle>
        <DialogDescription>
          Mark invoices for the {selectedJobs.length} selected jobs as paid.
        </DialogDescription>
      </DialogHeader>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="payment-method" className="text-sm font-medium">
              Payment Method
            </label>
            <Select defaultValue={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger id="payment-method">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="credit_card">Credit Card</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="check">Check</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium">
              Payment Notes (Optional)
            </label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter any notes about this payment"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : "Mark as Paid"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
