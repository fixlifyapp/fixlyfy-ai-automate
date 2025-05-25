
import React, { useState, useEffect } from "react";
import { ModernCard, ModernCardHeader, ModernCardContent, ModernCardTitle } from "@/components/ui/modern-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { InvoiceBuilderDialog } from "../dialogs/InvoiceBuilderDialog";
import { useInvoices, Invoice } from "@/hooks/useInvoices";
import { 
  FileText, 
  Eye, 
  Edit, 
  Send, 
  Trash2, 
  Plus,
  DollarSign,
  Clock
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useJobHistory } from "@/hooks/useJobHistory";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ModernJobInvoicesTabProps {
  jobId: string;
}

export const ModernJobInvoicesTab = ({ jobId }: ModernJobInvoicesTabProps) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { invoices, isLoading, refreshInvoices } = useInvoices(jobId);
  const { addHistoryItem } = useJobHistory(jobId);

  const handleViewInvoice = async (invoice: Invoice) => {
    await addHistoryItem({
      job_id: jobId,
      entity_id: invoice.id,
      entity_type: 'invoice',
      type: 'invoice',
      title: 'Invoice Viewed',
      description: `Invoice ${invoice.number} was viewed`,
      meta: { action: 'view', invoice_number: invoice.number }
    });
    
    setSelectedInvoice(invoice);
    setIsEditDialogOpen(true);
  };

  const handleEditInvoice = async (invoice: Invoice) => {
    await addHistoryItem({
      job_id: jobId,
      entity_id: invoice.id,
      entity_type: 'invoice',
      type: 'invoice',
      title: 'Invoice Edit Started',
      description: `Started editing invoice ${invoice.number}`,
      meta: { action: 'edit_started', invoice_number: invoice.number }
    });
    
    setSelectedInvoice(invoice);
    setIsEditDialogOpen(true);
  };

  const handleSendInvoice = async (invoice: Invoice) => {
    await addHistoryItem({
      job_id: jobId,
      entity_id: invoice.id,
      entity_type: 'invoice',
      type: 'communication',
      title: 'Invoice Sent',
      description: `Invoice ${invoice.number} was sent to client`,
      meta: { action: 'send', invoice_number: invoice.number }
    });
    
    toast.success(`Invoice ${invoice.number} sent successfully`);
  };

  const handleDeleteClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedInvoice) return;
    
    setIsDeleting(true);
    
    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', selectedInvoice.id);
        
      if (error) throw error;
      
      await addHistoryItem({
        job_id: jobId,
        entity_id: selectedInvoice.id,
        entity_type: 'invoice',
        type: 'invoice',
        title: 'Invoice Deleted',
        description: `Invoice ${selectedInvoice.number} was deleted`,
        meta: { action: 'delete', invoice_number: selectedInvoice.number }
      });
      
      toast.success(`Invoice ${selectedInvoice.number} deleted successfully`);
      refreshInvoices();
    } catch (error) {
      console.error("Failed to delete invoice:", error);
      toast.error("Failed to delete invoice");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setSelectedInvoice(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'sent': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'paid': return 'bg-green-100 text-green-700 border-green-200';
      case 'partial': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'overdue': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <ModernCard variant="elevated" className="hover:shadow-lg transition-all duration-300">
        <ModernCardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <ModernCardTitle icon={FileText}>
              Invoices ({invoices.length})
            </ModernCardTitle>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Invoice
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
          ) : invoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium">No invoices yet</p>
              <p className="text-sm">Create your first invoice to get started</p>
              <Button 
                onClick={() => setIsCreateDialogOpen(true)}
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Invoice
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="border rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium text-gray-900">
                          Invoice {invoice.number}
                        </h4>
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status}
                        </Badge>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <DollarSign className="h-4 w-4 mr-1" />
                          ${invoice.total?.toFixed(2) || '0.00'}
                        </div>
                        {invoice.balance && invoice.balance > 0 && (
                          <div className="flex items-center text-sm text-orange-600">
                            <Clock className="h-4 w-4 mr-1" />
                            Balance: ${invoice.balance.toFixed(2)}
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Created {formatDistanceToNow(new Date(invoice.date), { addSuffix: true })}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewInvoice(invoice)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditInvoice(invoice)}
                        className="flex items-center gap-1"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendInvoice(invoice)}
                        className="flex items-center gap-1"
                      >
                        <Send className="h-4 w-4" />
                        Send
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(invoice)}
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
      <InvoiceBuilderDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        jobId={jobId}
        onInvoiceCreated={() => refreshInvoices()}
      />

      <InvoiceBuilderDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        jobId={jobId}
        invoice={selectedInvoice || undefined}
        onInvoiceCreated={() => refreshInvoices()}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete invoice {selectedInvoice?.number}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
