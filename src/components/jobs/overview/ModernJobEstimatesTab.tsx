
import React, { useState, useEffect } from "react";
import { ModernCard, ModernCardHeader, ModernCardContent, ModernCardTitle } from "@/components/ui/modern-card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useEstimates } from "@/hooks/useEstimates";
import { useEstimateActions } from "../estimates/hooks/useEstimateActions";
import { supabase } from "@/integrations/supabase/client";
import { EstimateBuilderDialog } from "../dialogs/estimate-builder/EstimateBuilderDialog";
import { 
  FileText, 
  Eye, 
  Edit, 
  Send, 
  Trash2, 
  FileCheck,
  Plus,
  DollarSign,
  Loader2,
  CalendarClock
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useJobHistory } from "@/hooks/useJobHistory";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface ModernJobEstimatesTabProps {
  jobId: string;
  onEstimateConverted?: () => void;
}

export const ModernJobEstimatesTab = ({ jobId, onEstimateConverted }: ModernJobEstimatesTabProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [processingEstimateId, setProcessingEstimateId] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<{[key: string]: string}>({});

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

  const handleViewEstimate = async (estimate: any) => {
    setActionInProgress(prev => ({ ...prev, [estimate.id]: 'viewing' }));
    
    try {
      await addHistoryItem({
        job_id: jobId,
        entity_id: estimate.id,
        entity_type: 'estimate',
        type: 'estimate',
        title: 'Estimate Viewed',
        description: `Estimate ${estimate.estimate_number} was viewed`,
        meta: { action: 'view', estimate_number: estimate.estimate_number }
      });
      
      toast.success(`Viewing estimate ${estimate.estimate_number}`);
      
    } finally {
      setTimeout(() => {
        setActionInProgress(prev => {
          const newState = { ...prev };
          delete newState[estimate.id];
          return newState;
        });
      }, 300);
    }
  };

  const handleEditEstimate = async (estimate: any) => {
    setActionInProgress(prev => ({ ...prev, [estimate.id]: 'editing' }));
    
    try {
      await addHistoryItem({
        job_id: jobId,
        entity_id: estimate.id,
        entity_type: 'estimate',
        type: 'estimate',
        title: 'Estimate Edit Started',
        description: `Started editing estimate ${estimate.estimate_number}`,
        meta: { action: 'edit_started', estimate_number: estimate.estimate_number }
      });
      
      toast.success(`Editing estimate ${estimate.estimate_number}`);
      
    } finally {
      setTimeout(() => {
        setActionInProgress(prev => {
          const newState = { ...prev };
          delete newState[estimate.id];
          return newState;
        });
      }, 300);
    }
  };

  const handleSendEstimate = async (estimate: any) => {
    if (estimate.status === 'sent') {
      toast.info('Estimate has already been sent');
      return;
    }

    setProcessingEstimateId(estimate.id);
    setActionInProgress(prev => ({ ...prev, [estimate.id]: 'sending' }));
    
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
      
      const success = await estimateActions.actions.handleSendEstimate(estimate.id);
      if (success) {
        toast.success(`Estimate ${estimate.estimate_number} sent successfully`);
      }
    } catch (error) {
      toast.error('Failed to send estimate');
      console.error('Error sending estimate:', error);
    } finally {
      setProcessingEstimateId(null);
      setActionInProgress(prev => {
        const newState = { ...prev };
        delete newState[estimate.id];
        return newState;
      });
    }
  };

  const handleConvertToInvoice = async (estimate: any) => {
    if (estimate.status === 'converted') {
      toast.info('Estimate has already been converted to invoice');
      return;
    }

    setProcessingEstimateId(estimate.id);
    setActionInProgress(prev => ({ ...prev, [estimate.id]: 'converting' }));
    
    try {
      await addHistoryItem({
        job_id: jobId,
        entity_id: estimate.id,
        entity_type: 'estimate',
        type: 'estimate',
        title: 'Estimate Converted to Invoice',
        description: `Estimate ${estimate.estimate_number} was converted to invoice`,
        meta: { action: 'convert', estimate_number: estimate.estimate_number }
      });
      
      const success = await estimateActions.actions.confirmConvertToInvoice();
      if (success) {
        toast.success(`Estimate ${estimate.estimate_number} converted to invoice`);
      }
    } catch (error) {
      toast.error('Failed to convert estimate');
      console.error('Error converting estimate:', error);
    } finally {
      setProcessingEstimateId(null);
      setActionInProgress(prev => {
        const newState = { ...prev };
        delete newState[estimate.id];
        return newState;
      });
    }
  };

  const handleDeleteClick = (estimate: any) => {
    estimateActions.actions.setSelectedEstimate(estimate);
    setShowDeleteDialog(true);
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
      
      const success = await estimateActions.actions.confirmDeleteEstimate();
      if (success) {
        toast.success('Estimate deleted successfully');
      }
    }
    setShowDeleteDialog(false);
  };

  const handleCreateEstimate = () => {
    toast.info('Opening estimate creation dialog...');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'sent': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'approved': return 'bg-emerald-100 text-emerald-700 border-emerald-300';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-300';
      case 'converted': return 'bg-purple-100 text-purple-700 border-purple-300';
      default: return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const isActionDisabled = (estimate: any, action: string) => {
    const isProcessing = processingEstimateId === estimate.id || Object.keys(actionInProgress).length > 0;
    
    switch (action) {
      case 'send':
        return isProcessing || estimate.status === 'sent';
      case 'convert':
        return isProcessing || estimate.status === 'converted';
      case 'view':
      case 'edit':
      case 'delete':
        return isProcessing;
      default:
        return false;
    }
  };

  return (
    <div className="space-y-6">
      <ModernCard className="border border-slate-200 bg-white">
        <ModernCardHeader className="border-b border-slate-200">
          <div className="flex items-center justify-between">
            <ModernCardTitle icon={FileText} className="text-slate-800 text-xl font-semibold">
              <div className="flex items-center gap-2">
                <span>Estimates</span>
                <Badge variant="outline" className="font-semibold">
                  {estimates.length}
                </Badge>
              </div>
            </ModernCardTitle>
            <Button onClick={handleCreateEstimate} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Estimate
            </Button>
          </div>
        </ModernCardHeader>
        
        <ModernCardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-4 rounded-lg border border-slate-200">
                  <Skeleton className="w-full h-16 bg-slate-200" />
                </div>
              ))}
            </div>
          ) : estimates.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">No estimates yet</h3>
              <p className="text-slate-500 mb-4">
                Create estimates to provide quotes to your clients
              </p>
              <Button onClick={handleCreateEstimate} className="gap-2">
                <Plus className="h-4 w-4" />
                Create First Estimate
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {estimates.map((estimate) => (
                <div 
                  key={estimate.id} 
                  className="border border-slate-200 rounded-lg p-4 bg-white hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h4 className="font-semibold text-slate-900 text-lg">
                          Estimate {estimate.estimate_number}
                        </h4>
                        <Badge className={`${getStatusColor(estimate.status)} font-medium px-2 py-1 text-sm`}>
                          {estimate.status.charAt(0).toUpperCase() + estimate.status.slice(1)}
                        </Badge>
                        <div className="flex items-center text-lg font-semibold text-emerald-600">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {estimate.total?.toFixed(2) || '0.00'}
                        </div>
                      </div>
                      <p className="text-slate-500 text-sm flex items-center gap-1">
                        <CalendarClock className="h-3 w-3" />
                        Created {formatDistanceToNow(new Date(estimate.date || estimate.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewEstimate(estimate)}
                        disabled={isActionDisabled(estimate, 'view')}
                        className="gap-1"
                      >
                        {actionInProgress[estimate.id] === 'viewing' ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                        View
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditEstimate(estimate)}
                        disabled={isActionDisabled(estimate, 'edit')}
                        className="gap-1"
                      >
                        {actionInProgress[estimate.id] === 'editing' ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Edit className="h-3 w-3" />
                        )}
                        Edit
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendEstimate(estimate)}
                        disabled={isActionDisabled(estimate, 'send')}
                        className="gap-1"
                      >
                        {actionInProgress[estimate.id] === 'sending' ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Send className="h-3 w-3" />
                        )}
                        Send
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleConvertToInvoice(estimate)}
                        disabled={isActionDisabled(estimate, 'convert')}
                        className="gap-1"
                      >
                        {actionInProgress[estimate.id] === 'converting' ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <FileCheck className="h-3 w-3" />
                        )}
                        Convert
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(estimate)}
                        disabled={isActionDisabled(estimate, 'delete')}
                        className="gap-1 text-red-600 hover:text-red-700 hover:border-red-300"
                      >
                        {estimateActions.state.isDeleting && estimateActions.state.selectedEstimate?.id === estimate.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
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
              className="bg-red-600 hover:bg-red-700"
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
    </div>
  );
};
