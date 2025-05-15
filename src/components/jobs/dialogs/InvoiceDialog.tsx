
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface InvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvoiceCreated: (amount: number) => void;
}

export const InvoiceDialog = ({ open, onOpenChange, onInvoiceCreated }: InvoiceDialogProps) => {
  // Simplified invoice dialog
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Invoice</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>Invoice form would go here</p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={() => {
              // Sample invoice amount
              const invoiceAmount = 250;
              toast.success(`Invoice for $${invoiceAmount.toFixed(2)} created`);
              onInvoiceCreated(invoiceAmount);
              onOpenChange(false);
            }}>
              Create Invoice
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
