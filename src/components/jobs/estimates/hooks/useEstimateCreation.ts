
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LineItem, lineItemsToJson } from '../../builder/types';

interface CreateEstimateData {
  jobId: string;
  estimateNumber: string;
  lineItems: LineItem[];
  notes: string;
  taxRate: number;
}

interface UpdateEstimateData extends CreateEstimateData {
  // Additional fields for update
}

export const useEstimateCreation = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const createEstimate = async (data: CreateEstimateData) => {
    setIsCreating(true);
    try {
      const subtotal = data.lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      const taxAmount = subtotal * data.taxRate;
      const total = subtotal + taxAmount;

      const estimateData = {
        job_id: data.jobId,
        estimate_number: data.estimateNumber,
        total,
        subtotal,
        tax_rate: data.taxRate,
        tax_amount: taxAmount,
        items: lineItemsToJson(data.lineItems) as any,
        notes: data.notes,
        status: 'draft' as const
      };

      const { data: estimate, error } = await supabase
        .from('estimates')
        .insert([estimateData])
        .select()
        .single();

      if (error) throw error;

      toast.success('Estimate created successfully');
      return estimate;
    } catch (error) {
      console.error('Error creating estimate:', error);
      toast.error('Failed to create estimate');
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const updateEstimate = async (estimateId: string, data: UpdateEstimateData) => {
    setIsUpdating(true);
    try {
      const subtotal = data.lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      const taxAmount = subtotal * data.taxRate;
      const total = subtotal + taxAmount;

      const estimateData = {
        estimate_number: data.estimateNumber,
        total,
        subtotal,
        tax_rate: data.taxRate,
        tax_amount: taxAmount,
        items: lineItemsToJson(data.lineItems) as any,
        notes: data.notes,
        updated_at: new Date().toISOString()
      };

      const { data: estimate, error } = await supabase
        .from('estimates')
        .update(estimateData)
        .eq('id', estimateId)
        .select()
        .single();

      if (error) throw error;

      toast.success('Estimate updated successfully');
      return estimate;
    } catch (error) {
      console.error('Error updating estimate:', error);
      toast.error('Failed to update estimate');
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    createEstimate,
    updateEstimate,
    isCreating,
    isUpdating
  };
};
