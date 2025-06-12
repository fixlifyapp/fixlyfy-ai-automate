
import { supabase } from '@/integrations/supabase/client';

export const generateNextId = async (entityType: string): Promise<string> => {
  try {
    const { data, error } = await supabase
      .rpc('generate_next_id', { p_entity_type: entityType });

    if (error) {
      console.error('Error generating ID:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in generateNextId:', error);
    // Fallback to timestamp-based ID
    const prefix = entityType === 'estimate' ? 'EST' : 'INV';
    return `${prefix}-${Date.now()}`;
  }
};
