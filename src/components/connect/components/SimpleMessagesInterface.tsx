
import { useState } from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { useMessageContext } from "@/contexts/MessageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Send, MessageSquare, Phone, Mail } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface SimpleMessage {
  id: string;
  body: string;
  direction: 'inbound' | 'outbound';
  created_at: string;
  sender?: string;
  client_name?: string;
}

export const SimpleMessagesInterface = () => {
  const { conversations, refreshConversations, isLoading } = useMessageContext();
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messageText, setMessageText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSending, setIsSending] = useState(false);

  console.log('SimpleMessagesInterface conversations:', conversations);

  const filteredConversations = conversations.filter(conv =>
    conv.client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation || isSending) return;

    setIsSending(true);
    try {
      // Simple message sending logic
      console.log('Sending message:', messageText, 'to:', selectedConversation.client.name);
      
      // Here we would implement the actual sending logic
      // For now, just show success and refresh
      toast.success("Message sent successfully");
      setMessageText("");
      await refreshConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Failed to send message");
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

  return (
    <div className="h-[600px] border border-gray-200 rounded-lg overflow-hidden bg-white">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Left Panel - Conversations List */}
        <ResizablePanel defaultSize={35} minSize={25} maxSize={50}>
          <div className="h-full flex flex-col border-r border-gray-200">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-lg mb-3">Messages</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="p-4">Loading conversations...</div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <MessageSquare className="mx-auto mb-2 h-8 w-8" />
                  <p>No conversations found</p>
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation)}
                    className={cn(
                      "p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors",
                      selectedConversation?.id === conversation.id && "bg-blue-50 border-blue-200"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {conversation.client.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm truncate">
                            {conversation.client.name}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {conversation.lastMessageTime ? new Date(conversation.lastMessageTime).toLocaleDateString() : ''}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate mt-1">
                          {conversation.lastMessage || 'No messages'}
                        </p>
                        {conversation.client.phone && (
                          <div className="flex items-center gap-1 mt-1">
                            <Phone className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">{conversation.client.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle className="bg-gray-200 hover:bg-blue-200 transition-colors" />

        {/* Right Panel - Message Thread */}
        <ResizablePanel defaultSize={65} minSize={50} maxSize={75}>
          {!selectedConversation ? (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageSquare className="mx-auto mb-4 h-12 w-12" />
                <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                <p>Choose a conversation from the left to start messaging</p>
              </div>
            </div>
          ) : (
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

              <ResizablePanelGroup direction="vertical" className="flex-1">
                {/* Messages Panel */}
                <ResizablePanel defaultSize={70} minSize={40} maxSize={80}>
                  <div className="h-full overflow-y-auto p-4 space-y-4">
                    {selectedConversation.messages.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        <MessageSquare className="mx-auto mb-2 h-8 w-8" />
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      selectedConversation.messages.map((message: any) => {
                        const isFromClient = message.direction === 'inbound';
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
                                {new Date(message.created_at).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </ResizablePanel>

                <ResizableHandle withHandle className="bg-gray-200 hover:bg-blue-200 transition-colors" />

                {/* Input Panel */}
                <ResizablePanel defaultSize={30} minSize={20} maxSize={60}>
                  <div className="h-full p-4 border-t border-gray-200 bg-gray-50">
                    <div className="h-full flex flex-col gap-3">
                      <Textarea
                        placeholder="Type your message..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isSending}
                        className="flex-1 resize-none"
                      />
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          Press Enter to send, Shift+Enter for new line
                        </span>
                        <Button 
                          onClick={handleSendMessage}
                          disabled={isSending || !messageText.trim()}
                          className="px-6"
                        >
                          {isSending ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Sending...
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Send className="h-4 w-4" />
                              Send
                            </div>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
