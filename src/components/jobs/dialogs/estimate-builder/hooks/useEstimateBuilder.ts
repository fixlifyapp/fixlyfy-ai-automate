
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Estimate } from "@/hooks/useEstimates";

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
    estimateNumber: `EST-${Date.now()}`,
    items: [],
    notes: "",
    status: "draft",
    total: 0
  });
  
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

  const initializeFromEstimate = useCallback((estimate: Estimate) => {
    const getEstimateItems = async () => {
      try {
        const { data: lineItems, error } = await supabase
          .from('line_items')
          .select('*')
          .eq('parent_id', estimate.id)
          .eq('parent_type', 'estimate');
          
        if (error) throw error;
        
        const items = lineItems?.map(item => ({
          description: item.description || "",
          quantity: item.quantity || 1,
          unitPrice: item.unit_price || 0,
          taxable: item.taxable || true
        })) || [];
        
        updateFormData({
          estimateId: estimate.id,
          estimateNumber: estimate.estimate_number,
          items,
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
          total: formData.total,
          status: formData.status,
          notes: formData.notes
        })
        .select()
        .single();
        
      if (estimateError) throw estimateError;
      
      // Create line items
      if (formData.items.length > 0) {
        const lineItems = formData.items.map(item => ({
          parent_id: estimate.id,
          parent_type: 'estimate',
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          taxable: item.taxable
        }));
        
        const { error: lineItemsError } = await supabase
          .from('line_items')
          .insert(lineItems);
          
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
  }, [jobId, formData, updateFormData, isSubmitting]);

  const updateEstimate = useCallback(async (estimateId: string): Promise<Estimate | null> => {
    if (isSubmitting) return null;
    
    setIsSubmitting(true);
    
    try {
      // Update the estimate
      const { data: estimate, error: estimateError } = await supabase
        .from('estimates')
        .update({
          estimate_number: formData.estimateNumber,
          total: formData.total,
          status: formData.status,
          notes: formData.notes
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
      if (formData.items.length > 0) {
        const lineItems = formData.items.map(item => ({
          parent_id: estimateId,
          parent_type: 'estimate',
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          taxable: item.taxable
        }));
        
        const { error: lineItemsError } = await supabase
          .from('line_items')
          .insert(lineItems);
          
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
  }, [formData, isSubmitting]);

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

  return {
    formData,
    isSubmitting,
    isSending,
    updateFormData,
    createEstimate,
    updateEstimate,
    sendEstimate,
    resetForm,
    initializeFromEstimate
  };
};
