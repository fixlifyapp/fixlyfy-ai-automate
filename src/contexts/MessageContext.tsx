
import React, { createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

interface MessageContextType {
  openMessageDialog: (client: Client) => Promise<void>;
  sendMessage: (clientId: string, message: string, clientPhone: string) => Promise<void>;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider = ({ children }: { children: ReactNode }) => {
  const openMessageDialog = async (client: Client) => {
    // Find or create conversation
    let conversationId;
    
    try {
      // Check if conversation exists
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('id')
        .eq('client_id', client.id)
        .eq('status', 'active')
        .limit(1)
        .maybeSingle();

      if (existingConversation) {
        conversationId = existingConversation.id;
      } else {
        // Create new conversation
        const { data: newConversation, error: convError } = await supabase
          .from('conversations')
          .insert({
            client_id: client.id,
            status: 'active',
            last_message_at: new Date().toISOString()
          })
          .select('id')
          .single();

        if (convError) throw convError;
        conversationId = newConversation.id;
      }

      // For now, we'll just show a success message
      // In a full implementation, this would open a message dialog
      toast.success(`Message dialog opened for ${client.name}`);
      console.log('Conversation ID:', conversationId);
      
    } catch (error) {
      console.error('Error opening message dialog:', error);
      toast.error('Failed to open message dialog');
    }
  };

  const sendMessage = async (clientId: string, message: string, clientPhone: string) => {
    try {
      // Use the correct telnyx-sms edge function
      const { data, error } = await supabase.functions.invoke('telnyx-sms', {
        body: {
          to: clientPhone,
          body: message,
          client_id: clientId
        }
      });

      if (error) throw error;

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to send message');
      }

      toast.success('Message sent successfully');
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message: ' + error.message);
      throw error;
    }
  };

  return (
    <MessageContext.Provider value={{ openMessageDialog, sendMessage }}>
      {children}
    </MessageContext.Provider>
  );
};

export const useMessageContext = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessageContext must be used within a MessageProvider');
  }
  return context;
};
