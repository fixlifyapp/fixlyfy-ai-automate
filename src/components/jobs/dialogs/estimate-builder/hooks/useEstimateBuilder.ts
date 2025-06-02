
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EstimateDetails {
  estimate_number: string;
  notes: string;
  status: string;
}

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxable: boolean;
  ourPrice?: number;
  name?: string;
  price?: number;
  total?: number;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  ourPrice?: number;
  taxable?: boolean;
  quantity?: number;
}

export const useEstimateBuilder = (jobId: string, estimateId?: string) => {
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [estimateDetails, setEstimateDetails] = useState<EstimateDetails>({
    estimate_number: `EST-${Date.now()}`,
    notes: "",
    status: "draft"
  });
  const [isLoading, setIsLoading] = useState(false);
  const [taxRate, setTaxRate] = useState(0.13);
  const [notes, setNotes] = useState("");

  const addLineItem = (item: Partial<LineItem>) => {
    const newItem: LineItem = {
      id: `item-${Date.now()}`,
      description: item.description || "",
      quantity: item.quantity || 1,
      unitPrice: item.unitPrice || 0,
      taxable: item.taxable !== undefined ? item.taxable : true,
      ourPrice: item.ourPrice || 0,
      name: item.name || item.description || "",
      price: item.unitPrice || 0,
      total: (item.quantity || 1) * (item.unitPrice || 0)
    };
    setLineItems(prev => [...prev, newItem]);
  };

  const updateLineItem = (id: string, updates: Partial<LineItem>) => {
    setLineItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const handleUpdateLineItem = (id: string, updates: Partial<LineItem>) => {
    updateLineItem(id, updates);
  };

  const removeLineItem = (id: string) => {
    setLineItems(prev => prev.filter(item => item.id !== id));
  };

  const updateEstimateDetails = (updates: Partial<EstimateDetails>) => {
    setEstimateDetails(prev => ({ ...prev, ...updates }));
  };

  const handleAddProduct = (product: Product) => {
    const newLineItem: LineItem = {
      id: `item-${Date.now()}`,
      description: product.description || product.name,
      quantity: product.quantity || 1,
      unitPrice: product.price,
      taxable: product.taxable !== undefined ? product.taxable : true,
      ourPrice: product.ourPrice || 0,
      name: product.name,
      price: product.price,
      total: (product.quantity || 1) * product.price
    };
    setLineItems(prev => [...prev, newLineItem]);
  };

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const calculateTotalTax = () => {
    const taxableAmount = lineItems
      .filter(item => item.taxable)
      .reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    return taxableAmount * taxRate;
  };

  const calculateGrandTotal = () => {
    return calculateSubtotal() + calculateTotalTax();
  };

  const total = calculateGrandTotal();

  const saveEstimate = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const estimateData = {
        job_id: jobId,
        estimate_number: estimateDetails.estimate_number,
        total: total,
        status: estimateDetails.status,
        notes: estimateDetails.notes || notes
      };

      let savedEstimate;
      if (estimateId) {
        const { data, error } = await supabase
          .from('estimates')
          .update(estimateData)
          .eq('id', estimateId)
          .select()
          .single();
        
        if (error) throw error;
        savedEstimate = data;
      } else {
        const { data, error } = await supabase
          .from('estimates')
          .insert(estimateData)
          .select()
          .single();
        
        if (error) throw error;
        savedEstimate = data;
      }

      // Save line items
      if (savedEstimate && lineItems.length > 0) {
        // Delete existing line items if updating
        if (estimateId) {
          await supabase
            .from('line_items')
            .delete()
            .eq('parent_id', savedEstimate.id)
            .eq('parent_type', 'estimate');
        }

        const lineItemsData = lineItems.map(item => ({
          parent_id: savedEstimate.id,
          parent_type: 'estimate',
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          taxable: item.taxable
        }));

        const { error: lineItemError } = await supabase
          .from('line_items')
          .insert(lineItemsData);

        if (lineItemError) throw lineItemError;
      }

      toast.success('Estimate saved successfully');
      return true;
    } catch (error: any) {
      console.error('Error saving estimate:', error);
      toast.error('Failed to save estimate');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const saveEstimateChanges = async () => {
    const success = await saveEstimate();
    return success ? { id: estimateId || 'new' } : null;
  };

  const initializeFromEstimate = (estimate: any) => {
    setEstimateDetails({
      estimate_number: estimate.estimate_number,
      notes: estimate.notes || "",
      status: estimate.status || "draft"
    });
    setNotes(estimate.notes || "");
    // Load line items if needed
  };

  const resetForm = () => {
    setLineItems([]);
    setEstimateDetails({
      estimate_number: `EST-${Date.now()}`,
      notes: "",
      status: "draft"
    });
    setNotes("");
  };

  return {
    lineItems,
    setLineItems,
    estimateDetails,
    isLoading,
    taxRate,
    setTaxRate,
    notes,
    setNotes,
    addLineItem,
    updateLineItem,
    handleUpdateLineItem,
    removeLineItem,
    updateEstimateDetails,
    handleAddProduct,
    calculateSubtotal,
    calculateTotalTax,
    calculateGrandTotal,
    saveEstimate,
    saveEstimateChanges,
    initializeFromEstimate,
    resetForm,
    total
  };
};
