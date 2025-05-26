import React, { useState, useEffect } from "react";
import { ModernCard, ModernCardHeader, ModernCardContent, ModernCardTitle } from "@/components/ui/modern-card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useInvoices } from "@/hooks/useInvoices";
import { useInvoiceActions } from "../invoices/hooks/useInvoiceActions";
import { supabase } from "@/integrations/supabase/client";
import { InvoiceBuilderDialog } from "../dialogs/InvoiceBuilderDialog";
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
  AlertCircle
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useJobHistory } from "@/hooks/useJobHistory";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface ModernJobInvoicesTabProps {
  jobId: string;
}

export const ModernJobInvoicesTab = ({ jobId }: ModernJobInvoicesTabProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [processingInvoiceId, setProcessingInvoiceId] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<{[key: string]: string}>({});
  const [isInvoiceBuilderOpen, setIsInvoiceBuilderOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

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
      
      // Open invoice in edit mode for viewing
      setSelectedInvoiceId(invoice.id);
      setIsInvoiceBuilderOpen(true);
      
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
      
      // Open invoice builder for editing
      setSelectedInvoiceId(invoice.id);
      setIsInvoiceBuilderOpen(true);
      
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
    setSelectedInvoiceId(null);
    setIsInvoiceBuilderOpen(true);
  };

  const handleInvoiceCreated = () => {
    refreshInvoices();
    setIsInvoiceBuilderOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unpaid': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'paid': return 'bg-emerald-100 text-emerald-700 border-emerald-300';
      case 'partial': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'sent': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'overdue': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-slate-100 text-slate-700 border-slate-300';
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
    <div className="space-y-6">
      <ModernCard className="border border-slate-200 bg-white">
        <ModernCardHeader className="border-b border-slate-200">
          <div className="flex items-center justify-between">
            <ModernCardTitle icon={FileText} className="text-slate-800 text-xl font-semibold">
              <div className="flex items-center gap-2">
                <span>Invoices</span>
                <Badge variant="outline" className="font-semibold">
                  {invoices.length}
                </Badge>
              </div>
            </ModernCardTitle>
            <Button onClick={handleCreateInvoice} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Invoice
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
          ) : invoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">No invoices yet</h3>
              <p className="text-slate-500 mb-4">
                Create invoices to bill your clients for completed work
              </p>
              <Button onClick={handleCreateInvoice} className="gap-2">
                <Plus className="h-4 w-4" />
                Create First Invoice
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {invoices.map((invoice) => (
                <div 
                  key={invoice.id} 
                  className="border border-slate-200 rounded-lg p-4 bg-white hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h4 className="font-semibold text-slate-900 text-lg">
                          Invoice {invoice.invoice_number}
                        </h4>
                        <Badge className={`${getStatusColor(invoice.status)} font-medium px-2 py-1 text-sm`}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </Badge>
                        <div className="flex items-center text-lg font-semibold text-emerald-600">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {invoice.total?.toFixed(2) || '0.00'}
                        </div>
                        {invoice.balance > 0 && (
                          <div className="flex items-center text-sm font-medium text-orange-600">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            <span>Balance: ${invoice.balance.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-slate-500 text-sm">
                        Created {formatDistanceToNow(new Date(invoice.date || invoice.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewInvoice(invoice)}
                        disabled={isActionDisabled(invoice, 'view')}
                        className="gap-1"
                      >
                        {actionInProgress[invoice.id] === 'viewing' ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                        View
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditInvoice(invoice)}
                        disabled={isActionDisabled(invoice, 'edit')}
                        className="gap-1"
                      >
                        {actionInProgress[invoice.id] === 'editing' ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Edit className="h-3 w-3" />
                        )}
                        Edit
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendInvoice(invoice)}
                        disabled={isActionDisabled(invoice, 'send')}
                        className="gap-1"
                      >
                        {actionInProgress[invoice.id] === 'sending' ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Send className="h-3 w-3" />
                        )}
                        Send
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkAsPaid(invoice)}
                        disabled={isActionDisabled(invoice, 'markPaid')}
                        className="gap-1"
                      >
                        {actionInProgress[invoice.id] === 'marking-paid' ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <CreditCard className="h-3 w-3" />
                        )}
                        Mark Paid
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(invoice)}
                        disabled={isActionDisabled(invoice, 'delete')}
                        className="gap-1 text-red-600 hover:text-red-700 hover:border-red-300"
                      >
                        {invoiceActions.state.isDeleting && invoiceActions.state.selectedInvoice?.id === invoice.id ? (
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
              className="bg-red-600 hover:bg-red-700"
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

      {/* Invoice Builder Dialog */}
      <InvoiceBuilderDialog
        open={isInvoiceBuilderOpen}
        onOpenChange={setIsInvoiceBuilderOpen}
        jobId={jobId}
        invoice={selectedInvoiceId ? invoices.find(inv => inv.id === selectedInvoiceId) : undefined}
        onInvoiceCreated={handleInvoiceCreated}
      />
    </div>
  );
};
