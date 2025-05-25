
import React, { useState, useEffect } from "react";
import { ModernCard, ModernCardHeader, ModernCardContent, ModernCardTitle } from "@/components/ui/modern-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, CreditCard, FileText, Trash2, Calendar, RefreshCw } from "lucide-react";
import { PaymentDialog } from "../dialogs/PaymentDialog";
import { PaymentMethod } from "@/types/payment";
import { formatDistanceToNow } from "date-fns";
import { DeleteConfirmDialog } from "../dialogs/DeleteConfirmDialog";
import { usePayments, Payment } from "@/hooks/usePayments";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RefundDialog } from "../../finance/dialogs/RefundDialog";
import { Payment as RefundDialogPayment } from "@/types/payment";
import { recordPayment } from "@/services/jobHistoryService";
import { useRBAC } from "../../auth/RBACProvider";

interface ModernJobPaymentsTabProps {
  jobId: string;
}

export const ModernJobPaymentsTab = ({ jobId }: ModernJobPaymentsTabProps) => {
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
      
      await recordPayment(
        jobId,
        amount,
        method,
        currentUser?.name,
        currentUser?.id,
        reference
      );
      
      fetchPayments();
      setIsPaymentDialogOpen(false);
    } catch (error) {
      console.error("Error processing payment:", error);
    }
  };

  const handleRefundPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsRefundDialogOpen(true);
  };

  const confirmRefund = (paymentId: string) => {
    refundPayment(paymentId);
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

  const convertToRefundDialogPayment = (payment: Payment): RefundDialogPayment => {
    return {
      id: payment.id,
      date: payment.date,
      clientId: payment.client_id || '',
      clientName: payment.technician_name || 'Client',
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
    <div className="space-y-6">
      <ModernCard variant="elevated" className="hover:shadow-lg transition-all duration-300">
        <ModernCardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <ModernCardTitle icon={DollarSign}>
              Payments ({payments.length})
            </ModernCardTitle>
            <Button 
              onClick={() => setIsPaymentDialogOpen(true)} 
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              <DollarSign size={16} />
              Add Payment
            </Button>
          </div>
        </ModernCardHeader>
        <ModernCardContent className="space-y-4">
          {/* Payment Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Paid</p>
              <p className="text-lg font-semibold text-green-600">${totalPaid.toFixed(2)}</p>
            </div>
            {totalRefunded > 0 && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Refunded</p>
                <p className="text-lg font-semibold text-orange-600">${totalRefunded.toFixed(2)}</p>
              </div>
            )}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Net Amount</p>
              <p className="text-lg font-semibold text-blue-600">${netAmount.toFixed(2)}</p>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="w-full h-16" />
              ))}
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium">No payments recorded yet</p>
              <p className="text-sm">Add your first payment to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {getMethodIcon(payment.method)}
                          <span className="capitalize font-medium">{payment.method.replace('-', ' ')}</span>
                        </div>
                        {getStatusBadge(payment.status)}
                        <span className="font-semibold">${payment.amount.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(payment.date).toLocaleDateString()}
                        </div>
                        {payment.reference && (
                          <div className="font-mono text-xs">
                            Ref: {payment.reference}
                          </div>
                        )}
                        <div>
                          {formatDistanceToNow(new Date(payment.date), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {payment.status === 'paid' && (
                        <Button
                          onClick={() => handleRefundPayment(payment)}
                          size="sm"
                          variant="outline"
                          className="text-amber-600 border-amber-200 hover:bg-amber-50"
                        >
                          <RefreshCw size={16} />
                        </Button>
                      )}
                      <Button
                        onClick={() => handleDeletePayment(payment)}
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ModernCardContent>
      </ModernCard>
      
      <PaymentDialog 
        open={isPaymentDialogOpen} 
        onOpenChange={setIsPaymentDialogOpen}
        balance={100}
        onPaymentProcessed={handlePaymentProcessed}
      />

      <DeleteConfirmDialog 
        title="Delete Payment"
        description={`Are you sure you want to delete this payment of $${selectedPayment?.amount.toFixed(2)}? This action cannot be undone.`}
        onOpenChange={setIsDeleteConfirmOpen}
        onConfirm={confirmDeletePayment}
        isDeleting={isDeleting}
        open={isDeleteConfirmOpen}
      />

      {selectedPayment && (
        <RefundDialog
          open={isRefundDialogOpen}
          onOpenChange={setIsRefundDialogOpen}
          payment={convertToRefundDialogPayment(selectedPayment)}
          onRefund={confirmRefund}
        />
      )}
    </div>
  );
};
