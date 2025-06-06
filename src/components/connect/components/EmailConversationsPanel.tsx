
import { EmailInterfaceHeader } from "./EmailInterfaceHeader";
import { EmailConversationsList } from "./EmailConversationsList";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EmailConversation {
  id: string;
  subject: string;
  last_message_at: string;
  status: string;
  client_id?: string;
  client?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  emails: any[];
}

interface SearchResult {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

interface EmailConversationsPanelProps {
  conversations: EmailConversation[];
  selectedConversation: EmailConversation | null;
  onConversationSelect: (conversation: EmailConversation) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  isLoading: boolean;
  onRefresh: () => void;
  onNewEmail: () => void;
  filteredConversations: EmailConversation[];
}

export const EmailConversationsPanel = ({
  conversations,
  selectedConversation,
  onConversationSelect,
  searchTerm,
  onSearchChange,
  isLoading,
  onRefresh,
  onNewEmail,
  filteredConversations
}: EmailConversationsPanelProps) => {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showClientResults, setShowClientResults] = useState(false);

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
        conv.client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (conv.client?.email && conv.client.email.toLowerCase().includes(searchTerm.toLowerCase()))
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
          .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
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
    console.log('Selected client from email search:', client);
    
    // First check if there's an archived email conversation for this client
    try {
      const { data: archivedConv, error } = await supabase
        .from('email_conversations')
        .select(`
          id,
          status,
          subject,
          last_message_at,
          created_at,
          clients:client_id (
            id,
            name,
            email,
            phone
          ),
          email_messages (
            id,
            subject,
            body_text,
            body_html,
            direction,
            delivery_status,
            created_at,
            sender_email,
            recipient_email
          )
        `)
        .eq('client_id', client.id)
        .order('last_message_at', { ascending: false })
        .limit(1)
        .single();

      if (!error && archivedConv) {
        console.log('Found existing email conversation for client:', archivedConv.status);
        
        if (archivedConv.status === 'archived') {
          console.log('🔄 Restoring archived email conversation for:', client.name);
          
          // Restore the conversation
          const { error: restoreError } = await supabase
            .from('email_conversations')
            .update({ 
              status: 'active',
              last_message_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', archivedConv.id);

          if (restoreError) {
            console.error('Error restoring email conversation:', restoreError);
            toast.error('Failed to restore email conversation');
            return;
          }

          // Format the restored conversation with emails
          const sortedEmails = (archivedConv.email_messages || []).sort((a, b) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );

          const restoredConversation = {
            id: archivedConv.id,
            subject: archivedConv.subject,
            last_message_at: archivedConv.last_message_at,
            status: 'active',
            client_id: archivedConv.clients?.id || client.id,
            client: {
              id: archivedConv.clients?.id || client.id,
              name: archivedConv.clients?.name || client.name,
              email: archivedConv.clients?.email || client.email || '',
              phone: archivedConv.clients?.phone || client.phone || undefined
            },
            emails: sortedEmails
          };

          onConversationSelect(restoredConversation);
          toast.success(`Restored email conversation with ${client.name} including message history`);
          
          // Refresh the conversations list to show the restored conversation
          setTimeout(() => {
            onRefresh();
          }, 500);
        } else {
          // Conversation is already active, select it
          const activeConversation = conversations.find(conv => conv.client?.id === client.id);
          if (activeConversation) {
            onConversationSelect(activeConversation);
          }
        }
      } else {
        // No existing conversation, create a new one
        const newConversation = {
          id: `new_email_${client.id}_${Date.now()}`,
          subject: `New conversation with ${client.name}`,
          last_message_at: new Date().toISOString(),
          status: 'active',
          client_id: client.id,
          client: {
            id: client.id,
            name: client.name,
            email: client.email || '',
            phone: client.phone || undefined
          },
          emails: []
        };
        
        onConversationSelect(newConversation);
        console.log('Created new email conversation placeholder for client:', client.name);
      }
    } catch (error) {
      console.error('Error checking for existing email conversation:', error);
      toast.error('Failed to check email conversation history');
    }

    setSearchTerm("");
    setShowClientResults(false);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-fixlyfy-border bg-gradient-to-r from-fixlyfy/5 to-fixlyfy-light/5">
        <EmailInterfaceHeader
          searchTerm=""
          onSearchChange={() => {}}
          onRefresh={onRefresh}
          onNewEmail={onNewEmail}
          isLoading={isLoading}
        />
        
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-fixlyfy-text-muted h-4 w-4" />
          <Input
            placeholder="Search conversations or find new clients..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
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
                    {client.email && (
                      <div className="text-sm text-fixlyfy-text-secondary">{client.email}</div>
                    )}
                  </div>
                  <Plus className="h-4 w-4 text-fixlyfy" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1">
        <EmailConversationsList
          conversations={searchTerm ? filteredConversations : conversations}
          selectedConversation={selectedConversation}
          onConversationSelect={onConversationSelect}
          isLoading={isLoading}
          onRefresh={onRefresh}
          onNewEmail={onNewEmail}
        />
      </div>
    </div>
  );
};
