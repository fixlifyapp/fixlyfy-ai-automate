
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { payments as mockPayments } from "@/data/payments";
import { supabase } from "@/integrations/supabase/client";
import { PaymentMethod } from "@/types/payment";

// Define a proper type for payments
export interface Payment {
  id: string;
  amount: number;
  date: string;
  method: PaymentMethod; // Change from string to PaymentMethod
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
  // Fix the initial state by ensuring mockPayments are cast to the proper type
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
  
  const [isLoading] = useState(false);

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

  // Add a new payment
  const addPayment = async (paymentData: PaymentInput, clientId: string) => {
    try {
      // In a real implementation, this would be an API call to create a payment
      const newPayment: Payment = {
        id: `pay_${Date.now()}`,
        amount: paymentData.amount,
        date: new Date().toISOString(),
        method: paymentData.method,
        reference: paymentData.reference || "",
        notes: paymentData.notes || "",
        status: "paid",
        created_at: new Date().toISOString(),
        invoice_id: "",
        job_id: jobId,
        client_id: clientId
      };
      
      // Add to local state
      setPayments(prev => [newPayment, ...prev]);
      toast.success("Payment added successfully");
      
      return newPayment;
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
    deletePayment
  };
};
