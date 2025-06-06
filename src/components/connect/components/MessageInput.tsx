
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MessageInputProps {
  selectedConversation: any;
  onMessageSent: () => void;
}

export const MessageInput = ({ selectedConversation, onMessageSent }: MessageInputProps) => {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedConversation || isSending) return;

    setIsSending(true);

    try {
      console.log('🚀 Sending message to:', selectedConversation.client.name);
      
      let conversationId = selectedConversation.id;
      
      // Handle temporary conversation IDs (new conversations)
      if (conversationId.startsWith('temp-')) {
        console.log('📝 Creating new conversation for temporary ID');
        // First check if conversation already exists for this client
        const { data: existingConv, error: checkError } = await supabase
          .from('conversations')
          .select('id')
          .eq('client_id', selectedConversation.client.id)
          .single();

        if (!checkError && existingConv) {
          conversationId = existingConv.id;
          console.log('✅ Found existing conversation:', conversationId);
        } else {
          // Create new conversation
          const { data: newConv, error: createError } = await supabase
            .from('conversations')
            .insert({
              client_id: selectedConversation.client.id,
              status: 'active',
              last_message_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select('id')
            .single();

          if (createError) throw createError;
          conversationId = newConv.id;
          console.log('🆕 Created new conversation:', conversationId);
        }
      } else {
        // Restore archived conversation
        console.log('🔄 Restoring conversation from archive:', conversationId);
        const { error: restoreError } = await supabase
          .from('conversations')
          .update({ 
            status: 'active',
            last_message_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', conversationId);

        if (restoreError) {
          console.error('⚠️ Error restoring conversation:', restoreError);
        } else {
          console.log('✅ Conversation restored to active status');
        }
      }

      // Send the SMS message
      const { data, error } = await supabase.functions.invoke('telnyx-sms', {
        body: {
          to: selectedConversation.client.phone,
          body: message,
          client_id: selectedConversation.client.id,
          conversation_id: conversationId
        }
      });

      if (error || !data?.success) {
        throw new Error(data?.error || 'Failed to send message');
      }

      console.log('✅ Message sent successfully');
      toast.success('Message sent successfully');
      setMessage("");
      
      // Call the callback to refresh conversations and force list update
      setTimeout(() => {
        onMessageSent();
      }, 500);

    } catch (error) {
      console.error('❌ Error sending message:', error);
      toast.error('Failed to send message: ' + error.message);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!selectedConversation) {
    return (
      <div className="p-4 text-center text-fixlyfy-text-muted bg-fixlyfy-bg-interface border-t border-fixlyfy-border">
        Select a conversation to start messaging
      </div>
    );
  }

  return (
    <div className="p-4 bg-white border-t border-fixlyfy-border">
      <div className="flex gap-3">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={`Send a message to ${selectedConversation.client.name}...`}
          className="flex-1 min-h-[60px] max-h-32 resize-none border-fixlyfy-border focus:ring-2 focus:ring-fixlyfy/20 focus:border-fixlyfy"
          disabled={isSending}
        />
        <Button
          onClick={handleSendMessage}
          disabled={!message.trim() || isSending}
          className="self-end bg-fixlyfy hover:bg-fixlyfy-light text-white px-6 h-[60px]"
        >
          {isSending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
