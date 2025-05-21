
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useClientProperties = (clientId?: string) => {
  const { toast } = useToast();
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      if (!clientId) {
        setProperties([]);
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // In a real application, you would fetch from a properties table
        // For now, we'll use the client's address as a property
        const { data, error } = await supabase
          .from('clients')
          .select('address, city, state, zip')
          .eq('id', clientId)
          .single();
          
        if (error) throw error;
        
        // Transform the client address into a property object
        if (data && data.address) {
          setProperties([{
            id: 1,
            address: data.address,
            city: data.city,
            state: data.state,
            zip: data.zip,
            type: 'Primary Location',
            lastService: new Date().toISOString().split('T')[0]
          }]);
        } else {
          setProperties([]);
        }
      } catch (error) {
        console.error("Error loading client properties:", error);
        toast({
          title: "Error",
          description: "Failed to load properties",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProperties();
  }, [clientId]);
  
  return {
    properties,
    isLoading,
  };
};
