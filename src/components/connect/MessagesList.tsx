
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { clients } from "@/data/clients";
import { MessageDialog } from "@/components/jobs/dialogs/MessageDialog";

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: string;
  isClient: boolean;
  clientId?: string;
}

interface Conversation {
  id: string;
  client: {
    id: string;
    name: string;
    phone?: string;
  };
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  messages: Message[];
}

export const MessagesList = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);

  // Initialize sample conversations - in a real app, fetch from the database
  useEffect(() => {
    const sampleConversations: Conversation[] = clients.slice(0, 5).map((client, index) => ({
      id: `conv-${index}`,
      client: {
        id: client.id,
        name: client.name,
        phone: client.phone,
      },
      lastMessage: index === 0 
        ? "Yes, I'll be home for the appointment tomorrow." 
        : "Thank you for scheduling the service.",
      lastMessageTime: new Date(Date.now() - index * 3600000).toLocaleString(),
      unread: index === 0 ? 2 : 0,
      messages: [
        {
          id: `msg-${index}-1`,
          text: "Hello! Just confirming our appointment tomorrow at 1:30 PM.",
          sender: "You",
          timestamp: new Date(Date.now() - (index + 1) * 7200000).toLocaleString(),
          isClient: false
        },
        {
          id: `msg-${index}-2`,
          text: index === 0 
            ? "Yes, I'll be home for the appointment tomorrow." 
            : "Thank you for scheduling the service.",
          sender: client.name,
          timestamp: new Date(Date.now() - index * 3600000).toLocaleString(),
          isClient: true,
          clientId: client.id
        }
      ]
    }));
    
    setConversations(sampleConversations);
    setIsLoading(false);
    
    // Set the first conversation as active by default
    if (sampleConversations.length > 0) {
      setActiveConversation(sampleConversations[0].id);
    }
  }, []);

  const handleNewMessageClick = (client: any) => {
    setSelectedClient(client);
    setIsMessageDialogOpen(true);
  };

  const handleConversationClick = (conversationId: string) => {
    setActiveConversation(conversationId);
    
    // Mark conversation as read
    setConversations(prevConversations =>
      prevConversations.map(conv =>
        conv.id === conversationId
          ? { ...conv, unread: 0 }
          : conv
      )
    );
  };

  const activeConv = conversations.find(c => c.id === activeConversation);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Conversations List */}
      <Card className="p-0">
        <div className="p-4 border-b border-fixlyfy-border">
          <h3 className="font-medium">Recent Messages</h3>
        </div>
        
        <div className="h-[600px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-fixlyfy" />
            </div>
          ) : conversations.length > 0 ? (
            conversations.map((conversation) => (
              <div 
                key={conversation.id}
                onClick={() => handleConversationClick(conversation.id)}
                className={cn(
                  "p-4 border-b border-fixlyfy-border cursor-pointer hover:bg-fixlyfy-bg-hover",
                  activeConversation === conversation.id && "bg-fixlyfy-bg-hover"
                )}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{conversation.client.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium truncate">{conversation.client.name}</h3>
                      <span className="text-xs text-fixlyfy-text-secondary">
                        {conversation.lastMessageTime.split(",")[0]}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-fixlyfy-text-secondary truncate">
                        {conversation.lastMessage}
                      </p>
                      {conversation.unread > 0 && (
                        <Badge className="bg-fixlyfy">{conversation.unread}</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-fixlyfy-text-secondary">
              <MessageSquare className="h-12 w-12 mb-2" />
              <p>No conversations yet</p>
            </div>
          )}
        </div>
      </Card>
      
      {/* Message Thread - reusing the existing message thread UI */}
      <Card className="p-0 md:col-span-2">
        <div className="h-[600px] flex flex-col">
          {activeConv ? (
            <>
              <div className="p-4 border-b border-fixlyfy-border">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{activeConv.client.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{activeConv.client.name}</h3>
                    <p className="text-xs text-fixlyfy-text-secondary">
                      {activeConv.client.phone || "No phone number"}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
                {activeConv.messages.map((message) => (
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
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <MessageSquare className="h-16 w-16 mb-4 text-fixlyfy-text-muted" />
              <h3 className="text-xl font-medium mb-2">Messaging Center</h3>
              <p className="text-center text-fixlyfy-text-secondary max-w-sm mb-4">
                Select a conversation to view messages.
              </p>
            </div>
          )}
        </div>
      </Card>
      
      <MessageDialog
        open={isMessageDialogOpen}
        onOpenChange={setIsMessageDialogOpen}
        client={selectedClient || {
          name: "New Client",
          phone: ""
        }}
      />
    </div>
  );
};
