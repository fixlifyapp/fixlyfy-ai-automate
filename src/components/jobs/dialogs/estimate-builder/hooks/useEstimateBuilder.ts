
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LineItem, Product } from "@/components/jobs/builder/types";

export interface Estimate {
  id: string;
  estimate_number: string;
  job_id: string;
  date: string;
  status: string;
  total: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface UseEstimateBuilderParams {
  estimateId: string | null;
  open: boolean;
  onSyncToInvoice?: () => void;
  jobId: string;
}

export const useEstimateBuilder = (params: UseEstimateBuilderParams) => {
  const { estimateId, open, onSyncToInvoice, jobId } = params;
  
  const [isLoading, setIsLoading] = useState(false);
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [notes, setNotes] = useState("");
  const [estimateNumber, setEstimateNumber] = useState("");
  const [taxRate, setTaxRate] = useState(0);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Generate unique estimate number
  const generateEstimateNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `EST-${timestamp}-${random}`;
  };

  // Initialize estimate number on mount
  useEffect(() => {
    if (!estimateId && !estimateNumber) {
      setEstimateNumber(generateEstimateNumber());
    }
  }, [estimateId, estimateNumber]);

  // Load existing estimate if editing
  useEffect(() => {
    if (estimateId) {
      loadEstimate(estimateId);
    }
  }, [estimateId]);

  const loadEstimate = async (id: string) => {
    try {
      setIsLoading(true);
      
      const { data: estimateData, error: estimateError } = await supabase
        .from('estimates')
        .select('*')
        .eq('id', id)
        .single();
        
      if (estimateError) throw estimateError;
      
      const { data: itemsData, error: itemsError } = await supabase
        .from('line_items')
        .select('*')
        .eq('parent_id', id)
        .eq('parent_type', 'estimate');
        
      if (itemsError) throw itemsError;
      
      setEstimate(estimateData);
      setEstimateNumber(estimateData.estimate_number);
      setNotes(estimateData.notes || "");
      
      const transformedItems: LineItem[] = itemsData?.map(item => ({
        id: item.id,
        description: item.description || '',
        name: item.description || '',
        quantity: item.quantity || 1,
        unitPrice: Number(item.unit_price || 0),
        price: Number(item.unit_price || 0),
        taxable: item.taxable !== false,
        total: (item.quantity || 1) * Number(item.unit_price || 0),
        ourPrice: 0,
        discount: 0
      })) || [];
      
      setLineItems(transformedItems);
    } catch (error) {
      console.error('Error loading estimate:', error);
      toast.error('Failed to load estimate');
    } finally {
      setIsLoading(false);
    }
  };

  const saveEstimate = async () => {
    try {
      setIsLoading(true);
      
      const total = calculateGrandTotal();
      
      let savedEstimate: Estimate;
      
      if (estimateId) {
        // Update existing estimate
        const { data, error } = await supabase
          .from('estimates')
          .update({
            total,
            notes,
            updated_at: new Date().toISOString()
          })
          .eq('id', estimateId)
          .select()
          .single();
          
        if (error) throw error;
        savedEstimate = data;
      } else {
        // Create new estimate
        const { data, error } = await supabase
          .from('estimates')
          .insert({
            job_id: jobId,
            estimate_number: estimateNumber,
            total,
            status: 'draft',
            notes,
            date: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
          
        if (error) throw error;
        savedEstimate = data;
      }
      
      // Save line items
      if (lineItems.length > 0) {
        if (estimateId) {
          await supabase
            .from('line_items')
            .delete()
            .eq('parent_id', estimateId)
            .eq('parent_type', 'estimate');
        }
        
        const lineItemsToInsert = lineItems.map(item => ({
          parent_id: savedEstimate.id,
          parent_type: 'estimate',
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          taxable: item.taxable
        }));
        
        await supabase
          .from('line_items')
          .insert(lineItemsToInsert);
      }
      
      toast.success(`Estimate ${estimateNumber} saved successfully`);
      
      if (onSyncToInvoice) onSyncToInvoice();
      
      return savedEstimate;
    } catch (error) {
      console.error('Error saving estimate:', error);
      toast.error('Failed to save estimate');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = (product: Product) => {
    const newLineItem: LineItem = {
      id: `temp-${Date.now()}`,
      description: product.description || product.name,
      name: product.name,
      quantity: product.quantity || 1,
      unitPrice: product.price,
      price: product.price,
      taxable: product.taxable !== false,
      total: (product.quantity || 1) * product.price,
      ourPrice: product.ourPrice || 0,
      discount: 0
    };
    setLineItems(prev => [...prev, newLineItem]);
  };

  const handleUpdateLineItem = (id: string, updates: Partial<LineItem>) => {
    setLineItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, ...updates, total: (updates.quantity || item.quantity) * (updates.unitPrice || item.unitPrice) }
        : item
    ));
  };

  const handleRemoveLineItem = (id: string) => {
    setLineItems(prev => prev.filter(item => item.id !== id));
  };

  const addLineItem = (item: LineItem) => {
    setLineItems(prev => [...prev, { ...item, id: `temp-${Date.now()}` }]);
  };

  const removeLineItem = (id: string) => {
    setLineItems(prev => prev.filter(item => item.id !== id));
  };

  const updateLineItem = (id: string, updates: Partial<LineItem>) => {
    setLineItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, ...updates, total: (updates.quantity || item.quantity) * (updates.unitPrice || item.unitPrice) }
        : item
    ));
  };

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const calculateTotalTax = () => {
    const subtotal = calculateSubtotal();
    return subtotal * (taxRate / 100);
  };

  const calculateGrandTotal = () => {
    return calculateSubtotal() + calculateTotalTax();
  };

  const calculateTotalMargin = () => {
    return lineItems.reduce((sum, item) => {
      const cost = item.ourPrice || 0;
      const margin = (item.unitPrice - cost) * item.quantity;
      return sum + margin;
    }, 0);
  };

  const calculateMarginPercentage = () => {
    const total = calculateSubtotal();
    const margin = calculateTotalMargin();
    return total > 0 ? (margin / total) * 100 : 0;
  };

  const calculateTotal = () => {
    return calculateGrandTotal();
  };

  const saveEstimateChanges = async () => {
    return await saveEstimate();
  };

  return {
    isLoading,
    estimate,
    lineItems,
    notes,
    estimateNumber,
    taxRate,
    isPreviewMode,
    setNotes,
    setLineItems,
    setTaxRate,
    setIsPreviewMode,
    addLineItem,
    removeLineItem,
    updateLineItem,
    saveEstimate,
    saveEstimateChanges,
    calculateTotal,
    calculateSubtotal,
    calculateTotalTax,
    calculateGrandTotal,
    calculateTotalMargin,
    calculateMarginPercentage,
    handleAddProduct,
    handleUpdateLineItem,
    handleRemoveLineItem
  };
};
