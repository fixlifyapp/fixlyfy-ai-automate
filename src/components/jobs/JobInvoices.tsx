
import { Card, CardContent } from "@/components/ui/card";
import { useInvoices } from "@/hooks/useInvoices";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Pencil, Trash2, Send, Check, Plus } from "lucide-react";
import { toast } from "sonner";
import { DeleteConfirmDialog } from "./dialogs/DeleteConfirmDialog";
import { EstimateBuilderDialog } from "./dialogs/estimate-builder/EstimateBuilderDialog";
import { InvoiceDialog } from "./dialogs/InvoiceDialog";

interface JobInvoicesProps {
  jobId: string;
}

export const JobInvoices = ({ jobId }: JobInvoicesProps) => {
  const { invoices, isLoading, createInvoiceFromEstimate, updateInvoiceStatus, refreshInvoices } = useInvoices(jobId);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isInvoiceBuilderOpen, setIsInvoiceBuilderOpen] = useState(false);

  const handleCreateInvoice = () => {
    setIsInvoiceDialogOpen(true);
  };

  const handleSendInvoice = async (invoiceId: string) => {
    const success = await updateInvoiceStatus(invoiceId, 'sent');
    if (success) {
      toast.success("Invoice sent to customer");
    }
  };

  const handleMarkAsPaid = async (invoiceId: string) => {
    const success = await updateInvoiceStatus(invoiceId, 'paid');
    if (success) {
      toast.success("Invoice marked as paid");
    }
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteInvoice = async () => {
    if (!selectedInvoiceId) return;
    
    setIsDeleting(true);
    try {
      // In a real app, this would call an API to delete the invoice
      // For now, we'll just simulate success
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success("Invoice deleted successfully");
      refreshInvoices();
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast.error("Failed to delete invoice");
    } finally {
      setIsDeleting(false);
      setIsDeleteConfirmOpen(false);
    }
  };

  const handleInvoiceCreated = (amount: number) => {
    // Refresh invoices after a new one is created
    refreshInvoices();
    toast.success(`Invoice created successfully`);
  };

  const handleEditInvoice = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
    setIsInvoiceBuilderOpen(true);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-fixlyfy-success/10 text-fixlyfy-success border-fixlyfy-success/20";
      case "sent":
        return "bg-fixlyfy-warning/10 text-fixlyfy-warning border-fixlyfy-warning/20";
      case "overdue":
        return "bg-fixlyfy-danger/10 text-fixlyfy-danger border-fixlyfy-danger/20";
      default:
        return "bg-fixlyfy-muted/10 text-fixlyfy-muted border-fixlyfy-muted/20";
    }
  };

  // Calculate balance for an invoice (total - payments)
  const calculateBalance = (invoice: any) => {
    // This would be more complex in a real app with actual payment tracking
    // For now, we'll just return the total if not paid
    return invoice.status === 'paid' ? 0 : invoice.total;
  };

  return (
    <Card className="border-fixlyfy-border shadow-sm">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium">Invoices</h3>
          <Button onClick={handleCreateInvoice} className="gap-2">
            <Plus size={16} />
            New Invoice
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading invoices...</div>
        ) : invoices.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.number}</TableCell>
                  <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                  <TableCell>${invoice.total.toFixed(2)}</TableCell>
                  <TableCell className={calculateBalance(invoice) > 0 ? "text-orange-500" : "text-green-500"}>
                    ${calculateBalance(invoice).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={getStatusBadgeVariant(invoice.status)}
                    >
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditInvoice(invoice.id)}
                        className="text-xs flex items-center gap-1"
                      >
                        <Pencil size={14} />
                        Edit
                      </Button>
                      {invoice.status === "draft" && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleSendInvoice(invoice.id)}
                          className="text-xs flex items-center gap-1"
                        >
                          <Send size={14} />
                          Send
                        </Button>
                      )}
                      {invoice.status === "sent" && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleMarkAsPaid(invoice.id)}
                          className="text-xs flex items-center gap-1"
                        >
                          <Check size={14} />
                          Mark Paid
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteInvoice(invoice.id)}
                        className="text-xs text-fixlyfy-error"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No invoices yet. Create your first invoice.</p>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmDialog 
          open={isDeleteConfirmOpen}
          onOpenChange={setIsDeleteConfirmOpen}
          title="Delete Invoice"
          description="Are you sure you want to delete this invoice? This action cannot be undone."
          onConfirm={confirmDeleteInvoice}
          isDeleting={isDeleting}
        />

        {/* Invoice Creation Dialog */}
        <InvoiceDialog
          open={isInvoiceDialogOpen}
          onOpenChange={setIsInvoiceDialogOpen}
          onInvoiceCreated={handleInvoiceCreated}
          clientInfo={{
            name: "Client Name", // This would come from job data in a real app
            address: "123 Client St",
            phone: "(555) 555-5555",
            email: "client@example.com"
          }}
          companyInfo={{
            name: "Your Company", // This would come from company settings in a real app
            logo: "",
            address: "456 Company Ave",
            phone: "(555) 123-4567",
            email: "company@example.com",
            legalText: "Standard terms and conditions apply."
          }}
        />

        {/* Invoice Editor Dialog */}
        <EstimateBuilderDialog
          open={isInvoiceBuilderOpen}
          onOpenChange={setIsInvoiceBuilderOpen}
          estimateId={selectedInvoiceId}
          jobId={jobId}
        />
      </CardContent>
    </Card>
  );
};
