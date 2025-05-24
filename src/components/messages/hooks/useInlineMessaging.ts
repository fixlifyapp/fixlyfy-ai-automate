
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UseInlineMessagingProps {
  clientId?: string;
  clientPhone?: string;
  jobId?: string;
  onMessageSent?: () => void;
}

export const useInlineMessaging = ({ 
  clientId, 
  clientPhone,
  jobId,
  onMessageSent
}: UseInlineMessagingProps) => {
  const [isSending, setIsSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  // Find or create conversation
  const findOrCreateConversation = useCallback(async () => {
    if (!clientId) return null;

    try {
      // First try to find existing conversation
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .eq('client_id', clientId)
        .eq('job_id', jobId || null)
        .single();

      if (existingConv) {
        setConversationId(existingConv.id);
        return existingConv.id;
      }

      // Create new conversation if none exists
      const { data: newConv, error } = await supabase
        .from('conversations')
        .insert({
          client_id: clientId,
          job_id: jobId || null,
          status: 'active',
          last_message_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      setConversationId(newConv.id);
      return newConv.id;
    } catch (error) {
      console.error("Error finding/creating conversation:", error);
      return null;
    }
  }, [clientId, jobId]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || !clientPhone || isSending) return;

    setIsSending(true);

    try {
      // Send SMS via Twilio
      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: {
          to: clientPhone,
          body: content
        }
      });

      if (error) throw error;

      if (!data.success) {
        toast.error(`Failed to send message: ${data.error || 'Unknown error'}`);
        return;
      }

      // Find or create conversation
      let currentConversationId = conversationId;
      if (!currentConversationId) {
        currentConversationId = await findOrCreateConversation();
      }

      // Store message in database
      if (currentConversationId) {
        await supabase
          .from('messages')
          .insert({
            conversation_id: currentConversationId,
            body: content,
            direction: 'outbound',
            sender: 'You',
            recipient: clientPhone,
            status: 'delivered',
            message_sid: data.sid
          });

        // Update conversation timestamp
        await supabase
          .from('conversations')
          .update({ last_message_at: new Date().toISOString() })
          .eq('id', currentConversationId);

        toast.success("Message sent successfully");
        
        if (onMessageSent) {
          onMessageSent();
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  // Initialize conversation on mount
  useEffect(() => {
    if (clientId) {
      findOrCreateConversation();
    }
  }, [findOrCreateConversation]);

  return {
    sendMessage,
    isSending,
    conversationId
  };
};
