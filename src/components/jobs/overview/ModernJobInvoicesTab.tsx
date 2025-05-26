
import React, { useState, useEffect } from "react";
import { ModernCard, ModernCardHeader, ModernCardContent, ModernCardTitle } from "@/components/ui/modern-card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useInvoices } from "@/hooks/useInvoices";
import { useInvoiceActions } from "../invoices/hooks/useInvoiceActions";
import { supabase } from "@/integrations/supabase/client";
import { 
  FileText, 
  Eye, 
  Edit, 
  Send, 
  Trash2, 
  CreditCard,
  Plus,
  DollarSign,
  Loader2,
  Sparkles,
  AlertCircle
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useJobHistory } from "@/hooks/useJobHistory";
import { toast } from "sonner";
import { EnhancedButton } from "@/components/ui/enhanced-button";

interface ModernJobInvoicesTabProps {
  jobId: string;
}

export const ModernJobInvoicesTab = ({ jobId }: ModernJobInvoicesTabProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [processingInvoiceId, setProcessingInvoiceId] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<{[key: string]: string}>({});

  const { invoices, isLoading, setInvoices, refreshInvoices } = useInvoices(jobId);
  const { addHistoryItem } = useJobHistory(jobId);
  
  const invoiceActions = useInvoiceActions(
    jobId, 
    invoices, 
    setInvoices,
    refreshInvoices
  );

  // Real-time updates for invoices
  useEffect(() => {
    if (!jobId) return;

    const channel = supabase
      .channel('invoices-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invoices',
          filter: `job_id=eq.${jobId}`
        },
        (payload) => {
          console.log('Real-time invoice update:', payload);
          refreshInvoices();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [jobId, refreshInvoices]);

  const handleViewInvoice = async (invoice: any) => {
    setActionInProgress(prev => ({ ...prev, [invoice.id]: 'viewing' }));
    
    try {
      await addHistoryItem({
        job_id: jobId,
        entity_id: invoice.id,
        entity_type: 'invoice',
        type: 'invoice',
        title: 'Invoice Viewed',
        description: `Invoice ${invoice.invoice_number} was viewed`,
        meta: { action: 'view', invoice_number: invoice.invoice_number }
      });
      
      // Here you would typically open a view dialog or navigate to invoice view
      toast.success(`Viewing invoice ${invoice.invoice_number}`);
      
    } finally {
      setTimeout(() => {
        setActionInProgress(prev => {
          const newState = { ...prev };
          delete newState[invoice.id];
          return newState;
        });
      }, 300);
    }
  };

  const handleEditInvoice = async (invoice: any) => {
    setActionInProgress(prev => ({ ...prev, [invoice.id]: 'editing' }));
    
    try {
      await addHistoryItem({
        job_id: jobId,
        entity_id: invoice.id,
        entity_type: 'invoice',
        type: 'invoice',
        title: 'Invoice Edit Started',
        description: `Started editing invoice ${invoice.invoice_number}`,
        meta: { action: 'edit_started', invoice_number: invoice.invoice_number }
      });
      
      // Here you would typically open an edit dialog
      toast.success(`Editing invoice ${invoice.invoice_number}`);
      
    } finally {
      setTimeout(() => {
        setActionInProgress(prev => {
          const newState = { ...prev };
          delete newState[invoice.id];
          return newState;
        });
      }, 300);
    }
  };

  const handleSendInvoice = async (invoice: any) => {
    if (invoice.status === 'sent') {
      toast.info('Invoice has already been sent');
      return;
    }

    setProcessingInvoiceId(invoice.id);
    setActionInProgress(prev => ({ ...prev, [invoice.id]: 'sending' }));
    
    try {
      await addHistoryItem({
        job_id: jobId,
        entity_id: invoice.id,
        entity_type: 'invoice',
        type: 'communication',
        title: 'Invoice Sent',
        description: `Invoice ${invoice.invoice_number} was sent to client`,
        meta: { action: 'send', invoice_number: invoice.invoice_number }
      });
      
      const success = await invoiceActions.actions.handleSendInvoice(invoice.id);
      if (success) {
        toast.success(`Invoice ${invoice.invoice_number} sent successfully`);
      }
    } catch (error) {
      toast.error('Failed to send invoice');
      console.error('Error sending invoice:', error);
    } finally {
      setProcessingInvoiceId(null);
      setActionInProgress(prev => {
        const newState = { ...prev };
        delete newState[invoice.id];
        return newState;
      });
    }
  };

  const handleMarkAsPaid = async (invoice: any) => {
    if (invoice.status === 'paid') {
      toast.info('Invoice is already marked as paid');
      return;
    }

    setProcessingInvoiceId(invoice.id);
    setActionInProgress(prev => ({ ...prev, [invoice.id]: 'marking-paid' }));
    
    try {
      await addHistoryItem({
        job_id: jobId,
        entity_id: invoice.id,
        entity_type: 'invoice',
        type: 'payment',
        title: 'Invoice Marked as Paid',
        description: `Invoice ${invoice.invoice_number} was marked as paid`,
        meta: { action: 'mark_paid', invoice_number: invoice.invoice_number }
      });
      
      const success = await invoiceActions.actions.markAsPaid(invoice.id);
      if (success) {
        toast.success(`Invoice ${invoice.invoice_number} marked as paid`);
      }
    } catch (error) {
      toast.error('Failed to mark invoice as paid');
      console.error('Error marking invoice as paid:', error);
    } finally {
      setProcessingInvoiceId(null);
      setActionInProgress(prev => {
        const newState = { ...prev };
        delete newState[invoice.id];
        return newState;
      });
    }
  };

  const handleDeleteClick = (invoice: any) => {
    invoiceActions.actions.setSelectedInvoice(invoice);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (invoiceActions.state.selectedInvoice) {
      await addHistoryItem({
        job_id: jobId,
        entity_id: invoiceActions.state.selectedInvoice.id,
        entity_type: 'invoice',
        type: 'invoice',
        title: 'Invoice Deleted',
        description: `Invoice ${invoiceActions.state.selectedInvoice.invoice_number} was deleted`,
        meta: { action: 'delete', invoice_number: invoiceActions.state.selectedInvoice.invoice_number }
      });
      
      const success = await invoiceActions.actions.confirmDeleteInvoice();
      if (success) {
        toast.success('Invoice deleted successfully');
      }
    }
    setShowDeleteDialog(false);
  };

  const handleCreateInvoice = () => {
    // Here you would typically open an invoice creation dialog
    toast.info('Opening invoice creation dialog...');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unpaid': return 'bg-orange-100 text-orange-700 border-orange-300 shadow-sm shadow-orange-200/50';
      case 'paid': return 'bg-emerald-100 text-emerald-700 border-emerald-300 shadow-sm shadow-emerald-200/50';
      case 'partial': return 'bg-yellow-100 text-yellow-700 border-yellow-300 shadow-sm shadow-yellow-200/50';
      case 'sent': return 'bg-blue-100 text-blue-700 border-blue-300 shadow-sm shadow-blue-200/50';
      case 'overdue': return 'bg-red-100 text-red-700 border-red-300 shadow-sm shadow-red-200/50';
      default: return 'bg-slate-100 text-slate-700 border-slate-300 shadow-sm';
    }
  };

  const isActionDisabled = (invoice: any, action: string) => {
    const isProcessing = processingInvoiceId === invoice.id || Object.keys(actionInProgress).length > 0;
    
    switch (action) {
      case 'send':
        return isProcessing || invoice.status === 'sent';
      case 'markPaid':
        return isProcessing || invoice.status === 'paid';
      case 'view':
      case 'edit':
      case 'delete':
        return isProcessing;
      default:
        return false;
    }
  };

  return (
    <div className="space-y-8">
      <ModernCard 
        variant="elevated" 
        className="relative overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 bg-gradient-to-br from-white to-slate-50/50 border-0"
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-full blur-3xl opacity-30 transform translate-x-16 -translate-y-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-100 to-emerald-100 rounded-full blur-2xl opacity-20 transform -translate-x-12 translate-y-12" />
        
        <ModernCardHeader className="pb-6 bg-gradient-to-r from-emerald-50/50 via-blue-50/50 to-cyan-50/50 rounded-t-xl backdrop-blur-sm relative z-10">
          <div className="flex items-center justify-between">
            <ModernCardTitle icon={FileText} className="text-slate-800 text-xl font-bold flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span>Invoices</span>
                <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-emerald-100 to-blue-100 rounded-full">
                  <span className="text-sm font-semibold text-slate-700">{invoices.length}</span>
                  <Sparkles className="h-3 w-3 text-emerald-600" />
                </div>
              </div>
            </ModernCardTitle>
            <EnhancedButton 
              onClick={handleCreateInvoice}
              gradient
              glow
              icon={Plus}
              className="px-6 py-3 rounded-xl font-semibold text-white"
            >
              Create Invoice
            </EnhancedButton>
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
          ) : invoices.length === 0 ? (
            <div className="text-center py-16 relative">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-100 via-blue-100 to-cyan-100 rounded-full opacity-30 blur-2xl scale-150" />
                <FileText className="mx-auto h-20 w-20 text-slate-400 mb-6 relative z-10" />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-slate-700">No invoices yet</h3>
                <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
                  Create invoices to bill your clients for completed work
                </p>
                <div className="pt-4">
                  <EnhancedButton 
                    onClick={handleCreateInvoice}
                    gradient
                    glow
                    icon={Plus}
                    className="px-8 py-3 rounded-xl font-semibold text-white"
                  >
                    Create First Invoice
                  </EnhancedButton>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {invoices.map((invoice, index) => (
                <div 
                  key={invoice.id} 
                  className="group relative overflow-hidden border-2 rounded-2xl p-6 bg-gradient-to-br from-white via-slate-50/50 to-white hover:from-white hover:via-emerald-50/30 hover:to-white transition-all duration-500 transform hover:-translate-y-1 hover:scale-[1.02] border-slate-200 hover:border-emerald-300 hover:shadow-2xl"
                  style={{
                    boxShadow: '0 8px 25px -8px rgba(0, 0, 0, 0.1), 0 4px 12px -4px rgba(0, 0, 0, 0.1)',
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  {/* Animated background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/0 via-blue-50/20 to-emerald-50/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Progress indicator for actions */}
                  {actionInProgress[invoice.id] && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-blue-500 transform origin-left animate-pulse" />
                  )}
                  
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-4 flex-wrap">
                        <h4 className="font-bold text-slate-900 text-xl group-hover:text-emerald-900 transition-colors duration-300">
                          Invoice {invoice.invoice_number}
                        </h4>
                        <Badge className={`${getStatusColor(invoice.status)} font-semibold px-3 py-1 text-sm border-2 transition-all duration-300 hover:scale-105`}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </Badge>
                        <div className="flex items-center text-xl font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border-2 border-emerald-200 shadow-sm">
                          <DollarSign className="h-5 w-5 mr-1" />
                          {invoice.total?.toFixed(2) || '0.00'}
                        </div>
                        {invoice.balance > 0 && (
                          <div className="flex items-center text-sm font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full border border-orange-200">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            <span>Balance: ${invoice.balance.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-slate-500 font-medium">
                        Created {formatDistanceToNow(new Date(invoice.date || invoice.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3 flex-wrap">
                      <EnhancedButton
                        variant="outline"
                        size="sm"
                        icon={Eye}
                        onClick={() => handleViewInvoice(invoice)}
                        disabled={isActionDisabled(invoice, 'view')}
                        loading={actionInProgress[invoice.id] === 'viewing'}
                        loadingText="Opening..."
                        className="hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50"
                      >
                        View
                      </EnhancedButton>
                      
                      <EnhancedButton
                        variant="outline"
                        size="sm"
                        icon={Edit}
                        onClick={() => handleEditInvoice(invoice)}
                        disabled={isActionDisabled(invoice, 'edit')}
                        loading={actionInProgress[invoice.id] === 'editing'}
                        loadingText="Opening..."
                        className="hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50"
                      >
                        Edit
                      </EnhancedButton>
                      
                      <EnhancedButton
                        variant="outline"
                        size="sm"
                        icon={Send}
                        onClick={() => handleSendInvoice(invoice)}
                        disabled={isActionDisabled(invoice, 'send')}
                        loading={actionInProgress[invoice.id] === 'sending'}
                        loadingText="Sending..."
                        className="hover:border-purple-300 hover:text-purple-700 hover:bg-purple-50 disabled:opacity-50"
                      >
                        Send
                      </EnhancedButton>
                      
                      <EnhancedButton
                        variant="outline"
                        size="sm"
                        icon={CreditCard}
                        onClick={() => handleMarkAsPaid(invoice)}
                        disabled={isActionDisabled(invoice, 'markPaid')}
                        loading={actionInProgress[invoice.id] === 'marking-paid'}
                        loadingText="Processing..."
                        className="hover:border-green-300 hover:text-green-700 hover:bg-green-50 disabled:opacity-50"
                      >
                        Mark Paid
                      </EnhancedButton>
                      
                      <EnhancedButton
                        variant="outline"
                        size="sm"
                        icon={Trash2}
                        onClick={() => handleDeleteClick(invoice)}
                        disabled={isActionDisabled(invoice, 'delete')}
                        loading={invoiceActions.state.isDeleting && invoiceActions.state.selectedInvoice?.id === invoice.id}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="border-red-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-800">Delete Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete invoice {invoiceActions.state.selectedInvoice?.invoice_number}? 
              This action cannot be undone and will permanently remove the invoice and all its associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 transform hover:scale-105 transition-all duration-200"
              disabled={invoiceActions.state.isDeleting}
            >
              {invoiceActions.state.isDeleting ? (
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
