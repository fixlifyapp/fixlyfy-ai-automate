
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, FileText, Send, Check, Plus, RefreshCw, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { InvoiceCreationDialog } from "./dialogs/InvoiceCreationDialog";
import { InvoiceBuilderDialog } from "./dialogs/InvoiceBuilderDialog";
import { Payment } from "@/types/payment";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Product } from "./builder/types";
import { DeleteConfirmDialog } from "./dialogs/DeleteConfirmDialog";
import { LineItem } from "./builder/types";

interface JobInvoicesProps {
  jobId: string;
}

// Modified InvoiceItem to extend Product and match the interface in InvoiceCreationDialog
interface InvoiceItem extends Product {
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
  payments: Payment[];
}

export const JobInvoices = ({ jobId }: JobInvoicesProps) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isViewingInvoice, setIsViewingInvoice] = useState(false);
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [isEditingInvoice, setIsEditingInvoice] = useState(false);
  const [isDeletingInvoice, setIsDeletingInvoice] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>("credit-card");
  const [estimateItems, setEstimateItems] = useState<LineItem[]>([]);
  const [hasEstimate, setHasEstimate] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Load existing invoices and estimates - in a real app, this would come from your database
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
            id: "item-1", // Added required property
            name: "Labor - Standard Rate",
            description: "Standard labor rate per hour",
            price: 95,
            quantity: 3,
            taxable: true,
            category: "Labor", // Added required property
            tags: ["service", "labor"] // Added required property
          },
          {
            id: "item-2", // Added required property
            name: "HVAC Filter Replacement",
            description: "High-quality air filter replacement",
            price: 45,
            quantity: 1,
            taxable: true,
            category: "Parts", // Added required property
            tags: ["hvac", "filter"] // Added required property
          }
        ],
        subtotal: 330,
        tax: 42.9,
        total: 372.9,
        status: "sent",
        jobId: "JOB-1001",
        payments: [
          {
            id: "payment-1",
            date: new Date().toISOString(),
            clientId: "client-123",
            clientName: "Michael Johnson",
            jobId: "JOB-1001",
            amount: 100,
            method: "credit-card",
            status: "paid"
          },
          {
            id: "payment-2",
            date: new Date().toISOString(),
            clientId: "client-123",
            clientName: "Michael Johnson",
            jobId: "JOB-1001",
            amount: 50,
            method: "credit-card",
            status: "paid"
          }
        ]
      }
    ];
    
    setInvoices(mockInvoices);
    
    // Mock estimate items - Add required properties to each item
    const mockEstimateItems: LineItem[] = [
      {
        id: "estimate-item-1",
        description: "Diagnostic Service",
        quantity: 1,
        unitPrice: 120,
        discount: 0,
        tax: 10,
        total: 120,
        ourPrice: 75,
        taxable: true
      },
      {
        id: "estimate-item-2",
        description: "HVAC Annual Maintenance",
        quantity: 1,
        unitPrice: 250,
        discount: 0,
        tax: 10,
        total: 250,
        ourPrice: 140,
        taxable: true
      }
    ];
    
    setEstimateItems(mockEstimateItems);
    setHasEstimate(true);
  }, [jobId]);

  const handleCreateInvoice = () => {
    setSelectedInvoice(null);
    setIsCreateDialogOpen(true);
  };
  
  const handleEditInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsEditingInvoice(true);
    setIsCreateDialogOpen(true);
  };

  const handleSaveInvoice = (invoice: Invoice) => {
    if (selectedInvoice) {
      // Update existing invoice
      setInvoices(
        invoices.map((inv) => (inv.id === selectedInvoice.id ? invoice : inv))
      );
    } else {
      // Add new invoice
      setInvoices([...invoices, {...invoice, payments: []}]);
    }
    setIsCreateDialogOpen(false);
    setIsEditingInvoice(false);
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
  
  const handleSyncFromEstimate = () => {
    toast.success("Estimate synchronized to invoice");
  };

  // Calculate balance for an invoice (total - sum of payments)
  const calculateBalance = (invoice: Invoice) => {
    const paymentsTotal = invoice.payments ? invoice.payments.reduce((sum, payment) => sum + payment.amount, 0) : 0;
    return invoice.total - paymentsTotal;
  };

  const handleAddPayment = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPaymentAmount(calculateBalance(invoice));
    setPaymentMethod("credit-card");
    setIsAddingPayment(true);
  };
  
  const handleSavePayment = () => {
    if (!selectedInvoice || paymentAmount <= 0) return;
    
    const newPayment: Payment = {
      id: `payment-${Date.now()}`,
      date: new Date().toISOString(),
      clientId: "client-123",
      clientName: "Michael Johnson",
      jobId,
      amount: paymentAmount,
      method: paymentMethod as any,
      status: "paid",
    };
    
    setInvoices(
      invoices.map((invoice) =>
        invoice.id === selectedInvoice.id
          ? { ...invoice, payments: [...invoice.payments, newPayment] }
          : invoice
      )
    );
    
    setIsAddingPayment(false);
    toast.success(`Payment of $${paymentAmount} added successfully`);
    
    // If payment covers the full balance, mark invoice as paid
    if (paymentAmount >= calculateBalance(selectedInvoice)) {
      setInvoices(
        invoices.map((invoice) =>
          invoice.id === selectedInvoice.id
            ? { ...invoice, status: "paid" as const }
            : invoice
        )
      );
    }
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

  // New function to handle invoice deletion
  const handleDeleteInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteInvoice = async () => {
    if (!selectedInvoice) return;
    
    setIsDeleting(true);
    
    try {
      // In a real app, this would be an actual API call
      // await fetch(`/api/invoices/${selectedInvoice.id}`, {
      //   method: 'DELETE',
      // });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Remove invoice from local state
      setInvoices(invoices.filter(invoice => invoice.id !== selectedInvoice.id));
      toast.success("Invoice deleted successfully");
    } catch (error) {
      console.error("Failed to delete invoice:", error);
      toast.error("Failed to delete invoice");
    } finally {
      setIsDeleting(false);
      setIsDeleteConfirmOpen(false);
    }
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
                <TableHead>Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
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
                        onClick={() => handleEditInvoice(invoice)}
                        className="text-xs"
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleAddPayment(invoice)}
                        className="text-xs"
                        disabled={calculateBalance(invoice) <= 0}
                      >
                        Add Payment
                      </Button>
                      {invoice.status === "draft" && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleSendInvoice(invoice.id)}
                          className="text-xs"
                        >
                          Send
                        </Button>
                      )}
                      {invoice.status === "sent" && calculateBalance(invoice) > 0 && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleMarkAsPaid(invoice.id)}
                          className="text-xs"
                        >
                          Mark Paid
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteInvoice(invoice)}
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
        
        <InvoiceBuilderDialog 
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          invoiceId={selectedInvoice?.id || null}
          jobId={jobId}
          estimateItems={estimateItems}
          onSyncFromEstimate={handleSyncFromEstimate}
        />
        
        {/* Add Payment Dialog */}
        <Dialog open={isAddingPayment} onOpenChange={setIsAddingPayment}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Payment</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Amount
                </Label>
                <div className="col-span-3 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                  <Input
                    id="amount"
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                    className="pl-7"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="method" className="text-right">
                  Method
                </Label>
                <select 
                  id="method"
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="credit-card">Credit Card</option>
                  <option value="cash">Cash</option>
                  <option value="e-transfer">E-Transfer</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingPayment(false)}>Cancel</Button>
              <Button onClick={handleSavePayment}>Save Payment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
          <DeleteConfirmDialog 
            title="Delete Invoice"
            description={`Are you sure you want to delete invoice ${selectedInvoice?.invoiceNumber}? This action cannot be undone.`}
            onOpenChange={setIsDeleteConfirmOpen}
            onConfirm={confirmDeleteInvoice}
            isDeleting={isDeleting}
          />
        </Dialog>
      </CardContent>
    </Card>
  );
};
