
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Send, Edit, CreditCard, Eye, FileText, Download, MoreHorizontal } from "lucide-react";
import { useInvoices } from "@/hooks/useInvoices";
import { useEstimates } from "@/hooks/useEstimates";
import { SteppedInvoiceBuilder } from "../dialogs/SteppedInvoiceBuilder";
import { InvoiceSendDialog } from "../dialogs/InvoiceSendDialog";
import { InvoicePaymentDialog } from "../dialogs/invoice-builder/InvoicePaymentDialog";
import { InvoicePreviewWindow } from "../dialogs/InvoicePreviewWindow";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

interface ModernJobInvoicesTabProps {
  jobId: string;
}

export const ModernJobInvoicesTab = ({ jobId }: ModernJobInvoicesTabProps) => {
  const { invoices, isLoading, refreshInvoices } = useInvoices(jobId);
  const { estimates } = useEstimates(jobId);
  const [showInvoiceBuilder, setShowInvoiceBuilder] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showPreviewWindow, setShowPreviewWindow] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [selectedEstimate, setSelectedEstimate] = useState<any>(null);

  const handleCreateInvoice = () => {
    setSelectedInvoice(null);
    setSelectedEstimate(null);
    setShowInvoiceBuilder(true);
  };

  const handleEditInvoice = (invoice: any) => {
    setSelectedInvoice(invoice);
    setSelectedEstimate(null);
    setShowInvoiceBuilder(true);
  };

  const handleConvertEstimate = (estimate: any) => {
    setSelectedEstimate(estimate);
    setSelectedInvoice(null);
    setShowInvoiceBuilder(true);
  };

  const handleSendInvoice = (invoice: any) => {
    setSelectedInvoice(invoice);
    setShowSendDialog(true);
  };

  const handlePayInvoice = (invoice: any) => {
    setSelectedInvoice(invoice);
    setShowPaymentDialog(true);
  };

  const handleViewInvoice = (invoice: any) => {
    setSelectedInvoice(invoice);
    setShowPreviewWindow(true);
  };

  const handleDownloadInvoice = (invoice: any) => {
    toast.info("Download functionality coming soon");
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canAcceptPayment = (invoice: any) => {
    const status = invoice.status?.toLowerCase();
    return status === 'sent' || status === 'partial' || status === 'overdue';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-fixlyfy border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Get approved estimates that can be converted to invoices
  const convertibleEstimates = estimates?.filter(est => 
    est.status === 'approved' && 
    !invoices?.some(inv => inv.job_id === est.job_id)
  ) || [];

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h3 className="text-lg font-semibold">Invoices</h3>
          <p className="text-sm text-muted-foreground">
            Manage invoices and payments for this job
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCreateInvoice}>
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Convert Estimates Section */}
      {convertibleEstimates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Convert Estimates to Invoices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {convertibleEstimates.map((estimate) => (
              <div key={estimate.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Estimate #{estimate.estimate_number}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(estimate.total)} • Approved
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleConvertEstimate(estimate)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Convert
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Invoices List */}
      <div className="space-y-4">
        {(!invoices || invoices.length === 0) ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-lg mb-2">No invoices yet</div>
            <div className="text-sm">Create your first invoice or convert an approved estimate</div>
          </div>
        ) : (
          invoices.map((invoice) => (
            <Card key={invoice.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg">
                      Invoice #{invoice.invoice_number}
                    </CardTitle>
                    <Badge className={getStatusColor(invoice.status)}>
                      {invoice.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleViewInvoice(invoice)}
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                    <div className="text-right">
                      <div className="font-semibold text-lg">
                        {formatCurrency(invoice.total)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(invoice.date).toLocaleDateString()}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditInvoice(invoice)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSendInvoice(invoice)}>
                          <Send className="h-4 w-4 mr-2" />
                          Send
                        </DropdownMenuItem>
                        {canAcceptPayment(invoice) && (
                          <DropdownMenuItem onClick={() => handlePayInvoice(invoice)}>
                            <CreditCard className="h-4 w-4 mr-2" />
                            Pay
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleDownloadInvoice(invoice)}>
                          <Download className="h-4 w-4 mr-2" />
                          PDF
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Balance</p>
                    <p className="font-medium">
                      {formatCurrency(invoice.balance || (invoice.total - (invoice.amount_paid || 0)))}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Due Date</p>
                    <p>{invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'Not set'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialogs */}
      <SteppedInvoiceBuilder
        open={showInvoiceBuilder}
        onOpenChange={setShowInvoiceBuilder}
        jobId={jobId}
        existingInvoice={selectedInvoice}
        estimateToConvert={selectedEstimate}
        onInvoiceCreated={refreshInvoices}
      />

      {selectedInvoice && (
        <>
          <InvoiceSendDialog
            open={showSendDialog}
            onOpenChange={setShowSendDialog}
            onSave={async () => true}
            onAddWarranty={() => {}}
            invoiceNumber={selectedInvoice.invoice_number}
            jobId={jobId}
          />

          <InvoicePaymentDialog
            isOpen={showPaymentDialog}
            onClose={() => setShowPaymentDialog(false)}
            invoice={selectedInvoice}
            jobId={jobId}
            onPaymentAdded={() => {
              refreshInvoices();
              setShowPaymentDialog(false);
            }}
          />

          <InvoicePreviewWindow
            open={showPreviewWindow}
            onOpenChange={setShowPreviewWindow}
            invoice={selectedInvoice}
            jobId={jobId}
          />
        </>
      )}
    </div>
  );
};
