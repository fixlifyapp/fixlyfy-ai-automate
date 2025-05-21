
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface MessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: {
    name: string;
    phone?: string;
    id?: string;
  };
}

export const MessageDialog = ({ open, onOpenChange, client }: MessageDialogProps) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  // Real-time subscription for new messages
  useEffect(() => {
    if (!open || !client.id) return;
    
    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: conversationId ? `conversation_id=eq.${conversationId}` : undefined
        },
        (payload) => {
          // Only process messages that aren't already in our list
          const newMsg = payload.new;
          if (newMsg && !messages.some(msg => msg.id === newMsg.id)) {
            const formattedMessage = {
              text: newMsg.body,
              sender: newMsg.direction === 'outbound' ? 'You' : client.name,
              timestamp: new Date(newMsg.created_at).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                hour12: true
              }),
              isClient: newMsg.direction === 'inbound'
            };
            
            setMessages(prev => [...prev, formattedMessage]);
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [open, client.id, conversationId, messages]);

  // Fetch messages when dialog opens
  useEffect(() => {
    if (open && client.id) {
      fetchMessages();
    }
  }, [open, client.id]);

  const fetchMessages = async () => {
    if (!client.id) return;
    
    setIsLoadingMessages(true);
    
    try {
      // First, check if a conversation exists for this client
      const { data: conversations } = await supabase
        .from('conversations')
        .select('*')
        .eq('client_id', client.id);
      
      if (conversations && conversations.length > 0) {
        const conversation = conversations[0];
        setConversationId(conversation.id);
        
        // Fetch messages for this conversation
        const { data: messagesData } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversation.id)
          .order('created_at', { ascending: true });
          
        if (messagesData) {
          const formattedMessages = messagesData.map(msg => ({
            id: msg.id,
            text: msg.body,
            sender: msg.direction === 'outbound' ? 'You' : client.name,
            timestamp: new Date(msg.created_at).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
              hour12: true
            }),
            isClient: msg.direction === 'inbound'
          }));
          
          setMessages(formattedMessages);
        }
      } else if (client.id) {
        // If no conversation exists yet, create a sample conversation starter
        setMessages([{
          id: 'welcome',
          text: "Hello! How can I assist you today?",
          sender: "You",
          timestamp: new Date().toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
          }),
          isClient: false
        }]);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    if (!client.phone) {
      toast.error("No phone number available for this client");
      return;
    }

    setIsLoading(true);

    try {
      // Add the new message to the local list
      const newMessage = {
        id: `temp-${Date.now()}`,
        text: message,
        sender: "You",
        timestamp: new Date().toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          hour12: true
        }),
        isClient: false
      };

      setMessages([...messages, newMessage]);
      
      let currentConversationId = conversationId;
      
      // If no conversation exists, create one
      if (!currentConversationId && client.id) {
        const { data: newConversation, error: convError } = await supabase
          .from('conversations')
          .insert({
            client_id: client.id,
            status: 'active',
            last_message_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (convError) {
          throw convError;
        }
        
        currentConversationId = newConversation.id;
        setConversationId(currentConversationId);
      }
      
      // Store the message in the database if we have a conversation
      if (currentConversationId) {
        await supabase
          .from('messages')
          .insert({
            conversation_id: currentConversationId,
            body: message,
            direction: 'outbound',
            sender: 'You',
            recipient: client.phone,
            status: 'pending'
          });
      }
      
      // Send SMS via Twilio edge function
      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: {
          to: client.phone,
          body: message
        }
      });
      
      if (error) {
        console.error("Error sending SMS:", error);
        toast.error("Failed to send SMS. Please try again.");
      } else if (data.success) {
        // Update the message status in the database
        if (currentConversationId) {
          await supabase
            .from('messages')
            .update({ 
              status: 'delivered',
              message_sid: data.sid
            })
            .eq('conversation_id', currentConversationId)
            .eq('body', message)
            .eq('direction', 'outbound');
        }
        
        setMessage("");
      } else {
        toast.error(`Failed to send SMS: ${data.error || 'Unknown error'}`);
      }
      
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Message {client.name}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {isLoadingMessages ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-fixlyfy" />
            </div>
          ) : (
            <div className="h-64 overflow-y-auto border rounded-md p-3 mb-4 space-y-3">
              {messages.map((msg, index) => (
                <div 
                  key={msg.id || index} 
                  className={`flex flex-col ${msg.isClient ? 'self-end items-end ml-auto' : ''}`}
                >
                  <div 
                    className={`${
                      msg.isClient 
                        ? 'bg-fixlyfy text-white' 
                        : 'bg-muted'
                    } p-3 rounded-lg max-w-[80%] ${msg.isClient ? 'ml-auto' : ''}`}
                  >
                    <p className="text-sm">{msg.text}</p>
                  </div>
                  <span className="text-xs text-fixlyfy-text-secondary mt-1">
                    {msg.sender}, {msg.timestamp}
                  </span>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex gap-2">
            <textarea 
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-fixlyfy focus:outline-none" 
              placeholder="Type your message..."
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isLoading || isLoadingMessages}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={isLoading || !message.trim() || isLoadingMessages}
              className="self-end"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send size={16} />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
