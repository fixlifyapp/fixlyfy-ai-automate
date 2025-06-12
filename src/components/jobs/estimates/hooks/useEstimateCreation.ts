
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LineItem } from '../../builder/types';

interface CreateEstimateData {
  jobId: string;
  estimateNumber: string;
  lineItems: LineItem[];
  notes: string;
  taxRate: number;
}

export const useEstimateCreation = () => {
  const [isCreating, setIsCreating] = useState(false);

  const createEstimate = async (data: CreateEstimateData) => {
    setIsCreating(true);
    try {
      const { jobId, estimateNumber, lineItems, notes, taxRate } = data;

      // Calculate totals
      const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      const taxAmount = subtotal * taxRate;
      const total = subtotal + taxAmount;

      // Create estimate
      const { data: estimate, error } = await supabase
        .from('estimates')
        .insert({
          job_id: jobId,
          estimate_number: estimateNumber,
          total,
          subtotal,
          tax_amount: taxAmount,
          tax_rate: taxRate,
          status: 'draft',
          notes,
          items: lineItems,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Estimate created successfully');
      return {
        ...estimate,
        date: estimate.created_at, // Add date alias for compatibility
        number: estimate.estimate_number,
        amount: estimate.total
      };
    } catch (error: any) {
      console.error('Error creating estimate:', error);
      toast.error('Failed to create estimate: ' + error.message);
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const updateEstimate = async (estimateId: string, data: Partial<CreateEstimateData>) => {
    setIsCreating(true);
    try {
      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (data.lineItems) {
        const subtotal = data.lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        const taxAmount = subtotal * (data.taxRate || 0);
        const total = subtotal + taxAmount;

        updateData.items = data.lineItems;
        updateData.total = total;
        updateData.subtotal = subtotal;
        updateData.tax_amount = taxAmount;
        if (data.taxRate !== undefined) updateData.tax_rate = data.taxRate;
      }

      if (data.notes !== undefined) updateData.notes = data.notes;

      const { data: estimate, error } = await supabase
        .from('estimates')
        .update(updateData)
        .eq('id', estimateId)
        .select()
        .single();

      if (error) throw error;

      toast.success('Estimate updated successfully');
      return {
        ...estimate,
        date: estimate.created_at, // Add date alias for compatibility
        number: estimate.estimate_number,
        amount: estimate.total
      };
    } catch (error: any) {
      console.error('Error updating estimate:', error);
      toast.error('Failed to update estimate: ' + error.message);
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createEstimate,
    updateEstimate,
    isCreating
  };
};
