
import { supabase } from "@/integrations/supabase/client";

// Starting values for each entity type - simplified numbering
const STARTING_VALUES = {
  job: 2000,
  estimate: 2000,
  invoice: 2000,
  client: 2000
};

// Simple prefixes for each entity type
const PREFIXES = {
  job: 'J',
  estimate: 'E',
  invoice: 'I',
  client: 'C'
};

export const generateNextId = async (entityType: 'job' | 'estimate' | 'invoice' | 'client'): Promise<string> => {
  try {
    // First, check if we have a counter for this entity type
    const { data: counter, error: fetchError } = await supabase
      .from('id_counters')
      .select('*')
      .eq('entity_type', entityType)
      .single();

    let nextNumber: number;

    if (fetchError && fetchError.code === 'PGRST116') {
      // No counter exists, create one with starting value
      nextNumber = STARTING_VALUES[entityType];
      
      await supabase
        .from('id_counters')
        .insert({
          entity_type: entityType,
          prefix: PREFIXES[entityType],
          current_value: nextNumber,
          start_value: STARTING_VALUES[entityType]
        });
    } else if (counter) {
      // Counter exists, increment it
      nextNumber = counter.current_value + 1;
      
      await supabase
        .from('id_counters')
        .update({ current_value: nextNumber })
        .eq('entity_type', entityType);
    } else {
      throw new Error('Unexpected error fetching counter');
    }

    // Return just the number for estimates (simpler format)
    if (entityType === 'estimate') {
      return nextNumber.toString();
    }

    return `${PREFIXES[entityType]}-${nextNumber}`;
  } catch (error) {
    console.error(`Error generating ${entityType} ID:`, error);
    // Fallback to random number if database operation fails
    const fallbackNumber = Math.floor(Math.random() * 9999) + STARTING_VALUES[entityType];
    
    if (entityType === 'estimate') {
      return fallbackNumber.toString();
    }
    
    return `${PREFIXES[entityType]}-${fallbackNumber}`;
  }
};

// Function for simple sequential numbers (used in estimate/invoice builders)
export const generateSimpleNumber = async (entityType: 'estimate' | 'invoice'): Promise<string> => {
  return await generateNextId(entityType);
};
