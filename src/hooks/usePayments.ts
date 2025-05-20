
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Payment, PaymentMethod, PaymentStatus } from "@/types/payment";

export interface PaymentFormData {
  amount: number;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
}

export const usePayments = (jobId?: string, invoiceId?: string) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalRefunded, setTotalRefunded] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchPayments = async () => {
    if (!jobId && !invoiceId) return;
    
    setIsLoading(true);
    try {
      // Since there appears to be a schema mismatch, don't try to join with clients
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      // Filter the data based on job_id or invoice_id
      const filteredData = data.filter(payment => {
        if (jobId && payment.job_id === jobId) return true;
        if (invoiceId && payment.invoice_id === invoiceId) return true;
        return false;
      });
      
      const formattedPayments: Payment[] = (filteredData || []).map(p => ({
        id: p.id,
        date: p.date,
        clientId: p.client_id || "unknown",
        clientName: "Client", // Default when client info isn't available
        jobId: p.job_id || "",
        amount: p.amount,
        method: (p.method as PaymentMethod) || "credit-card",
        status: (p.status as PaymentStatus) || "paid",
        reference: p.reference || "",
        notes: p.notes || "",
        technicianId: p.technician_id || undefined,
        technicianName: p.technician_name || undefined
      }));
      
      setPayments(formattedPayments);
      
      // Calculate totals - default status to 'paid' if not present
      let paid = 0;
      let refunded = 0;
      
      formattedPayments.forEach(payment => {
        if (payment.status === 'refunded') {
          refunded += payment.amount;
        } else {
          // Default to paid if status is undefined or any other value
          paid += payment.amount;
        }
      });
      
      setTotalPaid(paid);
      setTotalRefunded(refunded);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to load payment history');
    } finally {
      setIsLoading(false);
    }
  };
  
  const addPayment = async (payment: PaymentFormData, clientId: string) => {
    if (!jobId) {
      toast.error('Job ID is required to add a payment');
      return null;
    }
    
    try {
      // Create payment record
      const { data, error } = await supabase
        .from('payments')
        .insert({
          job_id: jobId,
          client_id: clientId,
          invoice_id: invoiceId, // Optional
          date: new Date().toISOString(),
          amount: payment.amount,
          method: payment.method,
          reference: payment.reference,
          notes: payment.notes
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // If there is an invoice associated, update its status
      if (invoiceId) {
        const { data: invoice, error: invoiceError } = await supabase
          .from('invoices')
          .select('total')
          .eq('id', invoiceId)
          .single();
          
        if (invoiceError) throw invoiceError;
        
        // Get total payments for this invoice - we don't rely on status field
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('payments')
          .select('amount')
          .eq('invoice_id', invoiceId);
          
        if (paymentsError) throw paymentsError;
        
        // Calculate total paid amount
        const totalPaidAmount = (paymentsData || [])
          .reduce((sum, p) => sum + p.amount, 0);
          
        // Update invoice status if fully paid
        if (totalPaidAmount >= invoice.total) {
          const { error: updateError } = await supabase
            .from('invoices')
            .update({ status: 'paid' })
            .eq('id', invoiceId);
            
          if (updateError) throw updateError;
        }
      }
      
      toast.success(`Payment of $${payment.amount.toFixed(2)} added successfully`);
      
      // Refresh payments
      setRefreshTrigger(prev => prev + 1);
      
      return data;
    } catch (error) {
      console.error('Error adding payment:', error);
      toast.error('Failed to add payment');
      return null;
    }
  };
  
  const refundPayment = async (paymentId: string, amount?: number) => {
    try {
      // Get the payment
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select('*')
        .eq('id', paymentId)
        .single();
        
      if (paymentError) throw paymentError;
      
      // Create refund record - don't add status field if not in schema
      const refundData = {
        invoice_id: payment.invoice_id,
        date: new Date().toISOString(),
        amount: amount || payment.amount,
        method: payment.method,
        reference: `Refund for ${payment.reference || paymentId}`,
        notes: `Refund for payment from ${new Date(payment.date).toLocaleDateString()}`
      };
      
      // Add job_id and client_id if they exist in the original payment
      if (payment.job_id) {
        refundData['job_id'] = payment.job_id;
      }
      
      if (payment.client_id) {
        refundData['client_id'] = payment.client_id;
      }
      
      const { data, error } = await supabase
        .from('payments')
        .insert(refundData)
        .select()
        .single();
        
      if (error) throw error;
      
      toast.success(`Payment refunded successfully`);
      
      // Refresh payments
      setRefreshTrigger(prev => prev + 1);
      
      return data;
    } catch (error) {
      console.error('Error refunding payment:', error);
      toast.error('Failed to process refund');
      return null;
    }
  };
  
  const deletePayment = async (paymentId: string) => {
    try {
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', paymentId);
        
      if (error) throw error;
      
      setPayments(payments.filter(p => p.id !== paymentId));
      toast.success('Payment deleted successfully');
      
      // Refresh to update totals
      setRefreshTrigger(prev => prev + 1);
      
      return true;
    } catch (error) {
      console.error('Error deleting payment:', error);
      toast.error('Failed to delete payment');
      return false;
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [jobId, invoiceId, refreshTrigger]);

  return {
    payments,
    isLoading,
    totalPaid,
    totalRefunded,
    netAmount: totalPaid - totalRefunded,
    addPayment,
    refundPayment,
    deletePayment,
    refreshPayments: () => setRefreshTrigger(prev => prev + 1)
  };
};
