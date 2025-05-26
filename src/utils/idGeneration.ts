
import { supabase } from "@/integrations/supabase/client";

export const generateNextId = async (entityType: 'job' | 'estimate' | 'invoice' | 'client'): Promise<string> => {
  try {
    const { data, error } = await supabase.rpc('generate_next_id', {
      p_entity_type: entityType
    });

    if (error) {
      console.error(`Error generating ${entityType} ID:`, error);
      // Fallback to timestamp-based ID if database function fails
      const timestamp = Date.now();
      const prefixes = { job: 'J-', estimate: 'E-', invoice: 'I-', client: 'C-' };
      return `${prefixes[entityType]}${timestamp}`;
    }

    return data;
  } catch (error) {
    console.error(`Error generating ${entityType} ID:`, error);
    // Fallback to timestamp-based ID
    const timestamp = Date.now();
    const prefixes = { job: 'J-', estimate: 'E-', invoice: 'I-', client: 'C-' };
    return `${prefixes[entityType]}${timestamp}`;
  }
};
