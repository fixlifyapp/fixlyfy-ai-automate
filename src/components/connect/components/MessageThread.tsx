
import { Button } from "@/components/ui/button";
import { MessageSquare, Phone, Mail } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface MessageThreadProps {
  selectedConversation: any;
}

export const MessageThread = ({ selectedConversation }: MessageThreadProps) => {
  const formatMessageTime = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      });
    } catch {
      return 'Unknown time';
    }
  };

  if (!selectedConversation) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <MessageSquare className="mx-auto mb-4 h-12 w-12" />
          <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
          <p>Choose a conversation from the left or search for a client above to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Message Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {selectedConversation.client.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{selectedConversation.client.name}</h3>
              {selectedConversation.client.phone && (
                <p className="text-sm text-gray-500">{selectedConversation.client.phone}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {selectedConversation.client.phone && (
              <Button variant="outline" size="sm">
                <Phone className="h-4 w-4" />
              </Button>
            )}
            {selectedConversation.client.email && (
              <Button variant="outline" size="sm">
                <Mail className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Messages Display */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {selectedConversation.messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <MessageSquare className="mx-auto mb-2 h-8 w-8" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          selectedConversation.messages.map((message: any) => {
            const isFromClient = message.direction === 'inbound';
            const displaySender = isFromClient ? selectedConversation.client.name : 'You';
            
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
                    isFromClient ? "bg-gray-200" : "bg-blue-500 text-white"
                  )}>
                    {isFromClient 
                      ? selectedConversation.client.name.substring(0, 2).toUpperCase()
                      : 'ME'
                    }
                  </AvatarFallback>
                </Avatar>
                
                <div className={cn(
                  "flex flex-col max-w-[80%]",
                  !isFromClient && "items-end"
                )}>
                  <div className={cn(
                    "p-3 rounded-lg",
                    isFromClient 
                      ? "bg-gray-100 text-gray-900" 
                      : "bg-blue-500 text-white"
                  )}>
                    <p className="text-sm break-words">{message.body}</p>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">
                    {displaySender} • {formatMessageTime(message.created_at)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
