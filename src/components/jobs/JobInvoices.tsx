
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, FileText, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UpsellDialog } from "@/components/jobs/dialogs/UpsellDialog";
import { InvoiceBuilderDialog } from "@/components/jobs/dialogs/InvoiceBuilderDialog";
import { toast } from "sonner";
import { Product } from "./builder/types";

interface JobInvoicesProps {
  jobId: string;
}

export const JobInvoices = ({ jobId }: JobInvoicesProps) => {
  const [isUpsellDialogOpen, setIsUpsellDialogOpen] = useState(false);
  const [isInvoiceBuilderOpen, setIsInvoiceBuilderOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [recommendedProduct, setRecommendedProduct] = useState<Product | null>(null);
  const [techniciansNote, setTechniciansNote] = useState("");
  
  // In a real app, this would be fetched from an API
  const [invoices, setInvoices] = useState([
    {
      id: "inv-001",
      number: "INV-12345",
      date: "2023-05-15",
      amount: 475.99,
      status: "paid",
      viewed: true,
      recommendedProduct: null,
      techniciansNote: ""
    },
    {
      id: "inv-002",
      number: "INV-12346",
      date: "2023-05-10",
      amount: 299.50,
      status: "unpaid",
      viewed: false,
      recommendedProduct: {
        id: "prod-3",
        name: "6-Month Extended Warranty",
        description: "Protect your appliance from unexpected repair costs. 94% of customers opt in for peace of mind.",
        price: 49,
        category: "Warranties",
        tags: ["warranty"],
      },
      techniciansNote: "This warranty would be a great addition for your new system."
    }
  ]);

  const handleCreateInvoice = () => {
    setSelectedInvoiceId(null);
    setIsInvoiceBuilderOpen(true);
  };

  const handleEditInvoice = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
    setIsInvoiceBuilderOpen(true);
  };

  const handleViewInvoice = (invoice: any) => {
    if (!invoice.viewed && invoice.recommendedProduct) {
      // Show upsell dialog when invoice is viewed the first time
      setRecommendedProduct(invoice.recommendedProduct);
      setTechniciansNote(invoice.techniciansNote);
      setIsUpsellDialogOpen(true);
      
      // Mark as viewed
      setInvoices(invoices.map(e => 
        e.id === invoice.id ? {...e, viewed: true} : e
      ));
    } else {
      // Just view the invoice
      handleEditInvoice(invoice.id);
    }
  };

  const handleSendInvoice = (invoiceId: string) => {
    // In a real app, this would send the invoice via email or other notification
    setInvoices(invoices.map(e => 
      e.id === invoiceId ? {...e, status: "sent"} : e
    ));
    toast.success("Invoice sent to customer");
  };

  const handleUpsellAccept = (product: Product) => {
    toast.success(`${product.name} added to the invoice`);
    // In a real app, this would update the invoice with the added product
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
                        onClick={() => handleViewInvoice(invoice)}
                      >
                        <FileText size={16} />
                      </Button>
                      {invoice.status === "unpaid" && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleSendInvoice(invoice.id)}
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
          recommendedProduct={recommendedProduct}
          techniciansNote={techniciansNote}
          onAccept={handleUpsellAccept}
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
