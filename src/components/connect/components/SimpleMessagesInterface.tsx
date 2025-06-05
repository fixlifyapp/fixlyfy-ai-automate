
import { useState, useEffect } from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { useMessageContext } from "@/contexts/MessageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Send, MessageSquare, Phone, Mail, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { sendClientMessage } from "@/components/jobs/hooks/messaging/messagingUtils";

export const SimpleMessagesInterface = () => {
  const { conversations, refreshConversations, isLoading } = useMessageContext();
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messageText, setMessageText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSending, setIsSending] = useState(false);

  console.log('SimpleMessagesInterface conversations:', conversations);

  // Auto-refresh conversations every 5 seconds to catch new messages
  useEffect(() => {
    const interval = setInterval(() => {
      refreshConversations();
    }, 5000);

    return () => clearInterval(interval);
  }, [refreshConversations]);

  const filteredConversations = conversations.filter(conv =>
    conv.client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        existingConversationId: selectedConversation.id
      });

      console.log('Message send result:', result);

      if (result.success) {
        setMessageText("");
        toast.success("Message sent successfully");
        
        // Refresh conversations immediately to show the new message
        setTimeout(() => {
          refreshConversations();
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

  return (
    <div className="h-[600px] border border-gray-200 rounded-lg overflow-hidden bg-white">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Left Panel - Conversations List */}
        <ResizablePanel defaultSize={35} minSize={25} maxSize={50}>
          <div className="h-full flex flex-col border-r border-gray-200">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-lg">Messages</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshConversations}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Refresh"
                  )}
                </Button>
              </div>
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
                <div className="p-4 text-center">
                  <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin" />
                  <p>Loading conversations...</p>
                </div>
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
                            {conversation.lastMessageTime ? formatMessageTime(conversation.lastMessageTime) : ''}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate mt-1">
                          {conversation.lastMessage || 'No messages'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {conversation.client.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500">{conversation.client.phone}</span>
                            </div>
                          )}
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {conversation.messages.length} messages
                          </span>
                        </div>
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
                        className="flex-1 resize-none min-h-[80px]"
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
                              <Loader2 className="w-4 h-4 animate-spin" />
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
