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
  Loader2,
  Sparkles
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

  const handleViewEstimate = async (estimate: Estimate) => {
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

  const handleEditEstimate = async (estimate: Estimate) => {
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
      
      setSelectedEstimateId(estimate.id);
      setIsEditDialogOpen(true);
      
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

  const handleSendEstimate = async (estimate: Estimate) => {
    if (estimate.status === 'sent' || estimate.status === 'converted') {
      toast.info(`Estimate has already been ${estimate.status}`);
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
      case 'draft': return 'bg-slate-100 text-slate-700 border-slate-300 shadow-sm';
      case 'sent': return 'bg-blue-100 text-blue-700 border-blue-300 shadow-sm shadow-blue-200/50';
      case 'approved': return 'bg-emerald-100 text-emerald-700 border-emerald-300 shadow-sm shadow-emerald-200/50';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-300 shadow-sm shadow-red-200/50';
      case 'converted': return 'bg-purple-100 text-purple-700 border-purple-300 shadow-sm shadow-purple-200/50';
      default: return 'bg-slate-100 text-slate-700 border-slate-300 shadow-sm';
    }
  };

  const isActionDisabled = (estimate: Estimate, action: string) => {
    const isProcessing = processingEstimateId === estimate.id || Object.keys(actionInProgress).length > 0;
    
    switch (action) {
      case 'send':
        return isProcessing || estimate.status === 'sent' || estimate.status === 'converted';
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

  const EnhancedButton = ({ children, variant = "outline", size = "sm", onClick, disabled, className = "", loading = false, icon: Icon, loadingText }: any) => (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        relative overflow-hidden transition-all duration-300 ease-out transform
        hover:scale-105 hover:-translate-y-0.5 active:scale-95
        shadow-md hover:shadow-xl border-2
        backdrop-blur-sm bg-white/90 hover:bg-white
        disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none
        ${className}
      `}
    >
      <div className="flex items-center gap-2 relative z-10">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : Icon ? (
          <Icon className="h-4 w-4" />
        ) : null}
        <span className="font-medium">
          {loading && loadingText ? loadingText : children}
        </span>
      </div>
      {!disabled && !loading && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700 ease-out" />
      )}
    </Button>
  );

  return (
    <div className="space-y-8">
      <ModernCard 
        variant="elevated" 
        className="relative overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 bg-gradient-to-br from-white to-slate-50/50 border-0"
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full blur-3xl opacity-30 transform translate-x-16 -translate-y-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-100 to-purple-100 rounded-full blur-2xl opacity-20 transform -translate-x-12 translate-y-12" />
        
        <ModernCardHeader className="pb-6 bg-gradient-to-r from-purple-50/50 via-blue-50/50 to-indigo-50/50 rounded-t-xl backdrop-blur-sm relative z-10">
          <div className="flex items-center justify-between">
            <ModernCardTitle icon={Calculator} className="text-slate-800 text-xl font-bold flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span>Estimates</span>
                <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full">
                  <span className="text-sm font-semibold text-slate-700">{estimates.length}</span>
                  <Sparkles className="h-3 w-3 text-purple-600" />
                </div>
              </div>
            </ModernCardTitle>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl border-0 px-6 py-3 rounded-xl font-semibold text-white relative overflow-hidden group"
            >
              <div className="flex items-center gap-2 relative z-10">
                <Plus className="h-4 w-4" />
                <span>Create Estimate</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </Button>
          </div>
        </ModernCardHeader>
        
        <ModernCardContent className="space-y-6 relative z-10">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-6 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 animate-pulse">
                  <Skeleton className="w-full h-20 bg-slate-200" />
                </div>
              ))}
            </div>
          ) : estimates.length === 0 ? (
            <div className="text-center py-16 relative">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-100 via-blue-100 to-indigo-100 rounded-full opacity-30 blur-2xl scale-150" />
                <Calculator className="mx-auto h-20 w-20 text-slate-400 mb-6 relative z-10" />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-slate-700">No estimates yet</h3>
                <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
                  Create your first estimate to provide professional quotes to your clients
                </p>
                <div className="pt-4">
                  <Button 
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl border-0 px-8 py-3 rounded-xl font-semibold text-white relative overflow-hidden group"
                  >
                    <div className="flex items-center gap-2 relative z-10">
                      <Plus className="h-5 w-5" />
                      <span>Create First Estimate</span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {estimates.map((estimate, index) => (
                <div 
                  key={estimate.id} 
                  className="group relative overflow-hidden border-2 rounded-2xl p-6 bg-gradient-to-br from-white via-slate-50/50 to-white hover:from-white hover:via-blue-50/30 hover:to-white transition-all duration-500 transform hover:-translate-y-1 hover:scale-[1.02] border-slate-200 hover:border-blue-300 hover:shadow-2xl"
                  style={{
                    boxShadow: '0 8px 25px -8px rgba(0, 0, 0, 0.1), 0 4px 12px -4px rgba(0, 0, 0, 0.1)',
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  {/* Animated background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50/0 via-purple-50/20 to-blue-50/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Progress indicator for actions */}
                  {actionInProgress[estimate.id] && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500 transform origin-left animate-pulse" />
                  )}
                  
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-4 flex-wrap">
                        <h4 className="font-bold text-slate-900 text-xl group-hover:text-blue-900 transition-colors duration-300">
                          Estimate {estimate.estimate_number}
                        </h4>
                        <Badge className={`${getStatusColor(estimate.status)} font-semibold px-3 py-1 text-sm border-2 transition-all duration-300 hover:scale-105`}>
                          {estimate.status.charAt(0).toUpperCase() + estimate.status.slice(1)}
                        </Badge>
                        <div className="flex items-center text-xl font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border-2 border-emerald-200 shadow-sm">
                          <DollarSign className="h-5 w-5 mr-1" />
                          {estimate.total?.toFixed(2) || '0.00'}
                        </div>
                      </div>
                      <p className="text-slate-500 font-medium">
                        Created {formatDistanceToNow(new Date(estimate.date), { addSuffix: true })}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3 flex-wrap">
                      <EnhancedButton
                        variant="outline"
                        size="sm"
                        icon={Eye}
                        onClick={() => handleViewEstimate(estimate)}
                        disabled={isActionDisabled(estimate, 'view')}
                        loading={actionInProgress[estimate.id] === 'viewing'}
                        loadingText="Opening..."
                        className="hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50"
                      >
                        View
                      </EnhancedButton>
                      
                      <EnhancedButton
                        variant="outline"
                        size="sm"
                        icon={Edit}
                        onClick={() => handleEditEstimate(estimate)}
                        disabled={isActionDisabled(estimate, 'edit')}
                        loading={actionInProgress[estimate.id] === 'editing'}
                        loadingText="Opening..."
                        className="hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50"
                      >
                        Edit
                      </EnhancedButton>
                      
                      <EnhancedButton
                        variant="outline"
                        size="sm"
                        icon={Send}
                        onClick={() => handleSendEstimate(estimate)}
                        disabled={isActionDisabled(estimate, 'send')}
                        loading={actionInProgress[estimate.id] === 'sending'}
                        loadingText="Sending..."
                        className="hover:border-purple-300 hover:text-purple-700 hover:bg-purple-50 disabled:opacity-50"
                      >
                        Send
                      </EnhancedButton>
                      
                      <EnhancedButton
                        variant="outline"
                        size="sm"
                        icon={ArrowRight}
                        onClick={() => handleConvertClick(estimate)}
                        disabled={isActionDisabled(estimate, 'convert')}
                        loading={estimateActions.state.isConverting && estimateActions.state.selectedEstimate?.id === estimate.id}
                        loadingText="Converting..."
                        className="hover:border-indigo-300 hover:text-indigo-700 hover:bg-indigo-50 disabled:opacity-50"
                      >
                        Convert
                      </EnhancedButton>
                      
                      <EnhancedButton
                        variant="outline"
                        size="sm"
                        icon={Trash2}
                        onClick={() => handleDeleteClick(estimate)}
                        disabled={isActionDisabled(estimate, 'delete')}
                        loading={estimateActions.state.isDeleting && estimateActions.state.selectedEstimate?.id === estimate.id}
                        loadingText="Removing..."
                        className="hover:border-red-300 hover:text-red-700 hover:bg-red-50"
                      >
                        Remove
                      </EnhancedButton>
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
