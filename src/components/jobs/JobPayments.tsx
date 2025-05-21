
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PaymentDialog } from "./dialogs/PaymentDialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CreditCard, DollarSign, FileText, Trash2 } from "lucide-react";
import { PaymentMethod } from "@/types/payment";
import { formatDistanceToNow } from "date-fns";
import { DeleteConfirmDialog } from "./dialogs/DeleteConfirmDialog";
import { Dialog } from "@/components/ui/dialog";
import { usePayments, Payment } from "@/hooks/usePayments";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { RefundDialog } from "../finance/dialogs/RefundDialog";
import { Payment as RefundDialogPayment } from "@/types/payment";
import { recordPayment } from "@/services/jobHistoryService";
import { useRBAC } from "@/components/auth/RBACProvider";

// Import CSS for animations
import "@/styles/toast-animations.css";

interface JobPaymentsProps {
  jobId: string;
}

export const JobPayments = ({ jobId }: JobPaymentsProps) => {
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { currentUser } = useRBAC();
  
  const { 
    payments, 
    isLoading,
    totalPaid,
    totalRefunded,
    netAmount,
    addPayment,
    refundPayment,
    deletePayment,
    fetchPayments
  } = usePayments(jobId);
  
  // Fetch payments when component mounts or jobId changes
  useEffect(() => {
    if (jobId) {
      fetchPayments();
    }
  }, [jobId, fetchPayments]);

  const getMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case "credit-card":
        return <CreditCard size={16} className="text-blue-500" />;
      case "cash":
        return <DollarSign size={16} className="text-green-500" />;
      case "e-transfer":
        return <FileText size={16} className="text-purple-500" />; 
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

  const handlePaymentProcessed = async (amount: number, method: PaymentMethod, reference?: string, notes?: string) => {
    try {
      // Get the invoice information
      const { data: invoices } = await supabase
        .from('invoices')
        .select('id')
        .eq('job_id', jobId)
        .limit(1);
        
      if (!invoices || invoices.length === 0) {
        toast.error('No invoice found for this job');
        return;
      }
      
      const invoiceId = invoices[0].id;
      
      // Create a payment directly in the database
      const { data: payment, error } = await supabase
        .from('payments')
        .insert({
          invoice_id: invoiceId,
          amount,
          method,
          reference: reference || "",
          notes: notes || "",
          date: new Date().toISOString()
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error recording payment:', error);
        throw error;
      }
      
      // Update invoice balance
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('balance, amount_paid, total')
        .eq('id', invoiceId)
        .single();
        
      if (invoiceError) {
        console.error('Error fetching invoice:', invoiceError);
        throw invoiceError;
      }
      
      const newAmountPaid = (invoice.amount_paid || 0) + amount;
      const newBalance = Math.max(0, invoice.total - newAmountPaid);
      const newStatus = newBalance === 0 ? 'paid' : newAmountPaid > 0 ? 'partial' : 'unpaid';
      
      const { error: updateError } = await supabase
        .from('invoices')
        .update({
          amount_paid: newAmountPaid,
          balance: newBalance,
          status: newStatus
        })
        .eq('id', invoiceId);
        
      if (updateError) {
        console.error('Error updating invoice:', updateError);
        throw updateError;
      }
      
      // Record in job history
      await recordPayment(
        jobId,
        amount,
        method,
        currentUser?.name,
        currentUser?.id,
        reference
      );
      
      // Refresh payments list by fetching the latest data
      fetchPayments();
      
      // Close the payment dialog
      setIsPaymentDialogOpen(false);
    } catch (error) {
      console.error("Error processing payment:", error);
    }
  };

  const handleRefundPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsRefundDialogOpen(true);
  };

  const confirmRefund = async (paymentId: string) => {
    const result = await refundPayment(paymentId);
    if (result) {
      // Record the refund in history
      if (selectedPayment) {
        await recordRefund(selectedPayment);
      }
    }
  };
  
  const recordRefund = async (payment: Payment) => {
    try {
      // Add a history item for the refund
      await supabase
        .from('job_history')
        .insert({
          job_id: jobId,
          type: 'payment',
          title: 'Payment Refunded',
          description: `Payment of $${payment.amount.toFixed(2)} via ${payment.method} was refunded`,
          user_id: currentUser?.id,
          user_name: currentUser?.name,
          meta: {
            amount: payment.amount,
            method: payment.method,
            reference: payment.reference,
            refunded: true
          },
          visibility: 'restricted'
        });
    } catch (error) {
      console.error('Error recording refund in history:', error);
    }
  };

  const handleDeletePayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeletePayment = async () => {
    if (!selectedPayment) return;
    
    setIsDeleting(true);
    
    try {
      await deletePayment(selectedPayment.id);
      setIsDeleteConfirmOpen(false);
    } catch (error) {
      console.error("Failed to delete payment:", error);
      toast.error("Failed to delete payment");
    } finally {
      setIsDeleting(false);
    }
  };

  // Convert Payment type to match RefundDialog's expected Payment type
  const convertToRefundDialogPayment = (payment: Payment): RefundDialogPayment => {
    return {
      id: payment.id,
      date: payment.date,
      clientId: payment.client_id || '',
      clientName: payment.technician_name || 'Client', // Use technician_name if available, or default
      jobId: payment.job_id || jobId,
      amount: payment.amount,
      method: payment.method,
      status: payment.status as "paid" | "refunded" | "disputed",
      reference: payment.reference,
      notes: payment.notes,
      technicianId: payment.technician_id,
      technicianName: payment.technician_name
    };
  };

  return (
    <Card className="border-fixlyfy-border shadow-sm">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-medium">Payments</h3>
            <div className="text-sm text-muted-foreground mt-1">
              <span className="font-medium">${netAmount.toFixed(2)}</span> net payments
              {totalRefunded > 0 && (
                <>
                  {" • "}
                  <span className="text-orange-500 font-medium">${totalRefunded.toFixed(2)} refunded</span>
                </>
              )}
            </div>
          </div>
          
          <Button onClick={() => setIsPaymentDialogOpen(true)} className="gap-2 bg-green-600 hover:bg-green-700">
            <DollarSign size={16} />
            Add Payment
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <Skeleton key={i} className="w-full h-16" />
            ))}
          </div>
        ) : payments.length > 0 ? (
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
                    {payment.status === 'paid' && (
                      <Button
                        onClick={() => handleRefundPayment(payment)}
                        size="sm"
                        variant="outline"
                        className="h-8 text-amber-600 mr-1 border-amber-200 hover:bg-amber-50"
                      >
                        Refund
                      </Button>
                    )}
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
        balance={100} // This would come from actual invoice data in a real app
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

      {/* Refund Dialog */}
      {selectedPayment && (
        <RefundDialog
          open={isRefundDialogOpen}
          onOpenChange={setIsRefundDialogOpen}
          payment={convertToRefundDialogPayment(selectedPayment)}
          onRefund={confirmRefund}
        />
      )}
    </Card>
  );
};
