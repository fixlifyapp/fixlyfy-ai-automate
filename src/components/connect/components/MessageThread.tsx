
import { Button } from "@/components/ui/button";
import { MessageSquare, Phone, Mail, Clock } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface MessageThreadProps {
  selectedConversation: any;
}

export const MessageThread = ({ selectedConversation }: MessageThreadProps) => {
  const formatMessageTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('en-US', {
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
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-blue-100 rounded-full p-6 mx-auto mb-6 w-24 h-24 flex items-center justify-center">
            <MessageSquare className="h-12 w-12 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Welcome to Messages</h3>
          <p className="text-gray-600 leading-relaxed">
            Select an existing conversation from the left sidebar, or search for a client above to start a new conversation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Message Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-white to-blue-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 border-2 border-blue-200">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold text-lg">
                {selectedConversation.client.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg text-gray-900">{selectedConversation.client.name}</h3>
              {selectedConversation.client.phone && (
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {selectedConversation.client.phone}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {selectedConversation.client.phone && (
              <Button variant="outline" size="sm" className="gap-2">
                <Phone className="h-4 w-4" />
                Call
              </Button>
            )}
            {selectedConversation.client.email && (
              <Button variant="outline" size="sm" className="gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Messages Display */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {selectedConversation.messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-full p-6 mx-auto mb-4 w-16 h-16 flex items-center justify-center shadow-sm">
              <MessageSquare className="h-8 w-8 text-gray-400" />
            </div>
            <h4 className="font-medium text-gray-700 mb-2">Start the conversation</h4>
            <p className="text-gray-500 text-sm">Send your first message to {selectedConversation.client.name}</p>
          </div>
        ) : (
          selectedConversation.messages.map((message: any) => {
            const isFromClient = message.direction === 'inbound';
            const displaySender = isFromClient ? selectedConversation.client.name : 'You';
            
            return (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3 animate-fade-in",
                  !isFromClient && "flex-row-reverse"
                )}
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className={cn(
                    "text-xs font-medium",
                    isFromClient 
                      ? "bg-gray-200 text-gray-700" 
                      : "bg-blue-500 text-white"
                  )}>
                    {isFromClient 
                      ? selectedConversation.client.name.substring(0, 2).toUpperCase()
                      : 'ME'
                    }
                  </AvatarFallback>
                </Avatar>
                
                <div className={cn(
                  "flex flex-col max-w-[75%]",
                  !isFromClient && "items-end"
                )}>
                  <div className={cn(
                    "p-3 rounded-2xl shadow-sm",
                    isFromClient 
                      ? "bg-white text-gray-900 rounded-bl-md" 
                      : "bg-blue-500 text-white rounded-br-md"
                  )}>
                    <p className="text-sm break-words leading-relaxed">{message.body}</p>
                  </div>
                  <div className={cn(
                    "flex items-center gap-1 mt-1 text-xs text-gray-500",
                    !isFromClient && "flex-row-reverse"
                  )}>
                    <span className="font-medium">{displaySender}</span>
                    <Clock className="h-3 w-3" />
                    <span>{formatMessageTime(message.created_at)}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
