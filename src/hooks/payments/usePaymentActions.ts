
import { useCallback } from "react";
import { Payment, PaymentInput } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { enhancedToast } from "@/components/ui/sonner";
import { PaymentMethod } from "@/types/payment";

export const usePaymentActions = (
  jobId?: string, 
  setPayments?: React.Dispatch<React.SetStateAction<Payment[]>>
) => {
  // Add a new payment
  const addPayment = useCallback(async (paymentData: PaymentInput, clientId: string) => {
    if (!setPayments || !jobId) {
      console.error("Missing required dependencies in usePaymentActions");
      return null;
    }

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
        method: newPayment.method as PaymentMethod, // Properly cast to PaymentMethod type
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
      enhancedToast.success("Payment added successfully");
      
      return formattedPayment;
    } catch (error) {
      console.error("Error adding payment:", error);
      enhancedToast.error("Failed to add payment");
      throw error;
    }
  }, [jobId, setPayments]);

  // Refund a payment
  const refundPayment = useCallback(async (paymentId: string) => {
    if (!setPayments) {
      console.error("Missing required dependencies in usePaymentActions");
      return false;
    }

    try {
      // Update local state
      setPayments(prev => 
        prev.map(p => p.id === paymentId ? { ...p, status: 'refunded' } : p)
      );
      
      enhancedToast.success("Payment refunded successfully");
      return true;
    } catch (error) {
      console.error("Error refunding payment:", error);
      enhancedToast.error("Failed to refund payment");
      return false;
    }
  }, [setPayments]);

  // Delete a payment
  const deletePayment = useCallback(async (paymentId: string) => {
    if (!setPayments) {
      console.error("Missing required dependencies in usePaymentActions");
      return false;
    }

    try {
      // Update local state
      setPayments(prev => prev.filter(p => p.id !== paymentId));
      enhancedToast.success("Payment deleted successfully");
      return true;
    } catch (error) {
      console.error("Error deleting payment:", error);
      enhancedToast.error("Failed to delete payment");
      throw error;
    }
  }, [setPayments]);
  
  return {
    addPayment,
    refundPayment,
    deletePayment
  };
};
