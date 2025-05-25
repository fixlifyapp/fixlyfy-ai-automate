
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { HistoryItem, HistoryItemInput } from '@/types/job-history';

export const useJobHistory = (jobId: string) => {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHistory = async () => {
    if (!jobId) return;
    
    try {
      const { data, error } = await supabase
        .from('job_history')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHistoryItems(data || []);
    } catch (error) {
      console.error('Error fetching job history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addHistoryItem = async (item: HistoryItemInput) => {
    try {
      const { data, error } = await supabase
        .from('job_history')
        .insert([item])
        .select()
        .single();

      if (error) throw error;
      
      setHistoryItems(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error adding history item:', error);
      throw error;
    }
  };

  const refreshHistory = () => {
    fetchHistory();
  };

  useEffect(() => {
    fetchHistory();
  }, [jobId]);

  return {
    historyItems,
    isLoading,
    addHistoryItem,
    refreshHistory
  };
};
