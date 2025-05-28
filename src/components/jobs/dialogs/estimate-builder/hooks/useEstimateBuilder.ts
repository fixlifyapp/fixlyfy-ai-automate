import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Estimate } from "@/hooks/useEstimates";
import { Product, LineItem } from "@/components/jobs/builder/types";
import { generateNextId } from "@/utils/idGeneration";

interface EstimateFormData {
  estimateId?: string;
  estimateNumber: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    taxable: boolean;
  }>;
  notes: string;
  status: string;
  total: number;
}

export const useEstimateBuilder = (jobId: string) => {
  const [formData, setFormData] = useState<EstimateFormData>({
    estimateNumber: "",
    items: [],
    notes: "",
    status: "draft",
    total: 0
  });
  
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [taxRate, setTaxRate] = useState<number>(13);
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate estimate number on component mount
  useEffect(() => {
    const generateEstimateNumber = async () => {
      try {
        const estimateNumber = await generateNextId('estimate');
        setFormData(prev => ({
          ...prev,
          estimateNumber
        }));
      } catch (error) {
        console.error('Error generating estimate number:', error);
        // Fallback to timestamp-based number
        const timestamp = Date.now();
        const shortNumber = timestamp.toString().slice(-4);
        setFormData(prev => ({
          ...prev,
          estimateNumber: `E-${shortNumber}`
        }));
      }
    };

    generateEstimateNumber();
  }, []);

  const handleAddProduct = useCallback((product: Product) => {
    const newLineItem: LineItem = {
      id: `item-${Date.now()}`,
      description: product.description || product.name,
      quantity: product.quantity || 1,
      unitPrice: product.price,
      taxable: product.taxable,
      discount: 0,
      ourPrice: product.ourPrice || 0,
      name: product.name,
      price: product.price,
      total: (product.quantity || 1) * product.price
    };
    
    setLineItems(prev => [...prev, newLineItem]);
  }, []);

  const handleRemoveLineItem = useCallback((id: string) => {
    setLineItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const handleUpdateLineItem = useCallback((id: string, updates: Partial<LineItem>) => {
    setLineItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, ...updates, total: (updates.quantity || item.quantity) * (updates.unitPrice || item.unitPrice) }
        : item
    ));
  }, []);

  const calculateSubtotal = useCallback(() => {
    return lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  }, [lineItems]);

  const calculateTotalTax = useCallback(() => {
    const subtotal = calculateSubtotal();
    return subtotal * (taxRate / 100);
  }, [calculateSubtotal, taxRate]);

  const calculateGrandTotal = useCallback(() => {
    return calculateSubtotal() + calculateTotalTax();
  }, [calculateSubtotal, calculateTotalTax]);

  const initializeFromEstimate = useCallback((estimate: Estimate) => {
    const getEstimateItems = async () => {
      try {
        const { data: lineItemsData, error } = await supabase
          .from('line_items')
          .select('*')
          .eq('parent_id', estimate.id)
          .eq('parent_type', 'estimate');
          
        if (error) throw error;
        
        const items = lineItemsData?.map((item, index) => ({
          id: item.id || `item-${index}`,
          description: item.description || "",
          quantity: item.quantity || 1,
          unitPrice: item.unit_price || 0,
          taxable: item.taxable || true,
          discount: 0,
          ourPrice: 0,
          name: item.description || "",
          price: item.unit_price || 0,
          total: (item.quantity || 1) * (item.unit_price || 0)
        })) || [];
        
        setLineItems(items);
        setNotes(estimate.notes || "");
        setFormData(prev => ({
          ...prev,
          estimateId: estimate.id,
          estimateNumber: estimate.estimate_number,
          status: estimate.status,
          total: estimate.total
        }));
      } catch (error) {
        console.error("Error loading estimate items:", error);
        toast.error("Failed to load estimate items");
      }
    };
    
    getEstimateItems();
  }, []);

  const resetForm = useCallback(async () => {
    const estimateNumber = await generateNextId('estimate');
    setFormData({
      estimateNumber,
      items: [],
      notes: "",
      status: "draft",
      total: 0
    });
    setLineItems([]);
    setNotes("");
  }, []);

  const saveEstimateChanges = useCallback(async (): Promise<Estimate | null> => {
    if (isSubmitting) return null;
    
    setIsSubmitting(true);
    
    try {
      const estimateData = {
        job_id: jobId,
        estimate_number: formData.estimateNumber,
        total: calculateGrandTotal(),
        status: formData.status,
        notes: notes
      };

      let estimate;
      if (formData.estimateId) {
        // Update existing estimate
        const { data, error } = await supabase
          .from('estimates')
          .update(estimateData)
          .eq('id', formData.estimateId)
          .select()
          .single();
          
        if (error) throw error;
        estimate = data;
      } else {
        // Create new estimate
        const { data, error } = await supabase
          .from('estimates')
          .insert(estimateData)
          .select()
          .single();
          
        if (error) throw error;
        estimate = data;
      }
      
      // Handle line items
      if (estimate) {
        // Delete existing line items
        await supabase
          .from('line_items')
          .delete()
          .eq('parent_id', estimate.id)
          .eq('parent_type', 'estimate');
        
        // Create new line items
        if (lineItems.length > 0) {
          const lineItemsData = lineItems.map(item => ({
            parent_id: estimate.id,
            parent_type: 'estimate',
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            taxable: item.taxable
          }));
          
          await supabase
            .from('line_items')
            .insert(lineItemsData);
        }
      }
      
      toast.success(formData.estimateId ? "Estimate updated successfully" : "Estimate created successfully");
      
      return {
        id: estimate.id,
        job_id: estimate.job_id,
        estimate_number: estimate.estimate_number,
        number: estimate.estimate_number,
        amount: estimate.total,
        date: estimate.date || estimate.created_at,
        total: estimate.total,
        status: estimate.status,
        notes: estimate.notes,
        created_at: estimate.created_at,
        updated_at: estimate.updated_at
      };
    } catch (error) {
      console.error("Error saving estimate:", error);
      toast.error("Failed to save estimate");
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [jobId, formData, lineItems, notes, calculateGrandTotal, isSubmitting]);

  return {
    formData,
    lineItems,
    taxRate,
    notes,
    estimateNumber: formData.estimateNumber,
    isSubmitting,
    setLineItems,
    setTaxRate,
    setNotes,
    handleAddProduct,
    handleRemoveLineItem,
    handleUpdateLineItem,
    calculateSubtotal,
    calculateTotalTax,
    calculateGrandTotal,
    saveEstimateChanges,
    resetForm,
    initializeFromEstimate
  };
};
