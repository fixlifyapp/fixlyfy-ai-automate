
import { MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

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
        {conversation.messages.map((message) => (
          <div 
            key={message.id} 
            className={cn(
              "flex",
              message.isClient ? "justify-start" : "justify-end"
            )}
          >
            <div 
              className={cn(
                "max-w-[80%] p-3 rounded-lg",
                message.isClient 
                  ? "bg-muted text-foreground" 
                  : "bg-fixlyfy text-white"
              )}
            >
              <p className="text-sm">{message.text}</p>
              <span className="text-xs block mt-1 opacity-70">
                {message.timestamp}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
