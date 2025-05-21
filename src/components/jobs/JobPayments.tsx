import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PaymentDialog } from "./dialogs/PaymentDialog";
import { DollarSign, BellRing } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { usePayments, Payment } from "@/hooks/payments";
import { toast } from "@/components/ui/sonner";
import { RefundDialog } from "../finance/dialogs/RefundDialog";
import { Payment as RefundDialogPayment } from "@/types/payment";
import { DeleteConfirmDialog } from "./dialogs/DeleteConfirmDialog";
import { PaymentsTable } from "./payments/PaymentsTable";
import { PaymentSummary } from "./payments/PaymentSummary";
import { usePaymentJobHistory } from "./payments/usePaymentJobHistory";
import { supabase } from "@/integrations/supabase/client";
import { useRBAC } from "@/components/auth/RBACProvider";
import { PaymentMethod } from "@/types/payment";
import { sendPaymentConfirmationSMS, sendRefundConfirmationSMS } from "@/services/notificationService";

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
  const [clientPhone, setClientPhone] = useState<string | null>(null);
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
  
  const { recordRefund, recordNewPayment } = usePaymentJobHistory(jobId);

  // Fetch client phone number when component mounts
  useEffect(() => {
    const fetchClientInfo = async () => {
      try {
        // Get the job to find client ID
        const { data: job } = await supabase
          .from('jobs')
          .select('client_id')
          .eq('id', jobId)
          .single();
          
        if (job && job.client_id) {
          // Get client phone number
          const { data: client } = await supabase
            .from('clients')
            .select('phone')
            .eq('id', job.client_id)
            .single();
            
          if (client && client.phone) {
            setClientPhone(client.phone);
          }
        }
      } catch (error) {
        console.error("Failed to fetch client info:", error);
      }
    };
    
    fetchClientInfo();
  }, [jobId]);

  const handleRefundPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsRefundDialogOpen(true);
  };

  const confirmRefund = async (paymentId: string) => {
    const result = await refundPayment(paymentId);
    if (result && selectedPayment) {
      await recordRefund(selectedPayment);
      
      // Send SMS notification for refund if we have client's phone number
      if (clientPhone) {
        try {
          await sendRefundConfirmationSMS(
            clientPhone,
            selectedPayment.amount,
            jobId
          );
          toast.success("Refund SMS notification sent");
        } catch (error) {
          console.error("Failed to send refund notification:", error);
          toast.error("Failed to send refund notification");
        }
      }
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

  const handlePaymentProcessed = async (amount: number, method: string, reference?: string, notes?: string) => {
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
      await recordNewPayment(amount, method as PaymentMethod, reference);
      
      // Send SMS notification if we have client's phone number
      if (clientPhone) {
        try {
          await sendPaymentConfirmationSMS(
            clientPhone, 
            amount, 
            method as PaymentMethod,
            jobId,
            reference
          );
          toast.success("Payment confirmation SMS sent");
        } catch (error) {
          console.error("Failed to send SMS notification:", error);
          toast.error("Failed to send SMS notification");
        }
      }
      
      // Refresh payments list by fetching the latest data
      fetchPayments();
      
      // Close the payment dialog
      setIsPaymentDialogOpen(false);
    } catch (error) {
      console.error("Error processing payment:", error);
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
            <PaymentSummary netAmount={netAmount} totalRefunded={totalRefunded} />
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="gap-2" 
              onClick={() => toast.info("SMS notifications are enabled for payments")}
            >
              <BellRing size={16} />
              SMS Enabled
            </Button>
            <Button onClick={() => setIsPaymentDialogOpen(true)} className="gap-2 bg-green-600 hover:bg-green-700">
              <DollarSign size={16} />
              Add Payment
            </Button>
          </div>
        </div>

        <PaymentsTable 
          payments={payments}
          isLoading={isLoading}
          onRefund={handleRefundPayment}
          onDelete={handleDeletePayment}
        />
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
