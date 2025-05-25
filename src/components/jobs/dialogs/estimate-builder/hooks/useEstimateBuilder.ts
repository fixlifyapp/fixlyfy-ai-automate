
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Estimate } from "@/hooks/useEstimates";
import { Product, LineItem } from "@/components/jobs/builder/types";

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

interface UseEstimateBuilderProps {
  estimateId: string | null;
  open: boolean;
  onSyncToInvoice?: () => void;
  jobId: string;
}

export const useEstimateBuilder = ({ estimateId, open, onSyncToInvoice, jobId }: UseEstimateBuilderProps) => {
  const [formData, setFormData] = useState<EstimateFormData>({
    estimateNumber: `EST-${Date.now()}`,
    items: [],
    notes: "",
    status: "draft",
    total: 0
  });
  
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [taxRate, setTaxRate] = useState<number>(13);
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const updateFormData = useCallback((updates: Partial<EstimateFormData>) => {
    setFormData(prev => {
      const updated = { ...prev, ...updates };
      
      // Recalculate total when items change
      if (updates.items) {
        updated.total = updates.items.reduce((sum, item) => {
          const itemTotal = item.quantity * item.unitPrice;
          return sum + (item.taxable ? itemTotal * 1.13 : itemTotal); // 13% tax
        }, 0);
      }
      
      return updated;
    });
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

  const calculateTotalMargin = useCallback(() => {
    return lineItems.reduce((sum, item) => {
      const itemMargin = (item.unitPrice - (item.ourPrice || 0)) * item.quantity;
      return sum + itemMargin;
    }, 0);
  }, [lineItems]);

  const calculateMarginPercentage = useCallback(() => {
    const totalRevenue = calculateSubtotal();
    const totalMargin = calculateTotalMargin();
    return totalRevenue > 0 ? (totalMargin / totalRevenue) * 100 : 0;
  }, [calculateSubtotal, calculateTotalMargin]);

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
        updateFormData({
          estimateId: estimate.id,
          estimateNumber: estimate.estimate_number,
          items: lineItemsData?.map(item => ({
            description: item.description || "",
            quantity: item.quantity || 1,
            unitPrice: item.unit_price || 0,
            taxable: item.taxable || true
          })) || [],
          notes: estimate.notes || "",
          status: estimate.status,
          total: estimate.total || 0
        });
      } catch (error) {
        console.error("Error loading estimate items:", error);
        toast.error("Failed to load estimate items");
      }
    };
    
    getEstimateItems();
  }, [updateFormData]);

  const resetForm = useCallback(() => {
    setFormData({
      estimateNumber: `EST-${Date.now()}`,
      items: [],
      notes: "",
      status: "draft",
      total: 0
    });
    setLineItems([]);
    setNotes("");
  }, []);

  const createEstimate = useCallback(async (): Promise<Estimate | null> => {
    if (isSubmitting) return null; // Prevent duplicate submissions
    
    setIsSubmitting(true);
    
    try {
      // Create the estimate
      const { data: estimate, error: estimateError } = await supabase
        .from('estimates')
        .insert({
          job_id: jobId,
          estimate_number: formData.estimateNumber,
          total: calculateGrandTotal(),
          status: formData.status,
          notes: notes
        })
        .select()
        .single();
        
      if (estimateError) throw estimateError;
      
      // Create line items from lineItems state
      if (lineItems.length > 0) {
        const lineItemsData = lineItems.map(item => ({
          parent_id: estimate.id,
          parent_type: 'estimate',
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          taxable: item.taxable
        }));
        
        const { error: lineItemsError } = await supabase
          .from('line_items')
          .insert(lineItemsData);
          
        if (lineItemsError) throw lineItemsError;
      }
      
      // Update form data with the created estimate ID
      updateFormData({ estimateId: estimate.id });
      
      toast.success("Estimate created successfully");
      return {
        id: estimate.id,
        job_id: estimate.job_id,
        estimate_number: estimate.estimate_number,
        date: estimate.date || estimate.created_at,
        total: estimate.total,
        status: estimate.status,
        created_at: estimate.created_at,
        updated_at: estimate.updated_at
      };
    } catch (error) {
      console.error("Error creating estimate:", error);
      toast.error("Failed to create estimate");
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [jobId, formData, lineItems, notes, calculateGrandTotal, updateFormData, isSubmitting]);

  const updateEstimate = useCallback(async (estimateId: string): Promise<Estimate | null> => {
    if (isSubmitting) return null;
    
    setIsSubmitting(true);
    
    try {
      // Update the estimate
      const { data: estimate, error: estimateError } = await supabase
        .from('estimates')
        .update({
          estimate_number: formData.estimateNumber,
          total: calculateGrandTotal(),
          status: formData.status,
          notes: notes
        })
        .eq('id', estimateId)
        .select()
        .single();
        
      if (estimateError) throw estimateError;
      
      // Delete existing line items
      const { error: deleteError } = await supabase
        .from('line_items')
        .delete()
        .eq('parent_id', estimateId)
        .eq('parent_type', 'estimate');
        
      if (deleteError) throw deleteError;
      
      // Create new line items
      if (lineItems.length > 0) {
        const lineItemsData = lineItems.map(item => ({
          parent_id: estimateId,
          parent_type: 'estimate',
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          taxable: item.taxable
        }));
        
        const { error: lineItemsError } = await supabase
          .from('line_items')
          .insert(lineItemsData);
          
        if (lineItemsError) throw lineItemsError;
      }
      
      toast.success("Estimate updated successfully");
      return {
        id: estimate.id,
        job_id: estimate.job_id,
        estimate_number: estimate.estimate_number,
        date: estimate.date || estimate.created_at,
        total: estimate.total,
        status: estimate.status,
        created_at: estimate.created_at,
        updated_at: estimate.updated_at
      };
    } catch (error) {
      console.error("Error updating estimate:", error);
      toast.error("Failed to update estimate");
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, lineItems, notes, calculateGrandTotal, isSubmitting]);

  const sendEstimate = useCallback(async (
    estimateId: string,
    recipient: string,
    method: 'email' | 'sms',
    customMessage?: string
  ) => {
    if (isSending) {
      toast.error("Estimate is already being sent");
      return false;
    }
    
    setIsSending(true);
    
    // Immediately show sending feedback
    toast.info(`Sending estimate via ${method}...`, {
      duration: 2000
    });
    
    try {
      // Get estimate details
      const { data: estimateDetails, error: estimateError } = await supabase
        .from('estimate_details_view')
        .select('*')
        .eq('estimate_id', estimateId)
        .single();
        
      if (estimateError) throw estimateError;
      
      // Create communication record
      const communicationData = {
        estimate_id: estimateId,
        communication_type: method,
        recipient,
        subject: method === 'email' ? `Estimate ${estimateDetails.estimate_number}` : null,
        content: customMessage || `Your estimate ${estimateDetails.estimate_number} is ready for review.`,
        status: 'pending',
        estimate_number: estimateDetails.estimate_number,
        client_name: estimateDetails.client_name,
        client_email: estimateDetails.client_email,
        client_phone: estimateDetails.client_phone
      };
      
      const { error: commError } = await supabase
        .from('estimate_communications')
        .insert(communicationData);
        
      if (commError) throw commError;
      
      // Immediate success feedback
      toast.success(`Estimate sent successfully via ${method}!`);
      return true;
    } catch (error) {
      console.error("Error sending estimate:", error);
      toast.error(`Failed to send estimate via ${method}`);
      return false;
    } finally {
      setIsSending(false);
    }
  }, [isSending]);

  const saveEstimateChanges = useCallback(async () => {
    if (formData.estimateId) {
      return await updateEstimate(formData.estimateId);
    } else {
      return await createEstimate();
    }
  }, [formData.estimateId, updateEstimate, createEstimate]);

  return {
    formData,
    lineItems,
    taxRate,
    notes,
    estimateNumber: formData.estimateNumber,
    isSubmitting,
    isSending,
    setLineItems,
    setTaxRate,
    setNotes,
    updateFormData,
    handleAddProduct,
    handleRemoveLineItem,
    handleUpdateLineItem,
    calculateSubtotal,
    calculateTotalTax,
    calculateGrandTotal,
    calculateTotalMargin,
    calculateMarginPercentage,
    createEstimate,
    updateEstimate,
    sendEstimate,
    saveEstimateChanges,
    resetForm,
    initializeFromEstimate
  };
};
