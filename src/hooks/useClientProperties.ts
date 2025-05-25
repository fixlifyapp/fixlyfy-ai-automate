
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ClientProperty, CreatePropertyInput, UpdatePropertyInput } from "@/types/property";

export const useClientProperties = (clientId?: string) => {
  const [properties, setProperties] = useState<ClientProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchProperties = async () => {
      if (!clientId) {
        setProperties([]);
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('client_properties')
          .select('*')
          .eq('client_id', clientId)
          .order('is_primary', { ascending: false })
          .order('created_at', { ascending: true });
          
        if (error) throw error;
        
        setProperties(data || []);
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
  }, [clientId, refreshTrigger]);

  const addProperty = async (propertyData: CreatePropertyInput) => {
    try {
      // If setting as primary, first unset any existing primary
      if (propertyData.is_primary) {
        await supabase
          .from('client_properties')
          .update({ is_primary: false })
          .eq('client_id', propertyData.client_id);
      }

      const { data, error } = await supabase
        .from('client_properties')
        .insert(propertyData)
        .select()
        .single();
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Property added successfully"
      });
      
      setRefreshTrigger(prev => prev + 1);
      return data;
    } catch (error) {
      console.error('Error adding property:', error);
      toast({
        title: "Error",
        description: "Failed to add property",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateProperty = async (propertyId: string, updates: UpdatePropertyInput) => {
    try {
      // If setting as primary, first unset any existing primary
      if (updates.is_primary) {
        const property = properties.find(p => p.id === propertyId);
        if (property) {
          await supabase
            .from('client_properties')
            .update({ is_primary: false })
            .eq('client_id', property.client_id)
            .neq('id', propertyId);
        }
      }

      const { data, error } = await supabase
        .from('client_properties')
        .update(updates)
        .eq('id', propertyId)
        .select()
        .single();
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Property updated successfully"
      });
      
      setRefreshTrigger(prev => prev + 1);
      return data;
    } catch (error) {
      console.error('Error updating property:', error);
      toast({
        title: "Error",
        description: "Failed to update property",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteProperty = async (propertyId: string) => {
    try {
      // Check if this property has any jobs associated with it
      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select('id')
        .eq('property_id', propertyId)
        .limit(1);

      if (jobsError) throw jobsError;

      if (jobs && jobs.length > 0) {
        toast({
          title: "Cannot Delete",
          description: "This property has jobs associated with it. Please reassign or delete those jobs first.",
          variant: "destructive"
        });
        return false;
      }

      const { error } = await supabase
        .from('client_properties')
        .delete()
        .eq('id', propertyId);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Property deleted successfully"
      });
      
      setRefreshTrigger(prev => prev + 1);
      return true;
    } catch (error) {
      console.error('Error deleting property:', error);
      toast({
        title: "Error",
        description: "Failed to delete property",
        variant: "destructive"
      });
      return false;
    }
  };

  const setPrimaryProperty = async (propertyId: string) => {
    return updateProperty(propertyId, { is_primary: true });
  };

  const getPrimaryProperty = () => {
    return properties.find(p => p.is_primary);
  };

  return {
    properties,
    isLoading,
    addProperty,
    updateProperty,
    deleteProperty,
    setPrimaryProperty,
    getPrimaryProperty,
    refreshProperties: () => setRefreshTrigger(prev => prev + 1)
  };
};
