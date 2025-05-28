import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, DollarSign, Send, Trash2, Edit, CreditCard } from "lucide-react";
import { useInvoices } from "@/hooks/useInvoices";
import { useInvoiceActions } from "@/components/jobs/invoices/hooks/useInvoiceActions";
import { InvoiceBuilderDialog } from "@/components/jobs/dialogs/InvoiceBuilderDialog";
import { PaymentDialog } from "@/components/jobs/dialogs/PaymentDialog";
import { format } from "date-fns";
import { PaymentMethod } from "@/types/payment";

interface ModernJobInvoicesTabProps {
  jobId: string;
  onSwitchToPayments?: () => void;
}

export const ModernJobInvoicesTab = ({ jobId, onSwitchToPayments }: ModernJobInvoicesTabProps) => {
  const { invoices, setInvoices, isLoading, refreshInvoices } = useInvoices(jobId);
  const { state, actions } = useInvoiceActions(jobId, invoices, setInvoices, refreshInvoices);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<any>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<any>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      'paid': 'bg-green-100 text-green-800',
      'unpaid': 'bg-red-100 text-red-800',
      'partial': 'bg-yellow-100 text-yellow-800',
      'sent': 'bg-blue-100 text-blue-800',
      'draft': 'bg-gray-100 text-gray-800',
      'overdue': 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const totalInvoiceValue = invoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0);
  const totalPaid = invoices.reduce((sum, invoice) => sum + (invoice.amount_paid || 0), 0);
  const totalOutstanding = totalInvoiceValue - totalPaid;

  const handleInvoiceCreated = () => {
    refreshInvoices();
    setShowCreateForm(false);
    setEditingInvoice(null);
  };

  const handleEditInvoice = (invoice: any) => {
    setEditingInvoice(invoice);
    setShowCreateForm(true);
  };

  const handleCreateNew = () => {
    setEditingInvoice(null);
    setShowCreateForm(true);
  };

  const handlePayInvoice = (invoice: any) => {
    setSelectedInvoiceForPayment(invoice);
    setShowPaymentDialog(true);
  };

  const handlePaymentProcessed = async (amount: number, method: PaymentMethod, reference?: string, notes?: string) => {
    if (!selectedInvoiceForPayment) return;

    // Record the payment using the invoice actions
    const success = await actions.markAsPaid(selectedInvoiceForPayment.id, amount);
    
    if (success) {
      setShowPaymentDialog(false);
      setSelectedInvoiceForPayment(null);
      
      // Switch to payments tab after a short delay
      if (onSwitchToPayments) {
        setTimeout(() => {
          onSwitchToPayments();
        }, 1000);
      }
    }
  };

  const handleDialogClose = () => {
    setShowCreateForm(false);
    setEditingInvoice(null);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{invoices.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalInvoiceValue)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Paid</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Outstanding</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{formatCurrency(totalOutstanding)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Invoices List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Invoices ({invoices.length})
              </CardTitle>
              <Button onClick={handleCreateNew}>
                <Plus className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading invoices...</div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium">No invoices yet</p>
                <p className="text-sm">Create your first invoice to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-medium">{invoice.invoice_number}</span>
                        <span className="text-lg font-semibold text-blue-600">
                          {formatCurrency(invoice.total || 0)}
                        </span>
                        {getStatusBadge(invoice.status)}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Created: {format(new Date(invoice.created_at), 'MMM dd, yyyy')}</p>
                        <p>Paid: {formatCurrency(invoice.amount_paid || 0)} | Balance: {formatCurrency(invoice.balance || 0)}</p>
                        {invoice.notes && <p>Notes: {invoice.notes}</p>}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditInvoice(invoice)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => actions.handleSendInvoice(invoice.id)}
                        disabled={state.isSending}
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Send
                      </Button>
                      
                      {(invoice.status === 'unpaid' || invoice.status === 'partial') && invoice.balance > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePayInvoice(invoice)}
                          disabled={state.isProcessing}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CreditCard className="h-4 w-4 mr-1" />
                          Pay
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          actions.setSelectedInvoice(invoice);
                          actions.confirmDeleteInvoice();
                        }}
                        disabled={state.isDeleting}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Invoice Builder Dialog */}
      <InvoiceBuilderDialog
        open={showCreateForm}
        onOpenChange={handleDialogClose}
        jobId={jobId}
        invoice={editingInvoice}
        onInvoiceCreated={handleInvoiceCreated}
      />

      {/* Payment Dialog */}
      <PaymentDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        balance={selectedInvoiceForPayment?.balance || 0}
        onPaymentProcessed={handlePaymentProcessed}
      />
    </>
  );
};
