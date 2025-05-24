
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { UnifiedMessageList } from "./UnifiedMessageList";
import { MessageInput } from "./MessageInput";
import { useMessageDialog } from "./hooks/useMessageDialog";
import { useMessageAI } from "@/components/jobs/hooks/messaging/useMessageAI";

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
  const {
    message,
    setMessage,
    messages,
    isLoading,
    isLoadingMessages,
    handleSendMessage,
    conversationId
  } = useMessageDialog({ client, open });

  // Format messages to unified format
  const unifiedMessages = messages.map(msg => ({
    id: msg.id,
    body: msg.text,
    direction: msg.isClient ? 'inbound' as const : 'outbound' as const,
    created_at: msg.timestamp,
    sender: msg.sender,
    recipient: client.phone
  }));

  const handleUseSuggestion = (content: string) => {
    setMessage(content);
  };

  const { isAILoading, handleSuggestResponse } = useMessageAI({
    messages: unifiedMessages,
    client,
    jobId: '', // No job context in general message dialog
    onUseSuggestion: handleUseSuggestion
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Message {client.name}
            {client.phone && (
              <span className="text-sm font-normal text-muted-foreground block">
                {client.phone}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <UnifiedMessageList
            messages={unifiedMessages}
            isLoading={isLoadingMessages} 
            clientName={client.name}
            clientInfo={client}
          />
          
          <MessageInput
            message={message}
            setMessage={setMessage}
            handleSendMessage={handleSendMessage}
            isLoading={isLoading}
            isDisabled={isLoadingMessages}
            showSuggestResponse={true}
            onSuggestResponse={handleSuggestResponse}
            isAILoading={isAILoading}
            clientInfo={client}
            messages={unifiedMessages}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
