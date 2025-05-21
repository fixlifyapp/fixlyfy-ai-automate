
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
        
        // First get invoices for the client
        const { data: invoices, error: invoiceError } = await supabase
          .from('invoices')
          .select('id')
          .eq('client_id', clientId);
          
        if (invoiceError) throw invoiceError;
        
        if (!invoices || invoices.length === 0) {
          setPayments([]);
          setIsLoading(false);
          return;
        }
        
        const invoiceIds = invoices.map(inv => inv.id);
        
        // Then get payments for those invoices
        const { data: paymentData, error: paymentError } = await supabase
          .from('payments')
          .select('*, invoices(invoice_number, date, total)')
          .in('invoice_id', invoiceIds)
          .order('date', { ascending: false });
          
        if (paymentError) throw paymentError;
        
        setPayments(paymentData || []);
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
  }, [clientId]);
  
  return {
    payments,
    isLoading,
  };
};
