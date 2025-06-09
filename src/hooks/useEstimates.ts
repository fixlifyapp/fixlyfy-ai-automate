
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Estimate {
  id: string;
  estimate_number: string;
  job_id: string;
  client_id?: string;
  title?: string;
  description?: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';
  total: number;
  subtotal: number;
  tax_rate?: number;
  tax_amount?: number;
  discount_amount?: number;
  items: any[];
  notes?: string;
  terms?: string;
  valid_until?: string;
  sent_at?: string;
  approved_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export const useEstimates = (jobId?: string) => {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEstimates = async () => {
    if (!jobId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('estimates')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (jobId) {
        query = query.eq('job_id', jobId);
      }
      
      const { data, error: fetchError } = await query;
      
      if (fetchError) throw fetchError;
      
      setEstimates(data || []);
    } catch (err) {
      console.error('Error fetching estimates:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch estimates');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshEstimates = async () => {
    await fetchEstimates();
  };

  const createEstimate = async (estimateData: Partial<Estimate>) => {
    try {
      // Generate estimate number
      const { data: nextIdData } = await supabase.rpc('generate_next_id', { 
        p_entity_type: 'estimate' 
      });
      
      const newEstimate = {
        ...estimateData,
        estimate_number: nextIdData || `EST-${Date.now()}`,
        job_id: jobId || estimateData.job_id,
      };

      const { data, error } = await supabase
        .from('estimates')
        .insert([newEstimate])
        .select()
        .single();

      if (error) throw error;
      
      await refreshEstimates();
      return data;
    } catch (err) {
      console.error('Error creating estimate:', err);
      throw err;
    }
  };

  const updateEstimate = async (id: string, updates: Partial<Estimate>) => {
    try {
      const { data, error } = await supabase
        .from('estimates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      await refreshEstimates();
      return data;
    } catch (err) {
      console.error('Error updating estimate:', err);
      throw err;
    }
  };

  const deleteEstimate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('estimates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await refreshEstimates();
    } catch (err) {
      console.error('Error deleting estimate:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchEstimates();
  }, [jobId]);

  return {
    estimates,
    setEstimates,
    isLoading,
    error,
    refetch: refreshEstimates,
    refreshEstimates,
    createEstimate,
    updateEstimate,
    deleteEstimate
  };
};
