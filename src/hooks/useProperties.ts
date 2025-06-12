
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Property {
  id: string;
  client_id: string;
  property_name: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  property_type?: string;
  is_primary?: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const useProperties = (clientId?: string) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setIsLoading(true);
        let query = supabase.from('client_properties').select('*');
        
        if (clientId) {
          query = query.eq('client_id', clientId);
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        setProperties(data || []);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, [clientId]);

  return { properties, isLoading };
};
