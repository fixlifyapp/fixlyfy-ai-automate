
import { useState, useMemo, useCallback } from "react";
import { toast, enhancedToast } from "@/components/ui/sonner";
import { payments as mockPayments } from "@/data/payments";
import { supabase } from "@/integrations/supabase/client";
import { PaymentMethod } from "@/types/payment";

// Define a proper type for payments
export interface Payment {
  id: string;
  amount: number;
  date: string;
  method: PaymentMethod;
  created_at: string;
  notes: string;
  reference: string;
  invoice_id: string;
  // Add missing properties that were causing TypeScript errors
  job_id?: string;
  client_id?: string;
  status: string;
  technician_id?: string;
  technician_name?: string;
}

type PaymentInput = {
  amount: number;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
};

// Enhanced version of usePayments
export const usePayments = (jobId?: string) => {
  const [payments, setPayments] = useState<Payment[]>(() => {
    const filteredPayments = jobId 
      ? mockPayments.filter(p => p.jobId === jobId) 
      : mockPayments;
    
    // Convert the mock payments to match our Payment interface
    return filteredPayments.map(p => ({
      id: p.id,
      amount: p.amount,
      date: p.date,
      method: p.method,
      created_at: p.date, // Use date as created_at
      notes: p.notes || "",
      reference: p.reference || "",
      invoice_id: "",
      job_id: p.jobId,
      client_id: p.clientId,
      status: p.status,
      technician_id: p.technicianId,
      technician_name: p.technicianName
    }));
  });
  
  const [isLoading, setIsLoading] = useState(false);

  // Calculate payment totals
  const totalPaid = useMemo(() => {
    return payments
      .filter(p => p.status === 'paid')
      .reduce((sum, payment) => sum + payment.amount, 0);
  }, [payments]);

  const totalRefunded = useMemo(() => {
    return payments
      .filter(p => p.status === 'refunded')
      .reduce((sum, payment) => sum + payment.amount, 0);
  }, [payments]);

  const netAmount = useMemo(() => {
    return totalPaid - totalRefunded;
  }, [totalPaid, totalRefunded]);

  // Function to fetch payments for a specific job
  const fetchPayments = useCallback(async () => {
    if (!jobId) return;
    
    setIsLoading(true);
    
    try {
      // First get the invoice for this job
      const { data: invoices, error: invoiceError } = await supabase
        .from('invoices')
        .select('id')
        .eq('job_id', jobId);
        
      if (invoiceError) {
        throw invoiceError;
      }
      
      if (!invoices || invoices.length === 0) {
        // No invoices found for this job, use mock data
        setPayments([]);
        return;
      }
      
      const invoiceIds = invoices.map(inv => inv.id);
      
      // Fetch payments for these invoices
      const { data: paymentData, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .in('invoice_id', invoiceIds);
        
      if (paymentsError) {
        throw paymentsError;
      }
      
      if (paymentData) {
        const formattedPayments = paymentData.map(p => ({
          ...p,
          status: 'paid', // Default status for new payments
          job_id: jobId,
          method: p.method as PaymentMethod // Fix TypeScript error by casting
        })) as Payment[];
        
        setPayments(formattedPayments);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
      // toast.error call will be silenced by our updated implementation
    } finally {
      setIsLoading(false);
    }
  }, [jobId]);

  // Add a new payment
  const addPayment = async (paymentData: PaymentInput, clientId: string) => {
    try {
      // Find the invoice for this job
      const { data: invoices, error: invoiceError } = await supabase
        .from('invoices')
        .select('id')
        .eq('job_id', jobId);
        
      if (invoiceError) {
        throw invoiceError;
      }
      
      if (!invoices || invoices.length === 0) {
        enhancedToast.error("No invoice found for this job");
        throw new Error("No invoice found for this job");
      }
      
      const invoiceId = invoices[0].id;
      
      // Create the payment in the database
      const { data: newPayment, error: paymentError } = await supabase
        .from('payments')
        .insert({
          invoice_id: invoiceId,
          amount: paymentData.amount,
          method: paymentData.method,
          reference: paymentData.reference || "",
          notes: paymentData.notes || "",
          date: new Date().toISOString()
        })
        .select()
        .single();
        
      if (paymentError) {
        throw paymentError;
      }
      
      // Update the payment locally with proper typing
      const formattedPayment: Payment = {
        id: newPayment.id,
        amount: newPayment.amount,
        date: newPayment.date || new Date().toISOString(),
        method: newPayment.method as PaymentMethod,
        created_at: newPayment.created_at || new Date().toISOString(),
        notes: newPayment.notes || "",
        reference: newPayment.reference || "",
        invoice_id: newPayment.invoice_id || invoiceId,
        status: 'paid',
        job_id: jobId,
        client_id: clientId
      };
      
      // Add to local state
      setPayments(prev => [formattedPayment, ...prev]);
      toast.success("Payment added successfully");
      
      return formattedPayment;
    } catch (error) {
      console.error("Error adding payment:", error);
      toast.error("Failed to add payment");
      throw error;
    }
  };

  // Refund a payment
  const refundPayment = async (paymentId: string) => {
    try {
      // Update local state
      setPayments(prev => 
        prev.map(p => p.id === paymentId ? { ...p, status: 'refunded' } : p)
      );
      
      toast.success("Payment refunded successfully");
      return true;
    } catch (error) {
      console.error("Error refunding payment:", error);
      toast.error("Failed to refund payment");
      return false;
    }
  };

  // Delete a payment
  const deletePayment = async (paymentId: string) => {
    try {
      // Update local state
      setPayments(prev => prev.filter(p => p.id !== paymentId));
      toast.success("Payment deleted successfully");
      return true;
    } catch (error) {
      console.error("Error deleting payment:", error);
      toast.error("Failed to delete payment");
      throw error;
    }
  };
  
  return {
    payments,
    isLoading,
    error: null,
    totalPaid,
    totalRefunded,
    netAmount,
    addPayment,
    refundPayment,
    deletePayment,
    fetchPayments
  };
};
