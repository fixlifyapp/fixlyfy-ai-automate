
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PaymentDialog } from "./dialogs/PaymentDialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CreditCard, DollarSign, Ban, FileText, Trash2 } from "lucide-react";
import { Payment, PaymentMethod } from "@/types/payment";
import { payments as samplePayments } from "@/data/payments";
import { formatDistanceToNow } from "date-fns";
import { DeleteConfirmDialog } from "./dialogs/DeleteConfirmDialog";
import { Dialog } from "@/components/ui/dialog";
import { toast } from "sonner";

interface JobPaymentsProps {
  jobId: string;
}

export const JobPayments = ({ jobId }: JobPaymentsProps) => {
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [balance, setBalance] = useState(475.99);
  const [invoiceAmount] = useState(475.99);
  const [payments, setPayments] = useState<Payment[]>(
    // Filter sample payments to only show those for this job
    samplePayments.filter(payment => payment.jobId === jobId)
  );
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const getMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case "credit-card":
        return <CreditCard size={16} className="text-blue-500" />;
      case "cash":
        return <DollarSign size={16} className="text-green-500" />;
      case "e-transfer":
        return <Ban size={16} className="text-purple-500" />; // Changed from Bank to Ban
      case "cheque":
        return <FileText size={16} className="text-orange-500" />;
      default:
        return <CreditCard size={16} />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      paid: "bg-green-50 text-green-700 border-green-200",
      refunded: "bg-amber-50 text-amber-700 border-amber-200",
      disputed: "bg-red-50 text-red-700 border-red-200"
    };
    
    return (
      <Badge 
        variant="outline" 
        className={statusStyles[status as keyof typeof statusStyles] || ""}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handlePaymentProcessed = (amount: number) => {
    // Create a new payment record
    const newPayment: Payment = {
      id: `payment-${Date.now()}`,
      date: new Date().toISOString(),
      clientId: "client-123", // This would come from the job data in a real app
      clientName: "Michael Johnson", // This would come from the job data in a real app
      jobId: jobId,
      amount: amount,
      method: "credit-card", // This comes from the dialog in a real implementation
      status: "paid",
      reference: `txn-${Date.now()}`,
    };
    
    // Add the new payment to the list
    setPayments([newPayment, ...payments]);
    
    // Update the balance
    setBalance(prevBalance => prevBalance - amount);
  };

  const handleDeletePayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeletePayment = async () => {
    if (!selectedPayment) return;
    
    setIsDeleting(true);
    
    try {
      // In a real app, this would be an actual API call
      // await fetch(`/api/payments/${selectedPayment.id}`, {
      //   method: 'DELETE',
      // });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Recalculate balance if the deleted payment was a 'paid' payment
      if (selectedPayment.status === "paid") {
        setBalance(prevBalance => prevBalance + selectedPayment.amount);
      }
      
      // Remove payment from local state
      setPayments(payments.filter(p => p.id !== selectedPayment.id));
      toast.success("Payment deleted successfully");
    } catch (error) {
      console.error("Failed to delete payment:", error);
      toast.error("Failed to delete payment");
    } finally {
      setIsDeleting(false);
      setIsDeleteConfirmOpen(false);
    }
  };

  // Calculate remaining balance
  const totalPaid = payments.reduce((total, payment) => {
    if (payment.status === "paid") {
      return total + payment.amount;
    }
    return total;
  }, 0);
  
  const remainingBalance = invoiceAmount - totalPaid;

  return (
    <Card className="border-fixlyfy-border shadow-sm">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-medium">Payments</h3>
            <div className="text-sm text-muted-foreground mt-1">
              <span className="font-medium">${totalPaid.toFixed(2)}</span> paid of <span className="font-medium">${invoiceAmount.toFixed(2)}</span>
              {" • "}
              <span className={remainingBalance > 0 ? "text-orange-500 font-medium" : "text-green-500 font-medium"}>
                ${remainingBalance.toFixed(2)} {remainingBalance > 0 ? "remaining" : "paid in full"}
              </span>
            </div>
          </div>
          
          <Button onClick={() => setIsPaymentDialogOpen(true)} className="gap-2">
            <DollarSign size={16} />
            Add Payment
          </Button>
        </div>

        {payments.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    <div>
                      {new Date(payment.date).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(payment.date), { addSuffix: true })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getMethodIcon(payment.method)}
                      <span className="capitalize">{payment.method.replace('-', ' ')}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {payment.reference || "—"}
                  </TableCell>
                  <TableCell className="font-medium">
                    ${payment.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(payment.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      onClick={() => handleDeletePayment(payment)}
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                      <span className="sr-only">Delete payment</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No payments recorded yet. Add your first payment.</p>
          </div>
        )}
      </CardContent>
      
      <PaymentDialog 
        open={isPaymentDialogOpen} 
        onOpenChange={setIsPaymentDialogOpen}
        balance={remainingBalance} 
        onPaymentProcessed={handlePaymentProcessed}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DeleteConfirmDialog 
          title="Delete Payment"
          description={`Are you sure you want to delete this payment of $${selectedPayment?.amount.toFixed(2)}? This action cannot be undone.`}
          onOpenChange={setIsDeleteConfirmOpen}
          onConfirm={confirmDeletePayment}
          isDeleting={isDeleting}
        />
      </Dialog>
    </Card>
  );
};
