
import { 
  Dialog, 
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { InvoiceForm } from "../forms/InvoiceForm";

interface EstimateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEstimateCreated?: (amount: number) => void;
  clientInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
  companyInfo: {
    name: string;
    logo: string;
    address: string;
    phone: string;
    email: string;
    legalText: string;
  };
}

export const EstimateDialog = ({ 
  open, 
  onOpenChange,
  onEstimateCreated,
  clientInfo,
  companyInfo
}: EstimateDialogProps) => {
  const handleEstimateSubmit = (data: any) => {
    // Calculate total amount from the estimate items
    const amount = data.items.reduce(
      (total: number, item: any) => total + (item.quantity * item.unitPrice), 
      0
    );
    
    toast.success(`Estimate #${data.invoiceNumber} sent`);
    if (onEstimateCreated) {
      onEstimateCreated(amount);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Estimate</DialogTitle>
          <DialogDescription>
            Create an estimate to send to your client
          </DialogDescription>
        </DialogHeader>
        <InvoiceForm
          type="estimate"
          onSubmit={handleEstimateSubmit}
          onCancel={() => onOpenChange(false)}
          defaultInvoiceNumber={`EST-${Math.floor(10000 + Math.random() * 90000)}`}
          clientInfo={clientInfo}
          companyInfo={companyInfo}
        />
      </DialogContent>
    </Dialog>
  );
};
