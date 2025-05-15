
import { 
  Dialog, 
  DialogContent
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { InvoiceForm } from "../forms/InvoiceForm";

interface EstimateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
  clientInfo,
  companyInfo
}: EstimateDialogProps) => {
  const handleEstimateSubmit = (data: any) => {
    toast.success(`Estimate #${data.invoiceNumber} sent`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
