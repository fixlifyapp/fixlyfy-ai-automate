
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, FileText, Send, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { InvoiceCreationDialog } from "./dialogs/InvoiceCreationDialog";

interface JobInvoicesProps {
  jobId: string;
}

interface InvoiceItem {
  name: string;
  description: string;
  price: number;
  quantity: number;
  taxable: boolean;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  status: "draft" | "sent" | "paid" | "overdue";
  jobId: string;
}

export const JobInvoices = ({ jobId }: JobInvoicesProps) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isViewingInvoice, setIsViewingInvoice] = useState(false);
  
  // Load existing invoices - in a real app, this would come from your database
  useEffect(() => {
    // Mock data - in a real app, you would fetch this from your backend
    const mockInvoices: Invoice[] = [
      {
        id: "inv-1001",
        invoiceNumber: "INV-5432",
        date: "2025-05-10",
        dueDate: "2025-06-09",
        items: [
          {
            name: "Labor - Standard Rate",
            description: "Standard labor rate per hour",
            price: 95,
            quantity: 3,
            taxable: true,
          },
          {
            name: "HVAC Filter Replacement",
            description: "High-quality air filter replacement",
            price: 45,
            quantity: 1,
            taxable: true,
          }
        ],
        subtotal: 330,
        tax: 42.9,
        total: 372.9,
        status: "sent",
        jobId: "JOB-1001",
      }
    ];
    
    setInvoices(mockInvoices);
  }, [jobId]);

  const handleCreateInvoice = () => {
    setIsCreateDialogOpen(true);
  };

  const handleSaveInvoice = (invoice: Invoice) => {
    setInvoices([...invoices, invoice]);
    setIsCreateDialogOpen(false);
  };

  const handleSendInvoice = (invoiceId: string) => {
    setInvoices(
      invoices.map((invoice) =>
        invoice.id === invoiceId
          ? { ...invoice, status: "sent" as const }
          : invoice
      )
    );
    toast.success("Invoice sent to customer");
  };

  const handleMarkAsPaid = (invoiceId: string) => {
    setInvoices(
      invoices.map((invoice) =>
        invoice.id === invoiceId
          ? { ...invoice, status: "paid" as const }
          : invoice
      )
    );
    toast.success("Invoice marked as paid");
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

  const viewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsViewingInvoice(true);
  };

  return (
    <Card className="border-fixlyfy-border shadow-sm">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium">Invoices</h3>
          <Button onClick={handleCreateInvoice} className="gap-2">
            <PlusCircle size={16} />
            New Invoice
          </Button>
        </div>

        {invoices.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                  <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>${invoice.total.toFixed(2)}</TableCell>
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
                        variant="ghost" 
                        size="sm"
                        onClick={() => viewInvoice(invoice)}
                      >
                        <FileText size={16} />
                      </Button>
                      {invoice.status === "draft" && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleSendInvoice(invoice.id)}
                        >
                          <Send size={16} />
                        </Button>
                      )}
                      {invoice.status === "sent" && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleMarkAsPaid(invoice.id)}
                        >
                          <Check size={16} />
                        </Button>
                      )}
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
        
        <InvoiceCreationDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          jobId={jobId}
          onSave={handleSaveInvoice}
        />
      </CardContent>
    </Card>
  );
};
