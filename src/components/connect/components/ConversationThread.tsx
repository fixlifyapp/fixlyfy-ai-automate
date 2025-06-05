
import { useState } from "react";
import { useConversationMessaging } from "../hooks/useConversationMessaging";
import { CallDialog } from "../CallDialog";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { ConversationHeader } from "./ConversationHeader";
import { ConversationEmptyState } from "./ConversationEmptyState";
import { ConversationMessagesPanel } from "./ConversationMessagesPanel";
import { ConversationInputPanel } from "./ConversationInputPanel";

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
  const [callDialogOpen, setCallDialogOpen] = useState(false);
  
  const {
    messageText,
    setMessageText,
    handleSendMessage,
    handleKeyDown,
    isSending
  } = useConversationMessaging({
    conversationId: conversation?.id || "",
    clientPhone: conversation?.client.phone,
    clientId: conversation?.client.id
  });

  const handleCallClick = () => {
    if (conversation?.client.phone) {
      setCallDialogOpen(true);
    }
  };
  
  if (!conversation) {
    return <ConversationEmptyState />;
  }

  return (
    <>
      <ConversationHeader 
        client={conversation.client}
        onCallClick={handleCallClick}
      />
      
      <div className="flex-1 bg-fixlyfy-bg-interface overflow-hidden">
        <ResizablePanelGroup direction="vertical" className="h-full">
          <ResizablePanel defaultSize={60} minSize={30} maxSize={80}>
            <ConversationMessagesPanel 
              messages={conversation.messages}
              clientName={conversation.client.name}
            />
          </ResizablePanel>

          <ResizableHandle withHandle className="bg-fixlyfy-border/50 hover:bg-fixlyfy/20 transition-colors" />

          <ResizablePanel defaultSize={40} minSize={20} maxSize={70}>
            <ConversationInputPanel 
              messageText={messageText}
              setMessageText={setMessageText}
              onSendMessage={handleSendMessage}
              onKeyDown={handleKeyDown}
              isSending={isSending}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {conversation.client.phone && (
        <CallDialog
          isOpen={callDialogOpen}
          onClose={() => setCallDialogOpen(false)}
          phoneNumber={conversation.client.phone}
        />
      )}
    </>
  );
};
