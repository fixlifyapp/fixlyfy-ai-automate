
import { Loader2, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UnifiedMessage {
  id: string;
  body: string;
  direction: 'inbound' | 'outbound';
  created_at: string;
  sender?: string;
  recipient?: string;
}

interface UnifiedMessageListProps {
  messages: UnifiedMessage[];
  isLoading: boolean;
  clientName: string;
  clientInfo?: {
    name: string;
    phone?: string;
    id?: string;
  };
}

export const UnifiedMessageList = ({ 
  messages, 
  isLoading, 
  clientName,
  clientInfo 
}: UnifiedMessageListProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-fixlyfy" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MessageSquare className="mx-auto mb-2 text-muted-foreground" size={32} />
        <p>No messages yet. Send your first message to {clientName}.</p>
      </div>
    );
  }

  return (
    <div className="h-64 overflow-y-auto border rounded-md p-3 mb-4 space-y-4">
      {messages.map((message) => {
        const isFromClient = message.direction === 'inbound';
        const senderName = isFromClient ? clientName : 'You';
        const senderInitials = isFromClient 
          ? clientName.substring(0, 2).toUpperCase()
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
                <p className="text-sm break-words">{message.body}</p>
              </div>
              <span className="text-xs text-muted-foreground mt-1">
                {senderName} • {new Date(message.created_at).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                  hour12: true
                })}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
