import { useState, useEffect } from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { useMessageContext } from "@/contexts/MessageContext";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Search, Plus, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ConversationsList } from "./ConversationsList";
import { MessageThread } from "./MessageThread";
import { MessageInput } from "./MessageInput";

interface SearchResult {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

export const SimpleMessagesInterface = () => {
  const { 
    conversations, 
    refreshConversations, 
    isLoading, 
    restoreArchivedConversation 
  } = useMessageContext();
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showClientResults, setShowClientResults] = useState(false);

  console.log('SimpleMessagesInterface conversations:', conversations);

  // Check URL for specific client and restore if needed
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const clientId = urlParams.get('clientId');
    const clientName = urlParams.get('clientName');
    const clientPhone = urlParams.get('clientPhone');

    if (clientId && clientName) {
      console.log('🔗 URL contains client info, checking for conversation:', { clientId, clientName, clientPhone });
      
      // Check if conversation exists in current list
      const existingConversation = conversations.find(conv => conv.client.id === clientId);
      
      if (existingConversation) {
        setSelectedConversation(existingConversation);
        console.log('✅ Found existing conversation for client:', clientName);
      } else {
        // Try to restore archived conversation or create new one
        console.log('🔄 Attempting to restore conversation for client:', clientName);
        restoreArchivedConversation(clientId).then(() => {
          // After restoration attempt, check again
          const restoredConversation = conversations.find(conv => conv.client.id === clientId);
          if (restoredConversation) {
            setSelectedConversation(restoredConversation);
            toast.success(`Restored conversation with ${clientName}`);
          } else {
            // Create a new conversation placeholder if none exists
            const newConversation = {
              id: `temp-${clientId}`,
              client: {
                id: clientId,
                name: decodeURIComponent(clientName),
                phone: clientPhone ? decodeURIComponent(clientPhone) : '',
                email: ''
              },
              messages: [],
              lastMessage: 'No messages yet',
              lastMessageTime: new Date().toISOString(),
              unreadCount: 0
            };
            
            setSelectedConversation(newConversation);
            console.log('📝 Created new conversation placeholder for client:', clientName);
          }
        });
      }
    }
  }, [conversations, restoreArchivedConversation]);

  // Auto-refresh conversations every 5 seconds to catch new messages
  useEffect(() => {
    const interval = setInterval(() => {
      refreshConversations();
    }, 5000);

    return () => clearInterval(interval);
  }, [refreshConversations]);

  // Combined search for both clients and conversations
  useEffect(() => {
    const searchClients = async () => {
      if (!searchTerm.trim()) {
        setSearchResults([]);
        setShowClientResults(false);
        return;
      }

      // First check if any existing conversations match
      const matchingConversations = conversations.filter(conv =>
        conv.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (conv.client.phone && conv.client.phone.includes(searchTerm))
      );

      if (matchingConversations.length > 0) {
        setShowClientResults(false);
        return;
      }

      // If no existing conversations match, search for new clients
      setIsSearching(true);
      try {
        const { data: clientData, error } = await supabase
          .from('clients')
          .select('id, name, phone, email')
          .or(`name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
          .limit(5);

        if (error) throw error;

        const results = clientData?.map(client => ({
          id: client.id,
          name: client.name,
          phone: client.phone,
          email: client.email
        })) || [];

        setSearchResults(results);
        setShowClientResults(results.length > 0);
      } catch (error) {
        console.error('Error searching clients:', error);
        toast.error("Failed to search clients");
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchClients, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, conversations]);

  const handleClientSelect = async (client: SearchResult) => {
    console.log('Selected client:', client);
    
    // Check if conversation already exists
    let existingConversation = conversations.find(conv => conv.client.id === client.id);
    
    if (existingConversation) {
      setSelectedConversation(existingConversation);
      console.log('Using existing conversation:', existingConversation.id);
    } else {
      // Create a new conversation placeholder
      const newConversation = {
        id: `temp-${client.id}`,
        client: {
          id: client.id,
          name: client.name,
          phone: client.phone || '',
          email: client.email || ''
        },
        messages: [],
        lastMessage: 'No messages yet',
        lastMessageTime: new Date().toISOString(),
        unreadCount: 0
      };
      
      setSelectedConversation(newConversation);
      console.log('Created new conversation placeholder for client:', client.name);
    }

    setSearchTerm("");
    setShowClientResults(false);
    toast.success(`Opening conversation with ${client.name}`);
  };

  const handleMessageSent = () => {
    console.log('📨 Message sent, refreshing conversations...');
    
    // Force refresh conversations to show the new/updated conversation
    refreshConversations();
    
    // Clear selection temporarily to force re-render, then restore after refresh
    const currentConversation = selectedConversation;
    if (currentConversation) {
      setSelectedConversation(null);
      
      // After refresh, try to restore the selection with updated conversation
      setTimeout(() => {
        // Find the conversation in the updated list by client ID
        refreshConversations().then(() => {
          setTimeout(() => {
            const updatedConversation = conversations.find(conv => 
              conv.client.id === currentConversation.client.id
            );
            
            if (updatedConversation) {
              setSelectedConversation(updatedConversation);
              console.log('✅ Restored selection to updated conversation');
            } else {
              // If still not found, keep the original selection
              setSelectedConversation(currentConversation);
              console.log('⚠️ Could not find updated conversation, keeping original');
            }
          }, 500);
        });
      }, 100);
    }
  };

  // Filter conversations based on search term
  const filteredConversations = conversations.filter(conv =>
    conv.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (conv.client.phone && conv.client.phone.includes(searchTerm))
  );

  return (
    <div className="h-[700px] border border-fixlyfy-border rounded-xl overflow-hidden bg-white shadow-card">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Left Panel - Conversations List with Search */}
        <ResizablePanel defaultSize={35} minSize={25} maxSize={50}>
          <div className="h-full flex flex-col">
            {/* Header with unified search */}
            <div className="p-4 border-b border-fixlyfy-border bg-gradient-to-r from-fixlyfy/5 to-fixlyfy-light/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-primary rounded-lg">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-fixlyfy-text">Messages</h2>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-fixlyfy-text-muted h-4 w-4" />
                <Input
                  placeholder="Search conversations or find new clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-fixlyfy-border focus:ring-2 focus:ring-fixlyfy/20 focus:border-fixlyfy"
                />
              </div>

              {/* Client search results dropdown */}
              {showClientResults && searchResults.length > 0 && (
                <div className="absolute left-4 right-4 mt-2 bg-white border border-fixlyfy-border rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                  <div className="p-2 text-xs font-medium text-fixlyfy-text-muted border-b border-fixlyfy-border">New clients:</div>
                  {searchResults.map((client) => (
                    <div
                      key={client.id}
                      onClick={() => handleClientSelect(client)}
                      className="p-3 hover:bg-fixlyfy/5 cursor-pointer border-b border-fixlyfy-border/50 last:border-b-0 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-fixlyfy-text">{client.name}</div>
                          {client.phone && (
                            <div className="text-sm text-fixlyfy-text-secondary">{client.phone}</div>
                          )}
                        </div>
                        <Plus className="h-4 w-4 text-fixlyfy" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Conversations List */}
            <div className="flex-1">
              <ConversationsList
                conversations={searchTerm ? filteredConversations : conversations}
                selectedConversation={selectedConversation}
                onConversationSelect={setSelectedConversation}
                isLoading={isLoading}
                onRefresh={refreshConversations}
                hideSearch={true}
              />
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle className="bg-fixlyfy-border hover:bg-fixlyfy/20 transition-colors w-1" />

        {/* Right Panel - Conversation View with AI Assistant at Bottom */}
        <ResizablePanel defaultSize={65} minSize={50} maxSize={75}>
          <div className="h-full flex flex-col bg-fixlyfy-bg-interface">
            {/* Conversation Display Area */}
            <div className="flex-1 overflow-hidden">
              <MessageThread selectedConversation={selectedConversation} />
            </div>
            
            {/* Message Input and AI Assistant */}
            <div className="border-t border-fixlyfy-border/50">
              <MessageInput 
                selectedConversation={selectedConversation}
                onMessageSent={handleMessageSent}
              />
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
