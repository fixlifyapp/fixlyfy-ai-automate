
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Paperclip, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { sendClientMessage } from "@/components/jobs/hooks/messaging/messagingUtils";
import { AIWritingAssistant } from "./AIWritingAssistant";

interface MessageInputProps {
  selectedConversation: any;
  onMessageSent: () => void;
}

export const MessageInput = ({ selectedConversation, onMessageSent }: MessageInputProps) => {
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>("");

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation || isSending) return;

    if (!selectedConversation.client.phone) {
      toast.error("No phone number available for this client");
      return;
    }

    setIsSending(true);
    setDebugInfo("Initiating SMS send...");
    
    console.log('🚀 SMS Send Debug Info:');
    console.log('- Message:', messageText);
    console.log('- To:', selectedConversation.client.name);
    console.log('- Phone:', selectedConversation.client.phone);
    console.log('- Client ID:', selectedConversation.client.id);
    console.log('- Conversation ID:', selectedConversation.id);

    try {
      setDebugInfo("Calling sendClientMessage function...");
      
      const result = await sendClientMessage({
        content: messageText.trim(),
        clientPhone: selectedConversation.client.phone,
        jobId: "",
        clientId: selectedConversation.client.id,
        existingConversationId: selectedConversation.id.startsWith('temp-') ? undefined : selectedConversation.id
      });

      console.log('📱 SMS Send Result:', result);
      setDebugInfo(`Send result: ${JSON.stringify(result)}`);

      if (result.success) {
        setMessageText("");
        toast.success("Message sent successfully");
        setDebugInfo("Message sent - refreshing conversations...");
        
        setTimeout(() => {
          onMessageSent();
          setDebugInfo("");
        }, 1000);
      } else {
        console.error("❌ Message sending failed:", result.error);
        toast.error(`Failed to send message: ${result.error || 'Unknown error'}`);
        setDebugInfo(`Error: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('💥 Error sending message:', error);
      toast.error("Failed to send message. Please try again.");
      setDebugInfo(`Exception: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  const handleAISuggestion = (suggestion: string) => {
    setMessageText(suggestion);
  };

  if (!selectedConversation) {
    return null;
  }

  const conversationContext = selectedConversation.messages
    .slice(-3)
    .map((msg: any) => `${msg.direction === 'inbound' ? selectedConversation.client.name : 'You'}: ${msg.body}`)
    .join('\n');

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Debug Info Panel */}
      {debugInfo && (
        <div className="p-2 bg-fixlyfy-warning/10 border-b border-fixlyfy-warning/20 text-xs text-fixlyfy-warning flex items-center gap-2">
          <AlertCircle className="h-3 w-3" />
          <span>Debug: {debugInfo}</span>
        </div>
      )}

      {/* AI Writing Assistant */}
      <AIWritingAssistant
        onUseSuggestion={handleAISuggestion}
        clientName={selectedConversation.client.name}
        conversationContext={conversationContext}
        disabled={isSending}
      />
      
      {/* Message Input Area */}
      <div className="flex-1 p-4 border-t border-fixlyfy-border/50">
        <div className="h-full flex flex-col gap-3">
          <div className="flex-1 flex gap-3">
            <div className="flex-1">
              <Textarea
                placeholder={`Type your message to ${selectedConversation.client.name}...`}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isSending}
                className="h-full resize-none border-fixlyfy-border focus:ring-2 focus:ring-fixlyfy/20 focus:border-fixlyfy"
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
          
          <div className="flex justify-between items-center text-xs text-fixlyfy-text-muted">
            <span>Press Enter to send, Shift+Enter for new line</span>
            {selectedConversation.client.phone && (
              <span className="bg-fixlyfy/10 text-fixlyfy px-2 py-1 rounded">
                SMS to {selectedConversation.client.phone}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* SMS Debugging Panel */}
      <div className="p-3 bg-fixlyfy-bg-interface border-t border-fixlyfy-border/50">
        <h4 className="text-sm font-medium text-fixlyfy-text mb-2">SMS Debug Info:</h4>
        <div className="space-y-1 text-xs text-fixlyfy-text-secondary">
          <div>Client Phone: <span className="font-mono">{selectedConversation.client.phone || 'Not set'}</span></div>
          <div>Conversation ID: <span className="font-mono">{selectedConversation.id}</span></div>
          <div>Message Count: <span className="font-mono">{selectedConversation.messages.length}</span></div>
          <div>Last Message: <span className="font-mono">{selectedConversation.lastMessageTime ? new Date(selectedConversation.lastMessageTime).toLocaleString() : 'None'}</span></div>
        </div>
        <div className="mt-2 p-2 bg-fixlyfy-info/10 rounded text-xs text-fixlyfy-info">
          💡 Check the browser console for detailed SMS send/receive logs
        </div>
      </div>
    </div>
  );
};
