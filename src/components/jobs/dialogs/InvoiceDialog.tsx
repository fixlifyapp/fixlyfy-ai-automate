
import { 
  Dialog, 
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { InvoiceForm } from "../forms/InvoiceForm";

interface InvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvoiceCreated: (amount: number) => void;
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

export const InvoiceDialog = ({ 
  open, 
  onOpenChange, 
  onInvoiceCreated,
  clientInfo,
  companyInfo
}: InvoiceDialogProps) => {
  const handleInvoiceSubmit = (data: any) => {
    // Calculate total amount from the invoice items
    const amount = data.items.reduce(
      (total: number, item: any) => total + (item.quantity * item.unitPrice), 
      0
    );
    
    toast.success(`Invoice #${data.invoiceNumber} sent`);
    onInvoiceCreated(amount);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Invoice</DialogTitle>
          <DialogDescription>
            Create an invoice to send to your client
          </DialogDescription>
        </DialogHeader>
        <InvoiceForm
          type="invoice"
          onSubmit={handleInvoiceSubmit}
          onCancel={() => onOpenChange(false)}
          defaultInvoiceNumber={`INV-${Math.floor(10000 + Math.random() * 90000)}`}
          clientInfo={clientInfo}
          companyInfo={companyInfo}
        />
      </DialogContent>
    </Dialog>
  );
};
