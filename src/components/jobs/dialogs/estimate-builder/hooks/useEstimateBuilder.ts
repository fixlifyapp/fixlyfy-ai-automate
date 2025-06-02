
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Estimate } from "@/hooks/useEstimates";
import { Product, LineItem } from "@/components/jobs/builder/types";
import { generateNextId } from "@/utils/idGeneration";

interface EstimateDetails {
  estimate_number: string;
  notes?: string;
}

export const useEstimateBuilder = (jobId: string, estimateId?: string) => {
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [estimateDetails, setEstimateDetails] = useState<EstimateDetails>({
    estimate_number: "",
    notes: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  // Generate estimate number on component mount
  useEffect(() => {
    const generateEstimateNumber = async () => {
      try {
        const estimateNumber = await generateNextId('estimate');
        setEstimateDetails(prev => ({
          ...prev,
          estimate_number: estimateNumber
        }));
      } catch (error) {
        console.error('Error generating estimate number:', error);
        // Fallback to timestamp-based number
        const timestamp = Date.now();
        const shortNumber = timestamp.toString().slice(-4);
        setEstimateDetails(prev => ({
          ...prev,
          estimate_number: `E-${shortNumber}`
        }));
      }
    };

    if (!estimateId) {
      generateEstimateNumber();
    }
  }, [estimateId]);

  // Load existing estimate if editing
  useEffect(() => {
    if (estimateId) {
      loadEstimate();
    }
  }, [estimateId]);

  const loadEstimate = async () => {
    if (!estimateId) return;
    
    setIsLoading(true);
    try {
      // Load estimate details
      const { data: estimate, error: estimateError } = await supabase
        .from('estimates')
        .select('*')
        .eq('id', estimateId)
        .single();

      if (estimateError) throw estimateError;

      setEstimateDetails({
        estimate_number: estimate.estimate_number,
        notes: estimate.notes || ""
      });

      // Load line items
      const { data: lineItemsData, error: lineItemsError } = await supabase
        .from('line_items')
        .select('*')
        .eq('parent_id', estimateId)
        .eq('parent_type', 'estimate');

      if (lineItemsError) throw lineItemsError;

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
    } catch (error) {
      console.error("Error loading estimate:", error);
      toast.error("Failed to load estimate");
    } finally {
      setIsLoading(false);
    }
  };

  const addLineItem = useCallback((item: Partial<LineItem>) => {
    const newLineItem: LineItem = {
      id: `item-${Date.now()}`,
      description: item.description || "",
      quantity: item.quantity || 1,
      unitPrice: item.unitPrice || 0,
      taxable: item.taxable !== undefined ? item.taxable : true,
      discount: 0,
      ourPrice: 0,
      name: item.description || "",
      price: item.unitPrice || 0,
      total: (item.quantity || 1) * (item.unitPrice || 0)
    };
    
    setLineItems(prev => [...prev, newLineItem]);
  }, []);

  const updateLineItem = useCallback((id: string, updates: Partial<LineItem>) => {
    setLineItems(prev => prev.map(item => 
      item.id === id 
        ? { 
            ...item, 
            ...updates, 
            total: (updates.quantity !== undefined ? updates.quantity : item.quantity) * 
                   (updates.unitPrice !== undefined ? updates.unitPrice : item.unitPrice)
          }
        : item
    ));
  }, []);

  const removeLineItem = useCallback((id: string) => {
    setLineItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const updateEstimateDetails = useCallback((updates: Partial<EstimateDetails>) => {
    setEstimateDetails(prev => ({ ...prev, ...updates }));
  }, []);

  const calculateTotal = useCallback(() => {
    return lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  }, [lineItems]);

  const saveEstimate = useCallback(async (): Promise<boolean> => {
    if (isLoading) return false;
    
    setIsLoading(true);
    
    try {
      const estimateData = {
        job_id: jobId,
        estimate_number: estimateDetails.estimate_number,
        total: calculateTotal(),
        status: 'draft',
        notes: estimateDetails.notes
      };

      let estimate;
      if (estimateId) {
        // Update existing estimate
        const { data, error } = await supabase
          .from('estimates')
          .update(estimateData)
          .eq('id', estimateId)
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
      
      toast.success(estimateId ? "Estimate updated successfully" : "Estimate created successfully");
      return true;
    } catch (error) {
      console.error("Error saving estimate:", error);
      toast.error("Failed to save estimate");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [jobId, estimateDetails, lineItems, calculateTotal, isLoading, estimateId]);

  return {
    lineItems,
    estimateDetails,
    isLoading,
    addLineItem,
    updateLineItem,
    removeLineItem,
    updateEstimateDetails,
    saveEstimate,
    total: calculateTotal()
  };
};
