
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Property } from "./useProperties";

export const useProperty = (propertyId?: string) => {
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!propertyId) {
      setProperty(null);
      return;
    }

    const fetchProperty = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('client_properties')
          .select('*')
          .eq('id', propertyId)
          .single();

        if (error) throw error;
        setProperty(data);
      } catch (error) {
        console.error('Error fetching property:', error);
        setProperty(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId]);

  return { property, isLoading };
};
