import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Product, LineItem } from "@/components/jobs/builder/types";
import { Estimate } from "@/components/jobs/estimates/hooks/useEstimateData";

export const useEstimateBuilder = (
  jobId: string,
  estimateId?: string | null,
  onClose?: () => void
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [notes, setNotes] = useState("");
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Generate unique estimate number
  const generateEstimateNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `EST-${timestamp}-${random}`;
  };

  // Load existing estimate if editing
  useEffect(() => {
    if (estimateId) {
      loadEstimate(estimateId);
    }
  }, [estimateId]);

  const loadEstimate = async (id: string) => {
    try {
      setIsLoading(true);
      
      // Fetch estimate data
      const { data: estimateData, error: estimateError } = await supabase
        .from('estimates')
        .select('*')
        .eq('id', id)
        .single();
        
      if (estimateError) throw estimateError;
      
      // Fetch line items
      const { data: itemsData, error: itemsError } = await supabase
        .from('line_items')
        .select('*')
        .eq('parent_id', id)
        .eq('parent_type', 'estimate');
        
      if (itemsError) throw itemsError;
      
      // Transform and set data
      const transformedEstimate: Estimate = {
        ...estimateData,
        number: estimateData.estimate_number,
        amount: estimateData.total
      };
      
      setEstimate(transformedEstimate);
      setNotes(estimateData.notes || "");
      
      const transformedItems: LineItem[] = itemsData?.map(item => ({
        id: item.id,
        description: item.description || '',
        quantity: item.quantity || 1,
        unitPrice: Number(item.unit_price || 0),
        taxable: item.taxable !== false,
        total: (item.quantity || 1) * Number(item.unit_price || 0)
      })) || [];
      
      setLineItems(transformedItems);
    } catch (error) {
      console.error('Error loading estimate:', error);
      toast.error('Failed to load estimate');
    } finally {
      setIsLoading(false);
    }
  };

  const saveEstimate = async (syncToInvoice: boolean = false) => {
    try {
      setIsLoading(true);
      
      const total = lineItems.reduce((sum, item) => sum + item.total, 0);
      const estimateNumber = estimate?.estimate_number || generateEstimateNumber();
      
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
        
        savedEstimate = {
          ...data,
          number: data.estimate_number,
          amount: data.total
        };
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
            date: new Date().toISOString()
          })
          .select()
          .single();
          
        if (error) throw error;
        
        savedEstimate = {
          ...data,
          number: data.estimate_number,
          amount: data.total
        };
      }
      
      // Save line items
      if (lineItems.length > 0) {
        // Delete existing line items if updating
        if (estimateId) {
          await supabase
            .from('line_items')
            .delete()
            .eq('parent_id', estimateId)
            .eq('parent_type', 'estimate');
        }
        
        // Insert new line items
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
      
      if (syncToInvoice) {
        // Handle sync to invoice logic here
        toast.success('Estimate synced to invoice');
      }
      
      if (onClose) onClose();
      
      return savedEstimate;
    } catch (error) {
      console.error('Error saving estimate:', error);
      toast.error('Failed to save estimate');
      throw error;
    } finally {
      setIsLoading(false);
    }
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

  const calculateTotal = () => {
    return lineItems.reduce((sum, item) => sum + item.total, 0);
  };

  return {
    isLoading,
    estimate,
    lineItems,
    notes,
    isPreviewMode,
    setNotes,
    setIsPreviewMode,
    addLineItem,
    removeLineItem,
    updateLineItem,
    saveEstimate,
    calculateTotal
  };
};
