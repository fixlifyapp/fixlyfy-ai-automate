
import { useState } from "react";
import { ModernCard, ModernCardHeader, ModernCardContent, ModernCardTitle } from "@/components/ui/modern-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Receipt, Edit, Eye, Trash2, Send } from "lucide-react";
import { useInvoices } from "@/hooks/useInvoices";
import { useEstimates } from "@/hooks/useEstimates";
import { InvoiceBuilderDialog } from "../dialogs/InvoiceBuilderDialog";
import { InvoiceSendDialog } from "../dialogs/InvoiceSendDialog";
import { useInvoiceBuilder } from "../hooks/useInvoiceBuilder";
import { useUnifiedRealtime } from "@/hooks/useUnifiedRealtime";
import { useJobDetails } from "../context/JobDetailsContext";
import { toast } from "sonner";

interface ModernJobInvoicesTabProps {
  jobId: string;
}

export const ModernJobInvoicesTab = ({ jobId }: ModernJobInvoicesTabProps) => {
  const { job } = useJobDetails();
  const { invoices, isLoading, refreshInvoices } = useInvoices(jobId);
  const { estimates } = useEstimates(jobId);
  const [isInvoiceBuilderOpen, setIsInvoiceBuilderOpen] = useState(false);
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [selectedEstimate, setSelectedEstimate] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const { sendInvoice } = useInvoiceBuilder(jobId);

  // Real-time updates for invoices, payments, and line_items
  useUnifiedRealtime({
    tables: ['invoices', 'payments', 'line_items', 'invoice_communications'],
    onUpdate: () => {
      console.log("Real-time update for invoices/payments");
      if (refreshInvoices) {
        refreshInvoices();
      }
    },
    enabled: true
  });

  const handleCreateFromEstimate = (estimate: any) => {
    setSelectedEstimate(estimate);
    setSelectedInvoice(null);
    setIsInvoiceBuilderOpen(true);
  };

  const handleEditInvoice = (invoice: any) => {
    setSelectedInvoice(invoice);
    setSelectedEstimate(null);
    setIsInvoiceBuilderOpen(true);
  };

  const handleSendInvoice = (invoice: any) => {
    setSelectedInvoice(invoice);
    setIsSendDialogOpen(true);
  };

  const handleCreateNew = () => {
    setSelectedEstimate(null);
    setSelectedInvoice(null);
    setIsInvoiceBuilderOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700 border-green-200';
      case 'partial': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'sent': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'draft': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Get client info from job context
  const getClientInfo = () => {
    if (!job) return { email: '', phone: '' };
    
    return {
      email: job.email || '',
      phone: job.phone || ''
    };
  };

  if (isLoading) {
    return (
      <ModernCard>
        <ModernCardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </ModernCardContent>
      </ModernCard>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Quick Actions */}
        <ModernCard>
          <ModernCardHeader>
            <ModernCardTitle icon={Plus}>Quick Actions</ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent>
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleCreateNew} className="gap-2">
                <Plus className="h-4 w-4" />
                Create New Invoice
              </Button>
              
              {estimates.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">From Estimate:</span>
                  {estimates.map((estimate) => (
                    <Button
                      key={estimate.id}
                      variant="outline"
                      size="sm"
                      onClick={() => handleCreateFromEstimate(estimate)}
                      className="gap-2"
                    >
                      <Receipt className="h-3 w-3" />
                      {estimate.estimate_number}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </ModernCardContent>
        </ModernCard>

        {/* Invoices List */}
        <ModernCard>
          <ModernCardHeader>
            <ModernCardTitle icon={Receipt}>
              Invoices ({invoices.length})
            </ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent>
            {invoices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No invoices created yet</p>
                <p className="text-sm">Create your first invoice to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="font-medium">
                            Invoice #{invoice.number}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Created: {new Date(invoice.date).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status}
                        </Badge>
                        
                        <div className="text-right">
                          <div className="font-semibold text-lg">
                            ${invoice.total.toFixed(2)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Due: {new Date(invoice.due_date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toast.info("View functionality coming soon")}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSendInvoice(invoice)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditInvoice(invoice)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toast.info("Delete functionality coming soon")}
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
      </div>

      <InvoiceBuilderDialog
        open={isInvoiceBuilderOpen}
        onOpenChange={setIsInvoiceBuilderOpen}
        jobId={jobId}
        estimate={selectedEstimate}
        invoice={selectedInvoice}
        onInvoiceCreated={(invoice) => {
          toast.success("Invoice operation completed successfully");
          // Real-time updates will handle the refresh automatically
        }}
      />

      {selectedInvoice && (
        <InvoiceSendDialog
          open={isSendDialogOpen}
          onOpenChange={setIsSendDialogOpen}
          invoiceId={selectedInvoice.id}
          invoiceNumber={selectedInvoice.number}
          clientEmail={getClientInfo().email}
          clientPhone={getClientInfo().phone}
          onSend={async (recipient, method, message) => {
            return await sendInvoice(selectedInvoice.id, recipient, method, message);
          }}
        />
      )}
    </>
  );
};
