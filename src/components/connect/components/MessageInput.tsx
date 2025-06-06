
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Paperclip } from "lucide-react";
import { toast } from "sonner";
import { sendClientMessage } from "@/components/jobs/hooks/messaging/messagingUtils";

interface MessageInputProps {
  selectedConversation: any;
  onMessageSent: () => void;
}

export const MessageInput = ({ selectedConversation, onMessageSent }: MessageInputProps) => {
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation || isSending) return;

    if (!selectedConversation.client.phone) {
      toast.error("No phone number available for this client");
      return;
    }

    setIsSending(true);
    console.log('Sending message:', messageText, 'to:', selectedConversation.client.name, 'phone:', selectedConversation.client.phone);

    try {
      const result = await sendClientMessage({
        content: messageText.trim(),
        clientPhone: selectedConversation.client.phone,
        jobId: "",
        clientId: selectedConversation.client.id,
        existingConversationId: selectedConversation.id.startsWith('temp-') ? undefined : selectedConversation.id
      });

      console.log('Message send result:', result);

      if (result.success) {
        setMessageText("");
        toast.success("Message sent successfully");
        
        // Notify parent to refresh conversations
        setTimeout(() => {
          onMessageSent();
        }, 1000);
      } else {
        console.error("Message sending failed:", result.error);
        toast.error(`Failed to send message: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Failed to send message. Please try again.");
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

  if (!selectedConversation) {
    return null;
  }

  return (
    <div className="p-4 border-t border-gray-200 bg-white">
      <div className="flex flex-col gap-3">
        <div className="flex gap-3">
          <div className="flex-1">
            <Textarea
              placeholder={`Type your message to ${selectedConversation.client.name}...`}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSending}
              className="resize-none min-h-[80px] border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Button 
              variant="outline"
              size="sm"
              className="p-2"
              disabled={isSending}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button 
              onClick={handleSendMessage}
              disabled={isSending || !messageText.trim()}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white"
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
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Press Enter to send, Shift+Enter for new line</span>
          {selectedConversation.client.phone && (
            <span className="bg-gray-100 px-2 py-1 rounded">
              SMS to {selectedConversation.client.phone}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
