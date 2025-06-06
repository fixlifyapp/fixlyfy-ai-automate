
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
  const { conversations, refreshConversations, isLoading } = useMessageContext();
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showClientResults, setShowClientResults] = useState(false);

  console.log('SimpleMessagesInterface conversations:', conversations);

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
    refreshConversations();
  };

  // Filter conversations based on search term
  const filteredConversations = conversations.filter(conv =>
    conv.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (conv.client.phone && conv.client.phone.includes(searchTerm))
  );

  return (
    <div className="h-[700px] border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Left Panel - Conversations List with Search */}
        <ResizablePanel defaultSize={35} minSize={25} maxSize={50}>
          <div className="h-full flex flex-col">
            {/* Header with unified search */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="h-6 w-6 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-800">Messages</h2>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search conversations or find new clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Client search results dropdown */}
              {showClientResults && searchResults.length > 0 && (
                <div className="absolute left-4 right-4 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                  <div className="p-2 text-xs font-medium text-gray-500 border-b">New clients:</div>
                  {searchResults.map((client) => (
                    <div
                      key={client.id}
                      onClick={() => handleClientSelect(client)}
                      className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{client.name}</div>
                          {client.phone && (
                            <div className="text-sm text-gray-500">{client.phone}</div>
                          )}
                        </div>
                        <Plus className="h-4 w-4 text-blue-500" />
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

        <ResizableHandle withHandle className="bg-gray-300 hover:bg-blue-300 transition-colors w-1" />

        {/* Right Panel - Message Thread and Input */}
        <ResizablePanel defaultSize={65} minSize={50} maxSize={75}>
          <div className="h-full flex flex-col bg-gray-50">
            <div className="flex-1">
              <MessageThread selectedConversation={selectedConversation} />
            </div>
            <MessageInput 
              selectedConversation={selectedConversation}
              onMessageSent={handleMessageSent}
            />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
