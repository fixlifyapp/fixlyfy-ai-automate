import { useState } from "react";
import { MessageSquare, Loader2, Send, Bot } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useMessageAI } from "@/components/jobs/hooks/messaging/useMessageAI";

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: string;
  isClient: boolean;
}

interface Conversation {
  id: string;
  client: {
    id: string;
    name: string;
    phone?: string;
  };
  messages: Message[];
}

interface ConversationThreadProps {
  conversation: Conversation | undefined;
}

export const ConversationThread = ({ conversation }: ConversationThreadProps) => {
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  
  // Format messages for AI
  const unifiedMessages = conversation?.messages.map(msg => ({
    id: msg.id,
    body: msg.text,
    direction: msg.isClient ? 'inbound' as const : 'outbound' as const,
    created_at: msg.timestamp,
    sender: msg.sender
  })) || [];

  const handleUseSuggestion = (content: string) => {
    setNewMessage(content);
  };

  const { isAILoading, handleSuggestResponse } = useMessageAI({
    messages: unifiedMessages,
    client: conversation?.client || { name: "", id: "" },
    jobId: '', // No job context in connect center
    onUseSuggestion: handleUseSuggestion
  });
  
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversation) return;
    if (!conversation.client.phone) {
      toast.error("No phone number available for this client");
      return;
    }
    
    setIsSending(true);
    
    try {
      // Call the Twilio edge function to send SMS
      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: {
          to: conversation.client.phone,
          body: newMessage
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data.success) {
        // Store the message in the database (this will trigger our real-time listener)
        await supabase
          .from('messages')
          .insert({
            conversation_id: conversation.id,
            body: newMessage,
            direction: 'outbound',
            sender: 'You',
            recipient: conversation.client.phone,
            status: 'delivered',
            message_sid: data.sid
          });
          
        // Update the last_message_at field for the conversation
        await supabase
          .from('conversations')
          .update({ last_message_at: new Date().toISOString() })
          .eq('id', conversation.id);
          
        setNewMessage(""); // Clear the input
        toast.success("Message sent successfully");
      } else {
        toast.error(`Failed to send message: ${data.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  if (!conversation) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <MessageSquare className="h-16 w-16 mb-4 text-fixlyfy-text-muted" />
        <h3 className="text-xl font-medium mb-2">Messaging Center</h3>
        <p className="text-center text-fixlyfy-text-secondary max-w-sm mb-4">
          Select a conversation to view messages.
        </p>
      </div>
    );
  }

  const lastMessage = conversation.messages[conversation.messages.length - 1];
  const shouldShowSuggest = lastMessage?.isClient;

  return (
    <>
      <div className="p-4 border-b border-fixlyfy-border">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{conversation.client.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{conversation.client.name}</h3>
            <p className="text-xs text-fixlyfy-text-secondary">
              {conversation.client.phone || "No phone number"}
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
        {conversation.messages.length > 0 ? (
          conversation.messages.map((message) => {
            const isFromClient = message.isClient;
            const senderName = isFromClient ? conversation.client.name : 'You';
            const senderInitials = isFromClient 
              ? conversation.client.name.substring(0, 2).toUpperCase()
              : 'ME';

            return (
              <div 
                key={message.id} 
                className={cn(
                  "flex gap-3",
                  !isFromClient && "flex-row-reverse"
                )}
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className={cn(
                    "text-xs",
                    isFromClient ? "bg-muted" : "bg-fixlyfy text-white"
                  )}>
                    {senderInitials}
                  </AvatarFallback>
                </Avatar>
                
                <div className={cn(
                  "flex flex-col max-w-[80%]",
                  !isFromClient && "items-end"
                )}>
                  <div className={cn(
                    "p-3 rounded-lg",
                    isFromClient 
                      ? "bg-muted text-foreground" 
                      : "bg-fixlyfy text-white"
                  )}>
                    <p className="text-sm break-words">{message.text}</p>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">
                    {senderName} • {message.timestamp}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex justify-center items-center h-full text-fixlyfy-text-secondary">
            <p>No messages in this conversation yet</p>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-fixlyfy-border space-y-2">
        {shouldShowSuggest && (
          <div className="flex justify-end">
            <Button 
              variant="outline"
              size="sm"
              onClick={handleSuggestResponse}
              disabled={isAILoading || isSending}
              className="gap-2 text-purple-600 border-purple-200"
            >
              {isAILoading ? <Loader2 size={16} className="animate-spin" /> : <Bot size={16} />}
              {isAILoading ? "Generating..." : "Suggest Response"}
            </Button>
          </div>
        )}
        
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
            disabled={isSending}
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={isSending || !newMessage.trim()}
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </>
  );
};
