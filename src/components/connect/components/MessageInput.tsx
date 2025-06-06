
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Paperclip, Bot, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAI } from "@/hooks/use-ai";
import { supabase } from "@/integrations/supabase/client";

interface MessageInputProps {
  selectedConversation: any;
  onMessageSent: () => void;
}

export const MessageInput = ({ selectedConversation, onMessageSent }: MessageInputProps) => {
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const { generateText, isLoading: isAILoading } = useAI({
    systemContext: `You are a professional customer service assistant. Generate helpful, polite, and professional messages for business communication. Keep responses concise and actionable.`
  });

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation || isSending) return;

    if (!selectedConversation.client.phone) {
      toast.error("No phone number available for this client");
      return;
    }

    setIsSending(true);
    
    console.log('🚀 SMS Send Debug Info:');
    console.log('- Message:', messageText);
    console.log('- To:', selectedConversation.client.name);
    console.log('- Phone:', selectedConversation.client.phone);
    console.log('- Client ID:', selectedConversation.client.id);
    console.log('- Conversation ID:', selectedConversation.id);

    try {
      // Actually send SMS via Telnyx edge function
      console.log('📤 Calling telnyx-sms function...');
      const { data, error } = await supabase.functions.invoke('telnyx-sms', {
        body: {
          to: selectedConversation.client.phone,
          body: messageText.trim(),
          client_id: selectedConversation.client.id,
          job_id: '' // Optional job ID
        }
      });

      console.log('📨 telnyx-sms response:', { data, error });

      if (error) {
        console.error('❌ Supabase function error:', error);
        throw new Error(error.message || 'Failed to send message');
      }

      if (!data?.success) {
        console.error('❌ SMS sending failed:', data);
        throw new Error(data?.error || 'Failed to send message');
      }

      console.log('✅ Message sent successfully via telnyx-sms');
      setMessageText("");
      toast.success("Message sent successfully");
      
      // Trigger refresh to show the new message
      setTimeout(() => {
        onMessageSent();
      }, 500);

    } catch (error) {
      console.error('💥 Error sending message:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to send message: ${errorMessage}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAISuggestion = async (prompt: string) => {
    if (isAILoading || isSending) return;

    try {
      const clientName = selectedConversation?.client.name || "the client";
      const contextualPrompt = `${prompt} for ${clientName}`;

      const suggestion = await generateText(contextualPrompt);
      
      if (suggestion) {
        setMessageText(suggestion);
        toast.success("AI suggestion applied!");
      }
    } catch (error) {
      console.error("AI suggestion error:", error);
      toast.error("Failed to generate suggestion");
    }
  };

  if (!selectedConversation) {
    return null;
  }

  return (
    <div className="bg-white">
      {/* Message Input Area */}
      <div className="p-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <Textarea
              placeholder={`Type your message to ${selectedConversation.client.name}...`}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSending}
              className="min-h-[80px] max-h-[120px] resize-none border-fixlyfy-border focus:ring-2 focus:ring-fixlyfy/20 focus:border-fixlyfy"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Button 
              variant="outline"
              size="sm"
              className="p-2 border-fixlyfy-border hover:bg-fixlyfy/5"
              disabled={isSending}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button 
              onClick={handleSendMessage}
              disabled={isSending || !messageText.trim()}
              className="px-4 py-2 bg-fixlyfy hover:bg-fixlyfy-light text-white"
              size="sm"
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        
        <div className="flex justify-between items-center text-xs text-fixlyfy-text-muted mt-2">
          <span>Press Enter to send, Shift+Enter for new line</span>
          {selectedConversation.client.phone && (
            <span className="bg-fixlyfy/10 text-fixlyfy px-2 py-1 rounded">
              SMS to {selectedConversation.client.phone}
            </span>
          )}
        </div>
      </div>

      {/* AI Writing Assistant - Bottom Section */}
      <div className="border-t border-fixlyfy-border/50 bg-gradient-to-r from-fixlyfy/5 to-fixlyfy-light/5">
        <div className="p-3">
          {/* AI Toggle */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-fixlyfy" />
              <span className="text-sm font-medium text-fixlyfy-text">AI Writing Assistant</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAI(!showAI)}
              className="h-6 w-6 p-0"
            >
              <Sparkles className="h-3 w-3" />
            </Button>
          </div>

          {/* AI Quick Actions */}
          {showAI && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAISuggestion("Generate a friendly professional greeting message")}
                  disabled={isAILoading || isSending}
                  className="text-xs h-8 border-fixlyfy-border/50 hover:bg-fixlyfy/5"
                >
                  {isAILoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    "Greeting"
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAISuggestion("Generate a polite follow-up message asking about service needs")}
                  disabled={isAILoading || isSending}
                  className="text-xs h-8 border-fixlyfy-border/50 hover:bg-fixlyfy/5"
                >
                  {isAILoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    "Follow Up"
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAISuggestion("Generate a professional appointment reminder message")}
                  disabled={isAILoading || isSending}
                  className="text-xs h-8 border-fixlyfy-border/50 hover:bg-fixlyfy/5"
                >
                  {isAILoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    "Reminder"
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAISuggestion("Generate a professional thank you message for business")}
                  disabled={isAILoading || isSending}
                  className="text-xs h-8 border-fixlyfy-border/50 hover:bg-fixlyfy/5"
                >
                  {isAILoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    "Thank You"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
