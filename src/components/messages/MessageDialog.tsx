
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { MessageList } from "@/components/messages/MessageList";
import { MessageInput } from "@/components/messages/MessageInput";
import { useMessageDialog } from "@/components/messages/hooks/useMessageDialog";

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
    handleSendMessage
  } = useMessageDialog({ client, open });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Message {client.name}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <MessageList
            messages={messages}
            isLoading={isLoadingMessages} 
            clientName={client.name}
          />
          
          <MessageInput
            message={message}
            setMessage={setMessage}
            handleSendMessage={handleSendMessage}
            isLoading={isLoading}
            isDisabled={isLoadingMessages}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
