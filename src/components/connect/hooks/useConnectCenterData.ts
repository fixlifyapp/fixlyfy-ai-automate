
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ConnectCenterData {
  unreadCounts: {
    messages: number;
    calls: number;
    emails: number;
  };
  ownedNumbers: any[];
  isLoading: boolean;
  error: string | null;
}

export const useConnectCenterData = () => {
  const [data, setData] = useState<ConnectCenterData>({
    unreadCounts: { messages: 0, calls: 0, emails: 0 },
    ownedNumbers: [],
    isLoading: true,
    error: null
  });

  const fetchAllData = useCallback(async () => {
    setData(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Fetch all data in parallel for better performance
      const [unreadCountsResult, ownedNumbersResult] = await Promise.allSettled([
        fetchUnreadCounts(),
        fetchOwnedNumbers()
      ]);

      const unreadCounts = unreadCountsResult.status === 'fulfilled' 
        ? unreadCountsResult.value 
        : { messages: 0, calls: 0, emails: 0 };

      const ownedNumbers = ownedNumbersResult.status === 'fulfilled' 
        ? ownedNumbersResult.value 
        : [];

      setData({
        unreadCounts,
        ownedNumbers,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Error fetching connect center data:', error);
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load data'
      }));
    }
  }, []);

  const fetchUnreadCounts = async () => {
    try {
      // Optimized query to get all counts in fewer requests
      const [conversationsResult, callsResult, emailsResult] = await Promise.all([
        supabase
          .from('conversations')
          .select('id, messages!inner(id, read_at)')
          .limit(100),
        supabase
          .from('amazon_connect_calls')
          .select('id', { count: 'exact', head: true })
          .eq('call_status', 'failed'),
        supabase
          .from('emails')
          .select('id', { count: 'exact', head: true })
          .eq('is_read', false)
      ]);

      let unreadMessages = 0;
      if (conversationsResult.data) {
        conversationsResult.data.forEach(conv => {
          const unreadInConv = conv.messages.filter((msg: any) => !msg.read_at).length;
          unreadMessages += unreadInConv;
        });
      }

      return {
        messages: unreadMessages,
        calls: callsResult.count || 0,
        emails: emailsResult.count || 0
      };
    } catch (error) {
      console.error('Error fetching unread counts:', error);
      return { messages: 0, calls: 0, emails: 0 };
    }
  };

  const fetchOwnedNumbers = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('manage-phone-numbers', {
        body: { action: 'list-owned' }
      });

      if (error) throw error;
      return data.phone_numbers || [];
    } catch (error) {
      console.error('Error loading owned numbers:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchAllData();

    // Set up consolidated real-time subscriptions
    const channels = [
      supabase
        .channel('connect-messages')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, fetchAllData),
      
      supabase
        .channel('connect-calls')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'amazon_connect_calls' }, fetchAllData),
      
      supabase
        .channel('connect-emails')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'emails' }, fetchAllData)
    ];

    channels.forEach(channel => channel.subscribe());

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [fetchAllData]);

  return {
    ...data,
    refreshData: fetchAllData
  };
};
