
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { EstimateForm } from "./EstimateForm";

interface EstimateBuilderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estimateId?: string;
  jobId: string;
  onSyncToInvoice?: () => void;
}

export function EstimateBuilderDialog({ 
  open, 
  onOpenChange, 
  estimateId, 
  jobId, 
  onSyncToInvoice 
}: EstimateBuilderDialogProps) {
  
  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
  };
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-6xl">
        <div className="text-lg font-semibold mb-4">
          Estimate Builder
        </div>
        <EstimateForm 
          estimateId={estimateId || null} 
          jobId={jobId}
          onSyncToInvoice={onSyncToInvoice}
        />
      </DialogContent>
    </Dialog>
  );
}
