
import React, { useState } from "react";
import { ModernCard, ModernCardHeader, ModernCardContent, ModernCardTitle } from "@/components/ui/modern-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Eye, Download, Edit, Trash2, DollarSign, Calendar } from "lucide-react";
import { EstimatesList } from "../estimates/EstimatesList";
import { useEstimates } from "../estimates/useEstimates";
import { EstimateDialog } from "../dialogs/EstimateDialog";
import { DeleteConfirmDialog } from "../dialogs/DeleteConfirmDialog";
import { ConvertToInvoiceDialog } from "../estimates/dialogs/ConvertToInvoiceDialog";
import { UpsellDialog } from "../dialogs/UpsellDialog";
import { EstimateBuilderDialog } from "../dialogs/estimate-builder/EstimateBuilderDialog";
import { WarrantySelectionDialog } from "../dialogs/WarrantySelectionDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { recordEstimateCreated } from "@/services/jobHistoryService";

interface ModernJobEstimatesTabProps {
  jobId: string;
  onEstimateConverted?: () => void;
}

export const ModernJobEstimatesTab = ({ jobId, onEstimateConverted }: ModernJobEstimatesTabProps) => {
  const {
    estimates,
    isLoading,
    error,
    dialogs,
    state,
    handlers,
    info
  } = useEstimates(jobId, onEstimateConverted);

  // Enhanced handlers with history recording
  const handleEstimateCreated = async (amount: number) => {
    // Generate estimate number
    const estimateNumber = `EST-${Date.now()}`;
    
    // Record in job history
    await recordEstimateCreated(
      jobId,
      estimateNumber,
      amount
    );
    
    // Call original handler
    handlers.handleEstimateCreated(amount);
  };

  if (error) {
    return (
      <ModernCard variant="elevated">
        <ModernCardContent className="p-6">
          <div className="text-center py-8 text-red-500">
            <p>There was an error loading estimates. Please try again later.</p>
          </div>
        </ModernCardContent>
      </ModernCard>
    );
  }

  return (
    <div className="space-y-6">
      <ModernCard variant="elevated" className="hover:shadow-lg transition-all duration-300">
        <ModernCardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <ModernCardTitle icon={FileText}>
              Estimates ({estimates.length})
            </ModernCardTitle>
            <Button 
              className="gap-2 bg-fixlyfy hover:bg-fixlyfy-dark" 
              onClick={handlers.handleCreateEstimate}
            >
              <Plus size={16} />
              Create Estimate
            </Button>
          </div>
        </ModernCardHeader>
        <ModernCardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="w-full h-20" />
              ))}
            </div>
          ) : estimates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium">No estimates yet</p>
              <p className="text-sm">Create your first estimate to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {estimates.map((estimate) => (
                <div
                  key={estimate.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium">{estimate.estimate_number}</h4>
                        <Badge 
                          variant="outline" 
                          className={
                            estimate.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                            estimate.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                            'bg-gray-50 text-gray-700 border-gray-200'
                          }
                        >
                          {estimate.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(estimate.date), 'MMM dd, yyyy')}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          ${estimate.total.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlers.handleEditEstimate(estimate.id)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlers.handleConvertToInvoice(estimate)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlers.handleDeleteEstimate(estimate.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ModernCardContent>
      </ModernCard>

      {/* Dialogs */}
      <EstimateDialog
        open={dialogs.isEstimateDialogOpen}
        onOpenChange={dialogs.setIsEstimateDialogOpen}
        onEstimateCreated={handleEstimateCreated}
        clientInfo={info.clientInfo}
        companyInfo={info.companyInfo}
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

      <EstimateBuilderDialog
        open={dialogs.isEstimateBuilderOpen}
        onOpenChange={dialogs.setIsEstimateBuilderOpen}
        estimateId={state.selectedEstimateId}
        jobId={jobId}
        onSyncToInvoice={handlers.handleSyncToInvoice}
      />

      <WarrantySelectionDialog
        open={dialogs.isWarrantyDialogOpen}
        onOpenChange={dialogs.setIsWarrantyDialogOpen}
        onConfirm={handlers.handleWarrantySelection}
      />
    </div>
  );
};
