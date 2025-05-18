
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, FileText, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UpsellDialog } from "@/components/jobs/dialogs/UpsellDialog";
import { InvoiceBuilderDialog } from "@/components/jobs/dialogs/InvoiceBuilderDialog";

interface JobInvoicesProps {
  jobId: string;
}

export const JobInvoices = ({ jobId }: JobInvoicesProps) => {
  const [isUpsellDialogOpen, setIsUpsellDialogOpen] = useState(false);
  const [isInvoiceBuilderOpen, setIsInvoiceBuilderOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  
  // In a real app, this would be fetched from an API
  const invoices = [
    {
      id: "inv-001",
      number: "INV-12345",
      date: "2023-05-15",
      amount: 475.99,
      status: "paid"
    },
    {
      id: "inv-002",
      number: "INV-12346",
      date: "2023-05-10",
      amount: 299.50,
      status: "unpaid"
    }
  ];

  const handleCreateInvoice = () => {
    setIsInvoiceBuilderOpen(true);
    // Show upsell dialog when creating a new invoice
    setIsUpsellDialogOpen(true);
  };

  const handleEditInvoice = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
    setIsInvoiceBuilderOpen(true);
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
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.number}</TableCell>
                  <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                  <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={
                        invoice.status === "paid" 
                          ? "bg-fixlyfy-success/10 text-fixlyfy-success border-fixlyfy-success/20" 
                          : "bg-fixlyfy-warning/10 text-fixlyfy-warning border-fixlyfy-warning/20"
                      }
                    >
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditInvoice(invoice.id)}
                      >
                        <FileText size={16} />
                      </Button>
                      {invoice.status === "unpaid" && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                        >
                          <Send size={16} />
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
        
        <UpsellDialog 
          open={isUpsellDialogOpen} 
          onOpenChange={setIsUpsellDialogOpen}
          jobId={jobId}
        />

        <InvoiceBuilderDialog
          open={isInvoiceBuilderOpen}
          onOpenChange={setIsInvoiceBuilderOpen}
          invoiceId={selectedInvoiceId}
          jobId={jobId}
        />
      </CardContent>
    </Card>
  );
};
