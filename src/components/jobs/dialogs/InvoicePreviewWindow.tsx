
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Invoice } from "@/hooks/useInvoices";
import { useJobData } from "./unified/hooks/useJobData";
import { InvoiceSendDialog } from "./InvoiceSendDialog";
import { InvoicePreviewHeader } from "./invoice-preview/InvoicePreviewHeader";
import { InvoicePreviewContent } from "./invoice-preview/InvoicePreviewContent";
import { InvoicePreviewFooter } from "./invoice-preview/InvoicePreviewFooter";

interface InvoicePreviewWindowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice;
  jobId: string;
  onPaymentRecorded?: () => void;
}

export const InvoicePreviewWindow = ({
  open,
  onOpenChange,
  invoice,
  jobId,
  onPaymentRecorded
}: InvoicePreviewWindowProps) => {
  const [showSendDialog, setShowSendDialog] = useState(false);
  const { clientInfo, jobAddress, loading } = useJobData(jobId);

  const handleSendDialogSuccess = () => {
    setShowSendDialog(false);
    if (onPaymentRecorded) {
      onPaymentRecorded();
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
          <InvoicePreviewHeader invoice={invoice} />

          <div className="flex-1 min-h-0 overflow-y-auto">
            <InvoicePreviewContent 
              invoice={invoice} 
              clientInfo={clientInfo} 
              jobAddress={jobAddress} 
            />
          </div>

          <InvoicePreviewFooter 
            onClose={() => onOpenChange(false)}
            onSend={() => setShowSendDialog(true)}
          />
        </DialogContent>
      </Dialog>

      <InvoiceSendDialog
        open={showSendDialog}
        onOpenChange={setShowSendDialog}
        onSave={async () => {
          handleSendDialogSuccess();
          return true;
        }}
        onAddWarranty={() => {}}
        invoiceNumber={invoice.invoice_number}
        jobId={jobId}
      />
    </>
  );
};
