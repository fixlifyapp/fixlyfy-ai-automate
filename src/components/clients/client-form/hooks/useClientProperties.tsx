
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
        
        // Fetch properties from the client_properties table
        const { data: propertiesData, error: propertiesError } = await supabase
          .from('client_properties')
          .select('*')
          .eq('client_id', clientId);
          
        if (propertiesError) throw propertiesError;
        
        if (propertiesData && propertiesData.length > 0) {
          // Format properties for display
          const formattedProperties = propertiesData.map(property => ({
            id: property.id,
            address: property.address,
            city: property.city,
            state: property.state,
            zip: property.zip,
            type: property.property_type || 'Property',
            name: property.property_name,
            lastService: property.updated_at?.split('T')[0] || 'Not available',
            isPrimary: property.is_primary
          }));
          
          setProperties(formattedProperties);
        } else {
          // If no properties exist, create one from client address as fallback
          const { data: clientData, error: clientError } = await supabase
            .from('clients')
            .select('address, city, state, zip, name')
            .eq('id', clientId)
            .single();
            
          if (clientError) throw clientError;
          
          if (clientData && clientData.address) {
            setProperties([{
              id: 'client-address',
              address: clientData.address,
              city: clientData.city,
              state: clientData.state,
              zip: clientData.zip,
              type: 'Primary Location',
              name: `${clientData.name} - Primary`,
              lastService: 'Not available',
              isPrimary: true
            }]);
          } else {
            setProperties([]);
          }
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
