
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Payment } from "./types";
import { payments as mockPayments } from "@/data/payments";

export const useFetchPayments = (jobId?: string) => {
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
    } finally {
      setIsLoading(false);
    }
  }, [jobId]);

  return {
    payments,
    setPayments, // Expose this for other hooks to update
    isLoading,
    fetchPayments
  };
};
