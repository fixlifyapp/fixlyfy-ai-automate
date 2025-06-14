import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Send, Edit, CreditCard, Eye, FileText, Download } from "lucide-react";
import { useInvoices } from "@/hooks/useInvoices";
import { useEstimates } from "@/hooks/useEstimates";
import { SteppedInvoiceBuilder } from "../dialogs/SteppedInvoiceBuilder";
import { UniversalSendDialog } from "../dialogs/shared/UniversalSendDialog";
import { InvoicePaymentDialog } from "../dialogs/invoice-builder/InvoicePaymentDialog";
import { InvoicePreviewWindow } from "../dialogs/InvoicePreviewWindow";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useJobData } from "../dialogs/unified/hooks/useJobData";

interface ModernJobInvoicesTabProps {
  jobId: string;
}

export const ModernJobInvoicesTab = ({ jobId }: ModernJobInvoicesTabProps) => {
  const { invoices, isLoading, refreshInvoices } = useInvoices(jobId);
  const { estimates } = useEstimates(jobId);
  const { clientInfo, loading: jobDataLoading } = useJobData(jobId);
  const [showInvoiceBuilder, setShowInvoiceBuilder] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showPreviewWindow, setShowPreviewWindow] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [selectedEstimate, setSelectedEstimate] = useState<any>(null);
  const isMobile = useIsMobile();

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

  const handleSendSuccess = () => {
    setShowSendDialog(false);
    setSelectedInvoice(null);
    refreshInvoices();
    toast.success("Invoice sent successfully!");
  };

  const handleSendCancel = () => {
    setShowSendDialog(false);
    setSelectedInvoice(null);
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

  if (isLoading) {
    return (
      <div className="space-y-4 px-2 sm:px-0">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse border-fixlyfy-border">
            <CardContent className="p-3 sm:p-6">
              <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const convertibleEstimates = estimates?.filter(est => 
    est.status === 'approved' && 
    !invoices?.some(inv => inv.job_id === est.job_id)
  ) || [];

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Header with Create Button */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-semibold">Invoices</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage invoices and payments for this job
          </p>
        </div>
        <Button 
          onClick={handleCreateInvoice}
          className={`w-full sm:w-auto ${isMobile ? 'h-11' : ''}`}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      {/* Convert Estimates Section */}
      {convertibleEstimates.length > 0 && (
        <Card className="border-fixlyfy-border shadow-sm">
          <CardHeader className="px-3 pt-3 pb-3 sm:px-6 sm:pt-6 sm:pb-6">
            <CardTitle className="text-sm sm:text-base">Convert Estimates to Invoices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-3 pb-3 sm:px-6 sm:pb-6">
            {convertibleEstimates.map((estimate) => (
              <div key={estimate.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm sm:text-base break-all">Estimate #{estimate.estimate_number}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {formatCurrency(estimate.total)} • Approved
                  </p>
                </div>
                <Button
                  size={isMobile ? "default" : "sm"}
                  className={`${isMobile ? 'w-full h-11' : ''}`}
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
      <div className="space-y-3 sm:space-y-4">
        {(!invoices || invoices.length === 0) ? (
          <Card className="border-fixlyfy-border shadow-sm">
            <CardContent className="p-6 sm:p-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-medium mb-2">No invoices yet</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                Create your first invoice or convert an approved estimate
              </p>
              <Button 
                onClick={handleCreateInvoice}
                className={`${isMobile ? 'w-full h-11' : ''}`}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
            </CardContent>
          </Card>
        ) : (
          invoices.map((invoice) => (
            <Card key={invoice.id} className="hover:shadow-md transition-shadow border-fixlyfy-border">
              <CardContent className="p-3 sm:p-6">
                <div className="flex flex-col gap-4">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                      <h4 className="font-semibold text-sm sm:text-base break-all">Invoice #{invoice.invoice_number}</h4>
                      {getStatusBadge(invoice.status)}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                      <div>
                        <p className="text-muted-foreground">Total</p>
                        <p className="font-medium break-all">{formatCurrency(invoice.total)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Balance</p>
                        <p className="font-medium break-all">
                          {formatCurrency(invoice.balance || (invoice.total - (invoice.amount_paid || 0)))}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Date</p>
                        <p>{new Date(invoice.date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Due Date</p>
                        <p>{invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'Not set'}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className={`flex ${isMobile ? 'flex-col gap-2' : 'flex-wrap gap-2'}`}>
                    <Button
                      variant="outline"
                      size={isMobile ? "default" : "sm"}
                      className={`${isMobile ? 'w-full h-11 justify-start' : ''}`}
                      onClick={() => handleViewInvoice(invoice)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    
                    <Button
                      variant="outline"
                      size={isMobile ? "default" : "sm"}
                      className={`${isMobile ? 'w-full h-11 justify-start' : ''}`}
                      onClick={() => handleEditInvoice(invoice)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    
                    <Button
                      variant="outline"
                      size={isMobile ? "default" : "sm"}
                      className={`${isMobile ? 'w-full h-11 justify-start' : ''}`}
                      onClick={() => handleSendInvoice(invoice)}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send
                    </Button>
                    
                    {canAcceptPayment(invoice) && (
                      <Button
                        size={isMobile ? "default" : "sm"}
                        className={`${isMobile ? 'w-full h-11 justify-start' : ''} bg-green-600 hover:bg-green-700`}
                        onClick={() => handlePayInvoice(invoice)}
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Pay
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size={isMobile ? "default" : "sm"}
                      className={`${isMobile ? 'w-full h-11 justify-start' : ''}`}
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
        onInvoiceCreated={refreshInvoices}
      />

      {selectedInvoice && (
        <>
          <UniversalSendDialog
            isOpen={showSendDialog}
            onClose={handleSendCancel}
            documentType="invoice"
            documentId={selectedInvoice.id}
            documentNumber={selectedInvoice.invoice_number}
            total={selectedInvoice.total || 0}
            contactInfo={{
              name: clientInfo?.name || 'Client',
              email: clientInfo?.email || '',
              phone: clientInfo?.phone || ''
            }}
            onSuccess={handleSendSuccess}
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
