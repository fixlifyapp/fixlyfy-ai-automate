
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EstimateLineItems } from "./EstimateLineItems";
import { EstimateDetails } from "./EstimateDetails";
import { EstimateSendDialog } from "./EstimateSendDialog";
import { useEstimateBuilder } from "./hooks/useEstimateBuilder";
import { Job } from "@/hooks/useJobs";

interface EstimateBuilderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: Job;
  estimateId?: string;
  onSuccess?: () => void;
}

export const EstimateBuilderDialog = ({ 
  open, 
  onOpenChange, 
  job, 
  estimateId,
  onSuccess 
}: EstimateBuilderDialogProps) => {
  const [showSendDialog, setShowSendDialog] = useState(false);
  const {
    lineItems,
    estimateDetails,
    isLoading,
    addLineItem,
    updateLineItem,
    removeLineItem,
    updateEstimateDetails,
    saveEstimate,
    total
  } = useEstimateBuilder(job.id, estimateId);

  const handleSaveAndSend = async () => {
    console.log("=== SAVE AND SEND CLICKED ===");
    console.log("Line items:", lineItems);
    console.log("Estimate details:", estimateDetails);
    
    const success = await saveEstimate();
    if (success) {
      console.log("Estimate saved successfully, opening send dialog");
      setShowSendDialog(true);
    } else {
      console.error("Failed to save estimate");
    }
  };

  const handleSendSuccess = () => {
    console.log("Send successful, closing dialogs");
    setShowSendDialog(false);
    onOpenChange(false);
    if (onSuccess) {
      onSuccess();
    }
  };

  const handleSendCancel = () => {
    console.log("Send cancelled, keeping estimate dialog open");
    setShowSendDialog(false);
  };

  return (
    <>
      <Dialog open={open && !showSendDialog} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {estimateId ? 'Edit Estimate' : 'Create Estimate'} - {job.title}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <EstimateLineItems
                lineItems={lineItems}
                onAddItem={addLineItem}
                onUpdateItem={updateLineItem}
                onRemoveItem={removeLineItem}
                isLoading={isLoading}
              />
            </div>
            
            <div>
              <EstimateDetails
                details={estimateDetails}
                onUpdateDetails={updateEstimateDetails}
                onSave={saveEstimate}
                onSaveAndSend={handleSaveAndSend}
                total={total}
                isLoading={isLoading}
                job={job}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <EstimateSendDialog
        open={showSendDialog}
        onOpenChange={setShowSendDialog}
        estimateNumber={estimateDetails.estimate_number}
        estimateDetails={estimateDetails}
        lineItems={lineItems}
        contactInfo={{
          name: job.client?.name || '',
          email: job.client?.email || '',
          phone: job.client?.phone || ''
        }}
        jobId={job.id}
        onSuccess={handleSendSuccess}
        onCancel={handleSendCancel}
        onSave={saveEstimate}
      />
    </>
  );
};
