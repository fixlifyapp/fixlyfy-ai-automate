
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Client {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  tags?: string[];
  type?: string;
  status?: string;
  notes?: string;
  rating?: number;
  created_at?: string;
  updated_at?: string;
}

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchClients = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setClients(data || []);
      } catch (error) {
        console.error('Error fetching clients:', error);
        toast.error('Failed to load clients');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchClients();
  }, [refreshTrigger]);

  // Generate a new client ID in the format C-XXXX
  const generateClientId = async (): Promise<string> => {
    try {
      // Get the highest existing client ID
      const { data, error } = await supabase
        .from('clients')
        .select('id')
        .order('id', { ascending: false })
        .limit(1);
        
      if (error) throw error;
      
      let nextIdNumber = 1001; // Default starting number
      
      if (data && data.length > 0) {
        const lastId = data[0].id;
        if (lastId && lastId.startsWith('C-')) {
          const lastNumber = parseInt(lastId.substring(2), 10);
          if (!isNaN(lastNumber)) {
            nextIdNumber = lastNumber + 1;
          }
        }
      }
      
      return `C-${nextIdNumber}`;
    } catch (error) {
      console.error('Error generating client ID:', error);
      // Fallback to a timestamp-based ID if there's an error
      return `C-${1001 + Math.floor(Math.random() * 9000)}`;
    }
  };

  // Update the type to accept partial client data with name as required
  const addClient = async (client: { name: string } & Partial<Omit<Client, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      // Generate a new client ID
      const clientId = await generateClientId();
      
      // Add the ID to the client data
      const clientWithId = { ...client, id: clientId };
      
      const { data, error } = await supabase
        .from('clients')
        .insert(clientWithId)
        .select()
        .single();
        
      if (error) throw error;
      
      setClients(prev => [data, ...prev]);
      toast.success('Client added successfully');
      return data;
    } catch (error) {
      console.error('Error adding client:', error);
      toast.error('Failed to add client');
      throw error;
    }
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      
      setClients(prev => prev.map(client => 
        client.id === id ? { ...client, ...data } : client
      ));
      
      toast.success('Client updated successfully');
      return data;
    } catch (error) {
      console.error('Error updating client:', error);
      toast.error('Failed to update client');
      return null;
    }
  };

  const deleteClient = async (id: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setClients(prev => prev.filter(client => client.id !== id));
      toast.success('Client deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error('Failed to delete client');
      return false;
    }
  };

  return {
    clients,
    isLoading,
    addClient,
    updateClient,
    deleteClient,
    refreshClients: () => setRefreshTrigger(prev => prev + 1)
  };
};
