
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SendIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

interface MessageComposerProps {
  conversationId: string;
  recipientPhone: string;
  senderPhone: string;
}

export const MessageComposer = ({ 
  conversationId,
  recipientPhone,
  senderPhone
}: MessageComposerProps) => {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { user } = useAuth();

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !conversationId || !recipientPhone || !senderPhone) return;
    
    setIsSending(true);
    
    try {
      // First, store the message in our database
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          body: message,
          direction: 'outbound',
          sender: senderPhone,
          recipient: recipientPhone
        })
        .select()
        .single();
        
      if (messageError) throw messageError;
      
      // Then, send via Twilio
      const { data: twilioData, error: twilioError } = await supabase.functions.invoke('twilio', {
        body: {
          action: 'send-sms',
          from: senderPhone,
          to: recipientPhone,
          body: message
        }
      });
      
      if (twilioError) throw twilioError;
      
      // Update message with Twilio SID
      if (twilioData && twilioData.sid) {
        await supabase
          .from('messages')
          .update({
            message_sid: twilioData.sid,
            status: twilioData.status
          })
          .eq('id', messageData.id);
      }
      
      setMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form onSubmit={handleSendMessage} className="flex gap-2">
      <textarea
        className="flex-1 p-2 min-h-[50px] border rounded-md focus:ring-2 focus:ring-fixlyfy focus:outline-none resize-none"
        placeholder="Type your message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={isSending}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e);
          }
        }}
      />
      <Button 
        type="submit" 
        size="icon"
        disabled={isSending || !message.trim()}
        className="h-[50px] w-[50px]"
      >
        <SendIcon className={`h-5 w-5 ${isSending ? 'opacity-50' : ''}`} />
      </Button>
    </form>
  );
};
