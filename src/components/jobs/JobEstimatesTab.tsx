
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { EstimatesList } from "./estimates/EstimatesList";
import { useEstimates } from "./estimates/useEstimates";
import { DeleteConfirmDialog } from "./dialogs/DeleteConfirmDialog";
import { ConvertToInvoiceDialog } from "./estimates/dialogs/ConvertToInvoiceDialog";
import { UpsellDialog } from "./dialogs/UpsellDialog";
import { EstimateBuilderDialog } from "./dialogs/estimate-builder/EstimateBuilderDialog";
import { WarrantySelectionDialog } from "./dialogs/WarrantySelectionDialog";

interface JobEstimatesTabProps {
  jobId: string;
  onEstimateConverted?: () => void;
}

export const JobEstimatesTab = ({ jobId, onEstimateConverted }: JobEstimatesTabProps) => {
  const {
    estimates,
    isLoading,
    error,
    dialogs,
    state,
    handlers,
    info
  } = useEstimates(jobId, onEstimateConverted);

  if (error) {
    return (
      <Card className="border-fixlyfy-border shadow-sm">
        <CardContent className="p-6">
          <div className="text-center py-8 text-fixlyfy-error">
            <p>There was an error loading estimates. Please try again later.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-fixlyfy-border shadow-sm">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Estimates</h3>
          <Button className="gap-2" onClick={handlers.handleCreateEstimate}>
            <Plus size={16} />
            Create Estimate
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

        {/* Dialogs */}
        <EstimateBuilderDialog
          open={dialogs.isEstimateBuilderOpen}
          onOpenChange={dialogs.setIsEstimateBuilderOpen}
          estimateId={state.selectedEstimateId}
          jobId={jobId}
          onSyncToInvoice={handlers.handleSyncToInvoice}
        />

        <ConvertToInvoiceDialog
          open={dialogs.isConvertToInvoiceDialogOpen}
          onOpenChange={dialogs.setIsConvertToInvoiceDialogOpen}
          estimate={state.selectedEstimate}
          onConfirm={handlers.confirmConvertToInvoice}
        />

        <DeleteConfirmDialog
          title="Delete Estimate"
          description={`Are you sure you want to delete this estimate? This action cannot be undone.`}
          onOpenChange={dialogs.setIsDeleteConfirmOpen}
          onConfirm={handlers.confirmDeleteEstimate}
          isDeleting={state.isDeleting}
          open={dialogs.isDeleteConfirmOpen}
        />

        <UpsellDialog
          open={dialogs.isUpsellDialogOpen}
          onOpenChange={dialogs.setIsUpsellDialogOpen}
          recommendedProduct={state.recommendedProduct}
          techniciansNote={state.techniciansNote}
          jobId={jobId}
          onAccept={handlers.handleUpsellAccept}
        />

        <WarrantySelectionDialog
          open={dialogs.isWarrantyDialogOpen}
          onOpenChange={dialogs.setIsWarrantyDialogOpen}
          onConfirm={handlers.handleWarrantySelection}
        />
      </CardContent>
    </Card>
  );
};
