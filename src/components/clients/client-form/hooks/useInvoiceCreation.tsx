
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useInvoiceCreation = (clientId?: string) => {
  const { toast } = useToast();
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceData, setInvoiceData] = useState({
    description: "",
    amount: ""
  });

  const handleCreateInvoice = () => {
    setIsInvoiceModalOpen(true);
  };

  const handleInvoiceSubmit = async () => {
    if (!clientId) return;
    
    try {
      // Create invoice in the database
      const currentDate = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('invoices')
        .insert({
          invoice_number: `INV-${Date.now().toString().slice(-6)}`,
          total: parseFloat(invoiceData.amount) || 0,
          notes: invoiceData.description,
          issue_date: currentDate,
          amount_paid: 0,
          client_id: clientId // Link invoice to the client
        })
        .select();
        
      if (error) throw error;
      
      setIsInvoiceModalOpen(false);
      
      toast({
        title: "Invoice created",
        description: `Invoice for $${invoiceData.amount} has been created successfully.`,
      });
    
      // Reset form data
      setInvoiceData({
        description: "",
        amount: ""
      });
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast({
        title: "Error",
        description: "Failed to create invoice. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    isInvoiceModalOpen,
    setIsInvoiceModalOpen,
    invoiceData,
    setInvoiceData,
    handleCreateInvoice,
    handleInvoiceSubmit
  };
};
