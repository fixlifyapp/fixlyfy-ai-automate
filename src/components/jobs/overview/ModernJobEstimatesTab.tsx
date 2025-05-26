
import React, { useState, useEffect } from "react";
import { ModernCard, ModernCardHeader, ModernCardContent, ModernCardTitle } from "@/components/ui/modern-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EstimateBuilderDialog } from "../dialogs/estimate-builder/EstimateBuilderDialog";
import { useEstimates, Estimate } from "@/hooks/useEstimates";
import { useEstimateActions } from "../estimates/hooks/useEstimateActions";
import { supabase } from "@/integrations/supabase/client";
import { 
  Calculator, 
  Eye, 
  Edit, 
  Send, 
  Trash2, 
  ArrowRight, 
  Plus,
  DollarSign,
  Loader2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useJobHistory } from "@/hooks/useJobHistory";
import { toast } from "sonner";

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
  const [processingEstimateId, setProcessingEstimateId] = useState<string | null>(null);

  const { estimates, isLoading, setEstimates, refreshEstimates } = useEstimates(jobId);
  const { addHistoryItem } = useJobHistory(jobId);
  
  const estimateActions = useEstimateActions(
    jobId, 
    estimates, 
    setEstimates,
    refreshEstimates,
    onEstimateConverted
  );

  // Real-time updates for estimates
  useEffect(() => {
    if (!jobId) return;

    const channel = supabase
      .channel('estimates-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'estimates',
          filter: `job_id=eq.${jobId}`
        },
        (payload) => {
          console.log('Real-time estimate update:', payload);
          refreshEstimates();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [jobId, refreshEstimates]);

  const handleViewEstimate = async (estimate: Estimate) => {
    await addHistoryItem({
      job_id: jobId,
      entity_id: estimate.id,
      entity_type: 'estimate',
      type: 'estimate',
      title: 'Estimate Viewed',
      description: `Estimate ${estimate.estimate_number} was viewed`,
      meta: { action: 'view', estimate_number: estimate.estimate_number }
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
      description: `Started editing estimate ${estimate.estimate_number}`,
      meta: { action: 'edit_started', estimate_number: estimate.estimate_number }
    });
    
    setSelectedEstimateId(estimate.id);
    setIsEditDialogOpen(true);
  };

  const handleSendEstimate = async (estimate: Estimate) => {
    setProcessingEstimateId(estimate.id);
    
    try {
      await addHistoryItem({
        job_id: jobId,
        entity_id: estimate.id,
        entity_type: 'estimate',
        type: 'communication',
        title: 'Estimate Sent',
        description: `Estimate ${estimate.estimate_number} was sent to client`,
        meta: { action: 'send', estimate_number: estimate.estimate_number }
      });
      
      await estimateActions.actions.handleSendEstimate(estimate.id);
    } finally {
      setProcessingEstimateId(null);
    }
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
        description: `Estimate ${estimateActions.state.selectedEstimate.estimate_number} was deleted`,
        meta: { action: 'delete', estimate_number: estimateActions.state.selectedEstimate.estimate_number }
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
        description: `Estimate ${estimateActions.state.selectedEstimate.estimate_number} was converted to invoice`,
        meta: { action: 'convert', estimate_number: estimateActions.state.selectedEstimate.estimate_number }
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
      <ModernCard variant="elevated" className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
        <ModernCardHeader className="pb-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-t-lg">
          <div className="flex items-center justify-between">
            <ModernCardTitle icon={Calculator} className="text-gray-800">
              Estimates ({estimates.length})
            </ModernCardTitle>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
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
            <div className="text-center py-12 text-muted-foreground">
              <div className="relative">
                <Calculator className="mx-auto h-16 w-16 text-gray-300 mb-6" />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full opacity-20 blur-xl transform scale-150"></div>
              </div>
              <p className="text-xl font-medium text-gray-600 mb-2">No estimates yet</p>
              <p className="text-sm text-gray-500 mb-6">Create your first estimate to get started</p>
              <Button 
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Estimate
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {estimates.map((estimate) => (
                <div 
                  key={estimate.id} 
                  className="group border rounded-xl p-6 bg-white hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl border-gray-200 hover:border-blue-200"
                  style={{
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <h4 className="font-semibold text-gray-900 text-lg group-hover:text-blue-900 transition-colors">
                          Estimate {estimate.estimate_number}
                        </h4>
                        <Badge className={`${getStatusColor(estimate.status)} font-medium`}>
                          {estimate.status}
                        </Badge>
                        <div className="flex items-center text-lg font-bold text-green-600">
                          <DollarSign className="h-5 w-5 mr-1" />
                          {estimate.total?.toFixed(2) || '0.00'}
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
                        className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transform hover:scale-105 transition-all duration-200"
                        disabled={processingEstimateId === estimate.id}
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditEstimate(estimate)}
                        className="flex items-center gap-2 hover:bg-green-50 hover:border-green-300 hover:text-green-700 transform hover:scale-105 transition-all duration-200"
                        disabled={processingEstimateId === estimate.id}
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                      
                      {estimate.status !== 'sent' && estimate.status !== 'converted' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendEstimate(estimate)}
                          className="flex items-center gap-2 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 transform hover:scale-105 transition-all duration-200"
                          disabled={processingEstimateId === estimate.id || estimateActions.state.isSending}
                        >
                          {processingEstimateId === estimate.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                          Send
                        </Button>
                      )}
                      
                      {estimate.status !== 'converted' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleConvertClick(estimate)}
                          className="flex items-center gap-2 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transform hover:scale-105 transition-all duration-200"
                          disabled={processingEstimateId === estimate.id || estimateActions.state.isConverting}
                        >
                          {estimateActions.state.isConverting && estimateActions.state.selectedEstimate?.id === estimate.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <ArrowRight className="h-4 w-4" />
                          )}
                          Convert
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(estimate)}
                        className="flex items-center gap-2 text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transform hover:scale-105 transition-all duration-200"
                        disabled={processingEstimateId === estimate.id || estimateActions.state.isDeleting}
                      >
                        {estimateActions.state.isDeleting && estimateActions.state.selectedEstimate?.id === estimate.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
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
        <AlertDialogContent className="border-red-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-800">Delete Estimate</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete estimate {estimateActions.state.selectedEstimate?.estimate_number}? 
              This action cannot be undone and will permanently remove the estimate and all its associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 transform hover:scale-105 transition-all duration-200"
              disabled={estimateActions.state.isDeleting}
            >
              {estimateActions.state.isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Convert Confirmation Dialog */}
      <AlertDialog open={showConvertDialog} onOpenChange={setShowConvertDialog}>
        <AlertDialogContent className="border-purple-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-purple-800">Convert to Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              Convert estimate {estimateActions.state.selectedEstimate?.estimate_number} to an invoice? 
              This will create a new invoice with the same line items and mark the estimate as converted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmConvert}
              className="bg-purple-600 hover:bg-purple-700 transform hover:scale-105 transition-all duration-200"
              disabled={estimateActions.state.isConverting}
            >
              {estimateActions.state.isConverting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Converting...
                </>
              ) : (
                'Convert'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
