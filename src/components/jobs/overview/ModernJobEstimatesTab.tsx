
import React, { useState, useEffect } from "react";
import { ModernCard, ModernCardHeader, ModernCardContent, ModernCardTitle } from "@/components/ui/modern-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EstimateBuilderDialog } from "../dialogs/estimate-builder/EstimateBuilderDialog";
import { useEstimates, Estimate } from "@/hooks/useEstimates";
import { useEstimateActions } from "../estimates/hooks/useEstimateActions";
import { 
  Calculator, 
  Eye, 
  Edit, 
  Send, 
  Trash2, 
  ArrowRight, 
  Plus,
  FileText,
  DollarSign 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useJobHistory } from "@/hooks/useJobHistory";

interface ModernJobEstimatesTabProps {
  jobId: string;
  onEstimateConverted?: () => void;
}

export const ModernJobEstimatesTab = ({ jobId, onEstimateConverted }: ModernJobEstimatesTabProps) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEstimateId, setSelectedEstimateId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showConvertDialog, setShowConvertDialog] = useState(false);

  const { estimates, isLoading, setEstimates } = useEstimates(jobId);
  const { addHistoryItem } = useJobHistory(jobId);
  
  const estimateActions = useEstimateActions(
    jobId, 
    estimates, 
    setEstimates, 
    onEstimateConverted
  );

  const handleViewEstimate = async (estimate: Estimate) => {
    await addHistoryItem({
      job_id: jobId,
      entity_id: estimate.id,
      entity_type: 'estimate',
      type: 'estimate',
      title: 'Estimate Viewed',
      description: `Estimate ${estimate.number} was viewed`,
      meta: { action: 'view', estimate_number: estimate.number }
    });
    
    setSelectedEstimateId(estimate.id);
    setIsEditDialogOpen(true);
  };

  const handleEditEstimate = async (estimate: Estimate) => {
    await addHistoryItem({
      job_id: jobId,
      entity_id: estimate.id,
      entity_type: 'estimate',
      type: 'estimate',
      title: 'Estimate Edit Started',
      description: `Started editing estimate ${estimate.number}`,
      meta: { action: 'edit_started', estimate_number: estimate.number }
    });
    
    setSelectedEstimateId(estimate.id);
    setIsEditDialogOpen(true);
  };

  const handleSendEstimate = async (estimate: Estimate) => {
    await addHistoryItem({
      job_id: jobId,
      entity_id: estimate.id,
      entity_type: 'estimate',
      type: 'communication',
      title: 'Estimate Sent',
      description: `Estimate ${estimate.number} was sent to client`,
      meta: { action: 'send', estimate_number: estimate.number }
    });
    
    await estimateActions.actions.handleSendEstimate(estimate.id);
  };

  const handleDeleteClick = (estimate: Estimate) => {
    estimateActions.actions.setSelectedEstimate(estimate);
    setShowDeleteDialog(true);
  };

  const handleConvertClick = (estimate: Estimate) => {
    estimateActions.actions.setSelectedEstimate(estimate);
    setShowConvertDialog(true);
  };

  const confirmDelete = async () => {
    if (estimateActions.state.selectedEstimate) {
      await addHistoryItem({
        job_id: jobId,
        entity_id: estimateActions.state.selectedEstimate.id,
        entity_type: 'estimate',
        type: 'estimate',
        title: 'Estimate Deleted',
        description: `Estimate ${estimateActions.state.selectedEstimate.number} was deleted`,
        meta: { action: 'delete', estimate_number: estimateActions.state.selectedEstimate.number }
      });
      
      await estimateActions.actions.confirmDeleteEstimate();
    }
    setShowDeleteDialog(false);
  };

  const confirmConvert = async () => {
    if (estimateActions.state.selectedEstimate) {
      await addHistoryItem({
        job_id: jobId,
        entity_id: estimateActions.state.selectedEstimate.id,
        entity_type: 'estimate',
        type: 'estimate',
        title: 'Estimate Converted',
        description: `Estimate ${estimateActions.state.selectedEstimate.number} was converted to invoice`,
        meta: { action: 'convert', estimate_number: estimateActions.state.selectedEstimate.number }
      });
      
      await estimateActions.actions.confirmConvertToInvoice();
    }
    setShowConvertDialog(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'sent': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'approved': return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      case 'converted': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <ModernCard variant="elevated" className="hover:shadow-lg transition-all duration-300">
        <ModernCardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <ModernCardTitle icon={Calculator}>
              Estimates ({estimates.length})
            </ModernCardTitle>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
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
              <Calculator className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium">No estimates yet</p>
              <p className="text-sm">Create your first estimate to get started</p>
              <Button 
                onClick={() => setIsCreateDialogOpen(true)}
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Estimate
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {estimates.map((estimate) => (
                <div key={estimate.id} className="border rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium text-gray-900">
                          Estimate {estimate.number}
                        </h4>
                        <Badge className={getStatusColor(estimate.status)}>
                          {estimate.status}
                        </Badge>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <DollarSign className="h-4 w-4 mr-1" />
                          ${estimate.total?.toFixed(2) || '0.00'}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Created {formatDistanceToNow(new Date(estimate.date), { addSuffix: true })}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewEstimate(estimate)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditEstimate(estimate)}
                        className="flex items-center gap-1"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                      
                      {estimate.status !== 'sent' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendEstimate(estimate)}
                          className="flex items-center gap-1"
                        >
                          <Send className="h-4 w-4" />
                          Send
                        </Button>
                      )}
                      
                      {estimate.status !== 'converted' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleConvertClick(estimate)}
                          className="flex items-center gap-1"
                        >
                          <ArrowRight className="h-4 w-4" />
                          Convert
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(estimate)}
                        className="flex items-center gap-1 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
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
      <EstimateBuilderDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        jobId={jobId}
        onSyncToInvoice={onEstimateConverted}
      />

      <EstimateBuilderDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        estimateId={selectedEstimateId || undefined}
        jobId={jobId}
        onSyncToInvoice={onEstimateConverted}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Estimate</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete estimate {estimateActions.state.selectedEstimate?.number}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={estimateActions.state.isDeleting}
            >
              {estimateActions.state.isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Convert Confirmation Dialog */}
      <AlertDialog open={showConvertDialog} onOpenChange={setShowConvertDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Convert to Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              Convert estimate {estimateActions.state.selectedEstimate?.number} to an invoice? 
              This will create a new invoice with the same line items.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmConvert}
              disabled={estimateActions.state.isConverting}
            >
              {estimateActions.state.isConverting ? 'Converting...' : 'Convert'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
