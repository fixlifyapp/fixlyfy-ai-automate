
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Send, Edit, CreditCard, Eye, FileText, Download } from "lucide-react";
import { useInvoices } from "@/hooks/useInvoices";
import { useEstimates } from "@/hooks/useEstimates";
import { SteppedInvoiceBuilder } from "../dialogs/SteppedInvoiceBuilder";
import { InvoiceSendDialog } from "../dialogs/InvoiceSendDialog";
import { InvoicePaymentDialog } from "../dialogs/invoice-builder/InvoicePaymentDialog";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

interface ModernJobInvoicesTabProps {
  jobId: string;
}

export const ModernJobInvoicesTab = ({ jobId }: ModernJobInvoicesTabProps) => {
  const { invoices, loading, refetch } = useInvoices(jobId);
  const { estimates } = useEstimates(jobId);
  const [showInvoiceBuilder, setShowInvoiceBuilder] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
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
    const viewUrl = `/invoice/view/${invoice.invoice_number}`;
    window.open(viewUrl, '_blank');
  };

  const handleDownloadInvoice = (invoice: any) => {
    toast.info("Download functionality coming soon");
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: "Draft", variant: "secondary" as const },
      sent: { label: "Sent", variant: "default" as const },
      paid: { label: "Paid", variant: "success" as const },
      partial: { label: "Partial", variant: "warning" as const },
      overdue: { label: "Overdue", variant: "destructive" as const },
      cancelled: { label: "Cancelled", variant: "secondary" as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const canAcceptPayment = (invoice: any) => {
    const status = invoice.status?.toLowerCase();
    return status === 'sent' || status === 'partial' || status === 'overdue';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Get approved estimates that can be converted to invoices
  const convertibleEstimates = estimates?.filter(est => 
    est.status === 'approved' && 
    !invoices?.some(inv => inv.estimate_id === est.id)
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
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No invoices yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first invoice or convert an approved estimate
              </p>
              <Button onClick={handleCreateInvoice}>
                <Plus className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
            </CardContent>
          </Card>
        ) : (
          invoices.map((invoice) => (
            <Card key={invoice.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold">Invoice #{invoice.invoice_number}</h4>
                      {getStatusBadge(invoice.status)}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Total</p>
                        <p className="font-medium">{formatCurrency(invoice.total)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Balance</p>
                        <p className="font-medium">
                          {formatCurrency(invoice.balance || (invoice.total - (invoice.amount_paid || 0)))}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Issue Date</p>
                        <p>{new Date(invoice.issue_date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Due Date</p>
                        <p>{new Date(invoice.due_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewInvoice(invoice)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditInvoice(invoice)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSendInvoice(invoice)}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send
                    </Button>
                    
                    {canAcceptPayment(invoice) && (
                      <Button
                        size="sm"
                        onClick={() => handlePayInvoice(invoice)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Pay
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadInvoice(invoice)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
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
        onInvoiceCreated={refetch}
      />

      {selectedInvoice && (
        <>
          <InvoiceSendDialog
            open={showSendDialog}
            onOpenChange={setShowSendDialog}
            onSave={async () => true}
            onAddWarranty={() => {}}
            clientInfo={{}}
            invoiceNumber={selectedInvoice.invoice_number}
            jobId={jobId}
          />

          <InvoicePaymentDialog
            isOpen={showPaymentDialog}
            onClose={() => setShowPaymentDialog(false)}
            invoice={selectedInvoice}
            jobId={jobId}
            onPaymentAdded={() => {
              refetch();
              setShowPaymentDialog(false);
            }}
          />
        </>
      )}
    </div>
  );
};
