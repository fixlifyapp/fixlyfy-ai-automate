
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "@/components/ui/sonner";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InvoiceDialog } from "./dialogs/InvoiceDialog";
import { recordInvoiceCreated } from "@/services/jobHistoryService";
import { useRBAC } from "@/components/auth/RBACProvider";

interface JobInvoicesProps {
  jobId: string;
}

type Invoice = {
  id: string;
  invoice_number: string;
  created_at: string;
  total: number;
  amount_paid: number;
  balance: number;
  status: string;
  notes?: string;
};

export const JobInvoices = ({ jobId }: JobInvoicesProps) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("credit-card");
  const [paymentDate, setPaymentDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [isEditMode, setIsEditMode] = useState(false);
  const { currentUser } = useRBAC();
  
  // Mock data for client and company info
  const clientInfo = {
    name: "Client Name",
    address: "123 Client St",
    phone: "123-456-7890",
    email: "client@example.com"
  };
  
  const companyInfo = {
    name: "Your Company",
    logo: "/placeholder.svg",
    address: "123 Business Ave",
    phone: "555-555-5555",
    email: "company@example.com",
    legalText: "Terms and conditions apply."
  };
  
  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("job_id", jobId)
        .order("created_at", { ascending: false });
        
      if (error) {
        throw error;
      }
      
      setInvoices(data || []);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      // Toast is silenced by our implementation
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchInvoices();
  }, [jobId]);
  
  const handleDeleteInvoice = async (invoiceId: string) => {
    try {
      const { error } = await supabase
        .from("invoices")
        .delete()
        .eq("id", invoiceId);
        
      if (error) {
        throw error;
      }
      
      setInvoices(invoices.filter(inv => inv.id !== invoiceId));
      toast.success("Invoice deleted successfully");
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast.error("Failed to delete invoice");
    }
  };
  
  const handleEditInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsEditMode(true);
    setIsInvoiceDialogOpen(true);
  };
  
  const handleNewInvoice = () => {
    setSelectedInvoice(null);
    setIsEditMode(false);
    setIsInvoiceDialogOpen(true);
  };
  
  const openPaymentDialog = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPaymentAmount(invoice.balance.toString());
    setIsPaymentDialogOpen(true);
  };
  
  const handleRecordPayment = async () => {
    if (!selectedInvoice) return;
    
    try {
      const amount = parseFloat(paymentAmount);
      
      if (isNaN(amount) || amount <= 0) {
        toast.error("Please enter a valid payment amount");
        return;
      }
      
      // Record payment directly in the payments table
      const { error: paymentError } = await supabase
        .from("payments")
        .insert({
          invoice_id: selectedInvoice.id,
          amount,
          method: paymentMethod,
          date: new Date(paymentDate).toISOString()
        });
        
      if (paymentError) {
        throw paymentError;
      }
      
      // Update invoice
      const newAmountPaid = selectedInvoice.amount_paid + amount;
      const newBalance = Math.max(0, selectedInvoice.total - newAmountPaid);
      let newStatus = "unpaid";
      
      if (newBalance === 0) {
        newStatus = "paid";
      } else if (newAmountPaid > 0) {
        newStatus = "partial";
      }
      
      const { error: updateError } = await supabase
        .from("invoices")
        .update({
          amount_paid: newAmountPaid,
          balance: newBalance,
          status: newStatus
        })
        .eq("id", selectedInvoice.id);
        
      if (updateError) {
        throw updateError;
      }
      
      toast.success("Payment recorded successfully");
      setIsPaymentDialogOpen(false);
      fetchInvoices();
    } catch (error) {
      console.error("Error recording payment:", error);
      toast.error("Failed to record payment");
    }
  };

  const handleInvoiceCreated = async (amount: number, invoiceNumber?: string) => {
    fetchInvoices();
    
    // Record in job history
    if (invoiceNumber) {
      await recordInvoiceCreated(
        jobId,
        invoiceNumber,
        amount,
        currentUser?.name,
        currentUser?.id
      );
    }
  };

  // Function to render status badge with appropriate color
  const renderStatusBadge = (status: string) => {
    let color = "";
    
    switch (status.toLowerCase()) {
      case "paid":
        color = "bg-green-100 text-green-800";
        break;
      case "partial":
        color = "bg-yellow-100 text-yellow-800";
        break;
      case "unpaid":
        color = "bg-red-100 text-red-800";
        break;
      default:
        color = "bg-gray-200";
    }
    
    return (
      <Badge className={color}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };
  
  return (
    <Card className="border-fixlyfy-border shadow-sm">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium">Invoices</h3>
          <Button className="gap-2" onClick={handleNewInvoice}>
            <PlusCircle size={16} />
            New Invoice
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-fixlyfy border-t-transparent rounded-full"></div>
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p>No invoices found for this job.</p>
            <p className="mt-2">Create your first invoice or convert an estimate to invoice.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div 
                key={invoice.id} 
                className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium">{invoice.invoice_number}</h4>
                    {renderStatusBadge(invoice.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Created on {format(new Date(invoice.created_at), 'MMM dd, yyyy')}
                  </p>
                </div>
                
                <div className="space-y-1 text-right">
                  <div className="text-lg font-semibold">
                    ${invoice.total.toFixed(2)}
                  </div>
                  {invoice.amount_paid > 0 && (
                    <p className="text-sm text-green-600">
                      Paid: ${invoice.amount_paid.toFixed(2)}
                    </p>
                  )}
                  {invoice.balance > 0 && (
                    <p className="text-sm text-red-600">
                      Balance: ${invoice.balance.toFixed(2)}
                    </p>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2 md:justify-end">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditInvoice(invoice)}
                  >
                    <Edit size={16} className="mr-2" />
                    Edit
                  </Button>
                  
                  {invoice.status !== 'paid' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-green-600 hover:bg-green-50"
                      onClick={() => openPaymentDialog(invoice)}
                    >
                      <CreditCard size={16} className="mr-2" />
                      Record Payment
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => handleDeleteInvoice(invoice.id)}
                  >
                    <Trash size={16} className="mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Payment Dialog */}
        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="invoice-number">Invoice</Label>
                <Input
                  id="invoice-number"
                  value={selectedInvoice?.invoice_number || ""}
                  readOnly
                  className="bg-muted"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="payment-amount">Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                  <Input
                    id="payment-amount"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="pl-8"
                    placeholder="0.00"
                    type="number"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="payment-method">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger id="payment-method">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit-card">Credit Card</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="payment-date">Date</Label>
                <Input
                  id="payment-date"
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleRecordPayment}>
                Record Payment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Invoice Dialog */}
        <InvoiceDialog 
          open={isInvoiceDialogOpen}
          onOpenChange={setIsInvoiceDialogOpen}
          onInvoiceCreated={handleInvoiceCreated}
          clientInfo={clientInfo}
          companyInfo={companyInfo}
          editInvoice={isEditMode ? selectedInvoice : undefined}
          jobId={jobId}
        />
      </CardContent>
    </Card>
  );
};
