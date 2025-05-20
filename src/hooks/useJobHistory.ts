
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useRBAC } from '@/components/auth/RBACProvider';

export interface HistoryItem {
  id: string;
  job_id: string;
  user_id?: string;
  user_name?: string;
  type: string;
  title: string;
  description: string;
  meta?: Record<string, any>;
  visibility?: 'all' | 'restricted';
  created_at: string;
}

export const useJobHistory = (jobId: string) => {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pinnedItems, setPinnedItems] = useState<string[]>([]);
  const [showRestrictedItems, setShowRestrictedItems] = useState(false);
  const { hasPermission, currentUser } = useRBAC();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchHistoryItems = async () => {
      if (!jobId) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('job_history')
          .select('*')
          .eq('job_id', jobId)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Convert the data to HistoryItem type with proper visibility handling
        const typedData: HistoryItem[] = data?.map(item => ({
          ...item,
          meta: item.meta as unknown as Record<string, any>,
          visibility: (item.visibility as 'all' | 'restricted') || 'all'
        })) || [];
        
        setHistoryItems(typedData);
        
        // Fetch pinned items from local storage
        const storedPinnedItems = localStorage.getItem(`pinned_history_${jobId}`);
        if (storedPinnedItems) {
          setPinnedItems(JSON.parse(storedPinnedItems));
        }
      } catch (error) {
        console.error('Error fetching job history:', error);
        toast.error('Failed to load job history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistoryItems();
  }, [jobId, refreshTrigger]);

  const addHistoryItem = async (item: Omit<HistoryItem, 'id' | 'created_at'>) => {
    try {
      // Add current user info to the history item
      const historyItem = {
        ...item,
        user_id: currentUser?.id,
        user_name: currentUser?.name
      };
      
      const { data, error } = await supabase
        .from('job_history')
        .insert(historyItem)
        .select()
        .single();
        
      if (error) throw error;
      
      // Convert to HistoryItem type with proper visibility handling
      const typedData: HistoryItem = {
        ...data,
        meta: data.meta as unknown as Record<string, any>,
        visibility: (data.visibility as 'all' | 'restricted') || 'all'
      };
      
      // Update local state
      setHistoryItems(prev => [typedData, ...prev]);
      return typedData;
    } catch (error) {
      console.error('Error adding history item:', error);
      toast.error('Failed to record history');
      return null;
    }
  };

  const updateHistoryItem = async (id: string, updates: Partial<HistoryItem>) => {
    try {
      const { data, error } = await supabase
        .from('job_history')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      
      // Convert to HistoryItem type with proper visibility handling
      const typedData: HistoryItem = {
        ...data,
        meta: data.meta as unknown as Record<string, any>,
        visibility: (data.visibility as 'all' | 'restricted') || 'all'
      };
      
      // Update local state
      setHistoryItems(prev => prev.map(item => 
        item.id === id ? typedData : item
      ));
      
      return typedData;
    } catch (error) {
      console.error('Error updating history item:', error);
      toast.error('Failed to update history');
      return null;
    }
  };

  const deleteHistoryItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('job_history')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      setHistoryItems(prev => prev.filter(item => item.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting history item:', error);
      toast.error('Failed to delete history');
      return false;
    }
  };

  const togglePinnedItem = (id: string) => {
    setPinnedItems(prev => {
      const newPinnedItems = prev.includes(id)
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id];
      
      // Store in local storage
      localStorage.setItem(`pinned_history_${jobId}`, JSON.stringify(newPinnedItems));
      
      return newPinnedItems;
    });
  };

  const canViewItem = (item: HistoryItem) => {
    // Admin, managers, and dispatchers can see everything
    if (hasPermission('*') || hasPermission('jobs.view.all')) return true;
    
    // If item is restricted, only show to admin/manager/dispatcher roles
    if (item.visibility === 'restricted' && !showRestrictedItems) {
      return false;
    }
    
    // Technicians can only see their own items or general items
    if (currentUser?.role === 'technician') {
      return item.user_id === currentUser?.id || !item.user_id;
    }
    
    return true;
  };

  return {
    historyItems,
    isLoading,
    pinnedItems,
    showRestrictedItems,
    setShowRestrictedItems,
    addHistoryItem,
    updateHistoryItem,
    deleteHistoryItem,
    togglePinnedItem,
    canViewItem,
    refreshHistory: () => setRefreshTrigger(prev => prev + 1)
  };
};
