
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, DollarSign, Send, MoreHorizontal, Trash2 } from "lucide-react";
import { useInvoices } from "@/hooks/useInvoices";
import { useInvoiceActions } from "@/components/jobs/invoices/hooks/useInvoiceActions";
import { InvoiceBuilderDialog } from "@/components/jobs/dialogs/InvoiceBuilderDialog";
import { format } from "date-fns";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface ModernJobInvoicesTabProps {
  jobId: string;
}

export const ModernJobInvoicesTab = ({ jobId }: ModernJobInvoicesTabProps) => {
  const { invoices, setInvoices, isLoading, refreshInvoices } = useInvoices(jobId);
  const { state, actions } = useInvoiceActions(jobId, invoices, setInvoices, refreshInvoices);
  const [showCreateForm, setShowCreateForm] = useState(false);

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
              <Button onClick={() => setShowCreateForm(true)}>
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
                      {invoice.status === 'unpaid' && invoice.balance > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => actions.markAsPaid(invoice.id, invoice.balance)}
                          disabled={state.isProcessing}
                        >
                          <DollarSign className="h-4 w-4 mr-1" />
                          Mark as Paid
                        </Button>
                      )}
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" disabled={state.isDeleting || state.isSending}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => actions.handleSendInvoice(invoice.id)}>
                            <Send className="h-4 w-4 mr-2" />
                            Send to Client
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem 
                            onClick={() => {
                              actions.setSelectedInvoice(invoice);
                              actions.confirmDeleteInvoice();
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
        onOpenChange={setShowCreateForm}
        jobId={jobId}
        onInvoiceCreated={handleInvoiceCreated}
      />
    </>
  );
};
