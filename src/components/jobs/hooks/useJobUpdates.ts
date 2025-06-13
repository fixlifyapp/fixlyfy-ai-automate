
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useJobUpdates = () => {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateJob = async (jobId: string, updates: any) => {
    setIsUpdating(true);
    try {
      const { data, error } = await supabase
        .from('jobs')
        .update(updates)
        .eq('id', jobId)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error updating job:', error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateJob,
    isUpdating
  };
};
