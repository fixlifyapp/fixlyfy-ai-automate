
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UnreadCounts {
  messages: number;
  calls: number;
  emails: number;
}

interface PhoneNumber {
  id: string;
  phone_number: string;
  status: string;
}

export const useConnectCenterData = () => {
  const [unreadCounts, setUnreadCounts] = useState<UnreadCounts>({
    messages: 0,
    calls: 0,
    emails: 0
  });
  const [ownedNumbers, setOwnedNumbers] = useState<PhoneNumber[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadUnreadCounts = async () => {
    try {
      // Get unread messages count
      const { data: messagesData } = await supabase
        .from('messages')
        .select('id')
        .is('read_at', null);

      // Get unread emails count
      const { data: emailsData } = await supabase
        .from('emails')
        .select('id')
        .eq('is_read', false);

      // Get new calls count (calls from today)
      const today = new Date().toISOString().split('T')[0];
      const { data: callsData } = await supabase
        .from('telnyx_calls')
        .select('id')
        .gte('created_at', today);

      setUnreadCounts({
        messages: messagesData?.length || 0,
        calls: callsData?.length || 0,
        emails: emailsData?.length || 0
      });
    } catch (error) {
      console.error('Error loading unread counts:', error);
    }
  };

  const loadOwnedNumbers = async () => {
    try {
      const { data, error } = await supabase
        .from('telnyx_phone_numbers')
        .select('id, phone_number, status')
        .eq('status', 'owned');

      if (error) throw error;
      setOwnedNumbers(data || []);
    } catch (error) {
      console.error('Error loading phone numbers:', error);
    }
  };

  const refreshData = async () => {
    setIsLoading(true);
    await Promise.all([
      loadUnreadCounts(),
      loadOwnedNumbers()
    ]);
    setIsLoading(false);
  };

  useEffect(() => {
    refreshData();

    // Set up real-time subscriptions
    const messagesChannel = supabase
      .channel('messages-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, loadUnreadCounts)
      .subscribe();

    const emailsChannel = supabase
      .channel('emails-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'emails' }, loadUnreadCounts)
      .subscribe();

    const callsChannel = supabase
      .channel('calls-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'telnyx_calls' }, loadUnreadCounts)
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(emailsChannel);
      supabase.removeChannel(callsChannel);
    };
  }, []);

  return {
    unreadCounts,
    ownedNumbers,
    isLoading,
    refreshData
  };
};
