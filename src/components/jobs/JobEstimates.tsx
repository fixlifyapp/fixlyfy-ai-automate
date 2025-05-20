
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import { UpsellDialog } from "@/components/jobs/dialogs/UpsellDialog";
import { EstimateBuilderDialog } from "@/components/jobs/dialogs/EstimateBuilderDialog";
import { Dialog } from "@/components/ui/dialog";
import { DeleteConfirmDialog } from "./dialogs/DeleteConfirmDialog";
import { WarrantySelectionDialog } from "./dialogs/WarrantySelectionDialog";
import { EstimateDialog } from "./dialogs/EstimateDialog";
import { EstimatesList } from "./estimates/EstimatesList";
import { useEstimates } from "./estimates/useEstimates";
import { ConvertToInvoiceDialog } from "./estimates/dialogs/ConvertToInvoiceDialog";

interface JobEstimatesProps {
  jobId: string;
  onEstimateConverted?: () => void;
}

export const JobEstimates = ({ jobId, onEstimateConverted }: JobEstimatesProps) => {
  const {
    estimates,
    isLoading,
    dialogs,
    state,
    handlers,
    info
  } = useEstimates(jobId, onEstimateConverted);

  return (
    <Card className="border-fixlyfy-border shadow-sm">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium">Estimates</h3>
          <Button onClick={handlers.handleCreateEstimate} className="gap-2">
            <PlusCircle size={16} />
            New Estimate
          </Button>
        </div>

        <EstimatesList 
          estimates={estimates}
          isLoading={isLoading}
          onEdit={handlers.handleEditEstimate}
          onConvert={handlers.handleConvertToInvoice}
          onAddWarranty={handlers.handleAddWarranty}
          onSend={handlers.handleSendEstimate}
          onDelete={handlers.handleDeleteEstimate}
        />
        
        <UpsellDialog 
          open={dialogs.isUpsellDialogOpen} 
          onOpenChange={dialogs.setIsUpsellDialogOpen}
          jobId={jobId}
          recommendedProduct={state.recommendedProduct}
          techniciansNote={state.techniciansNote}
          onAccept={handlers.handleUpsellAccept}
        />

        <EstimateBuilderDialog
          open={dialogs.isEstimateBuilderOpen}
          onOpenChange={dialogs.setIsEstimateBuilderOpen}
          estimateId={state.selectedEstimateId}
          jobId={jobId}
          onSyncToInvoice={handlers.handleSyncToInvoice}
        />
        
        {/* Convert to Invoice Dialog */}
        <ConvertToInvoiceDialog
          open={dialogs.isConvertToInvoiceDialogOpen}
          onOpenChange={dialogs.setIsConvertToInvoiceDialogOpen}
          onConfirm={handlers.confirmConvertToInvoice}
          estimateNumber={state.selectedEstimate?.number}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={dialogs.isDeleteConfirmOpen} onOpenChange={dialogs.setIsDeleteConfirmOpen}>
          <DeleteConfirmDialog 
            title="Delete Estimate"
            description={`Are you sure you want to delete estimate ${state.selectedEstimate?.number}? This action cannot be undone.`}
            onOpenChange={dialogs.setIsDeleteConfirmOpen}
            onConfirm={handlers.confirmDeleteEstimate}
            isDeleting={state.isDeleting}
          />
        </Dialog>
        
        {/* Warranty Selection Dialog */}
        <WarrantySelectionDialog
          open={dialogs.isWarrantyDialogOpen}
          onOpenChange={dialogs.setIsWarrantyDialogOpen}
          onConfirm={handlers.handleWarrantySelection}
        />
        
        {/* Estimate Creation Dialog */}
        <EstimateDialog
          open={dialogs.isEstimateDialogOpen}
          onOpenChange={dialogs.setIsEstimateDialogOpen}
          onEstimateCreated={handlers.handleEstimateCreated}
          clientInfo={info.getClientInfo()}
          companyInfo={info.getCompanyInfo()}
        />
      </CardContent>
    </Card>
  );
};
