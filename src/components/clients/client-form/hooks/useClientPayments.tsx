
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useClientPayments = (clientId?: string) => {
  const { toast } = useToast();
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      if (!clientId) {
        setPayments([]);
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Get jobs for the client
        const { data: jobs, error: jobsError } = await supabase
          .from('jobs')
          .select('id')
          .eq('client_id', clientId);
          
        if (jobsError) throw jobsError;
        
        let paymentData: any[] = [];
        
        if (jobs && jobs.length > 0) {
          const jobIds = jobs.map(job => job.id);
          
          // Get invoices for those jobs
          const { data: invoices, error: invoiceError } = await supabase
            .from('invoices')
            .select('id')
            .in('job_id', jobIds);
            
          if (invoiceError) throw invoiceError;
          
          if (invoices && invoices.length > 0) {
            const invoiceIds = invoices.map(inv => inv.id);
            
            // Then get payments for those invoices
            const { data: payments, error: paymentError } = await supabase
              .from('payments')
              .select('*, invoices(*)')
              .in('invoice_id', invoiceIds)
              .order('date', { ascending: false });
              
            if (paymentError) throw paymentError;
            
            paymentData = payments || [];
          }
        }
        
        setPayments(paymentData);
      } catch (error) {
        console.error("Error loading client payments:", error);
        toast({
          title: "Error",
          description: "Failed to load payment history",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPayments();
  }, [clientId, toast]);
  
  return {
    payments,
    isLoading,
  };
};
