
import { supabase } from "@/integrations/supabase/client";

export const generateNextId = async (entityType: 'job' | 'estimate' | 'invoice' | 'client'): Promise<string> => {
  try {
    const { data, error } = await supabase.rpc('generate_next_id', {
      p_entity_type: entityType
    });

    if (error) {
      console.error(`Error generating ${entityType} ID:`, error);
      // Fallback to simple incremental numbers
      const fallbackNumber = Math.floor(Math.random() * 9999) + 1;
      const prefixes = { job: 'J', estimate: 'E', invoice: 'I', client: 'C' };
      return `${prefixes[entityType]}-${fallbackNumber}`;
    }

    return data;
  } catch (error) {
    console.error(`Error generating ${entityType} ID:`, error);
    // Fallback to simple incremental numbers
    const fallbackNumber = Math.floor(Math.random() * 9999) + 1;
    const prefixes = { job: 'J', estimate: 'E', invoice: 'I', client: 'C' };
    return `${prefixes[entityType]}-${fallbackNumber}`;
  }
};

// Function for simple sequential numbers (used in estimate/invoice builders)
export const generateSimpleNumber = (entityType: 'estimate' | 'invoice'): string => {
  const timestamp = Date.now();
  const shortNumber = timestamp.toString().slice(-4); // Last 4 digits
  const prefixes = { estimate: 'E', invoice: 'I' };
  return `${prefixes[entityType]}-${shortNumber}`;
};
