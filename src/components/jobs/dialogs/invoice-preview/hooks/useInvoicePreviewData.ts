
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Invoice } from "@/hooks/useInvoices";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  taxable: boolean;
}

interface ClientInfo {
  name: string;
  email: string;
  phone: string;
}

export const useInvoicePreviewData = (invoice: Invoice) => {
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);

  useEffect(() => {
    const fetchLineItems = async () => {
      if (!invoice.id) return;
      
      setIsLoadingItems(true);
      try {
        const { data, error } = await supabase
          .from('line_items')
          .select('*')
          .eq('parent_id', invoice.id)
          .eq('parent_type', 'invoice');

        if (error) throw error;
        
        setLineItems(data || []);
      } catch (error) {
        console.error('Error fetching line items:', error);
        toast.error('Failed to load invoice items');
      } finally {
        setIsLoadingItems(false);
      }
    };

    fetchLineItems();
  }, [invoice.id]);

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  };

  const calculateTax = () => {
    const taxableTotal = lineItems
      .filter(item => item.taxable)
      .reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    return taxableTotal * 0.13; // 13% tax rate
  };

  return {
    lineItems,
    isLoadingItems,
    calculateSubtotal,
    calculateTax
  };
};
