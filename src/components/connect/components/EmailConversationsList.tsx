import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail, Plus, RefreshCw, Archive } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";
import { ClientSelectionDialog } from "./ClientSelectionDialog";

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

interface EmailConversationsListProps {
  conversations: EmailConversation[];
  selectedConversation: EmailConversation | null;
  onConversationSelect: (conversation: EmailConversation) => void;
  isLoading: boolean;
  onRefresh: () => void;
  onNewEmail: () => void;
}

export const EmailConversationsList = ({
  conversations,
  selectedConversation,
  onConversationSelect,
  isLoading,
  onRefresh,
  onNewEmail
}: EmailConversationsListProps) => {
  const [archivedConversations, setArchivedConversations] = useState<Set<string>>(new Set());
  const [showClientDialog, setShowClientDialog] = useState(false);
  
  const getConversationPreview = (conversation: EmailConversation) => {
    const latestEmail = conversation.emails?.[conversation.emails.length - 1];
    if (!latestEmail) return 'No messages yet';
    
    const content = latestEmail.body_text || latestEmail.body_html || 'No content';
    return content.replace(/<[^>]*>/g, '').substring(0, 100) + (content.length > 100 ? '...' : '');
  };

  const getUnreadCount = (conversation: EmailConversation) => {
    return conversation.emails?.filter(email => 
      email.direction === 'inbound' && email.delivery_status !== 'read'
    ).length || 0;
  };

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

      if (diffInHours < 24) {
        return date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
      } else if (diffInHours < 24 * 7) {
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      } else {
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        });
      }
    } catch {
      return 'Unknown';
    }
  };

  const handleArchiveConversation = (conversationId: string, clientName: string) => {
    setArchivedConversations(prev => new Set([...prev, conversationId]));
    toast.success(`Email conversation with ${clientName} archived`);
    
    // If the archived conversation was selected, clear the selection
    if (selectedConversation?.id === conversationId) {
      onConversationSelect(null);
    }
  };

  const handleNewEmailClick = () => {
    setShowClientDialog(true);
  };

  const handleClientSelect = (client: { id: string; name: string; email?: string; phone?: string; company?: string }) => {
    // Create a new conversation with the selected client
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
    toast.success(`Started new email conversation with ${client.name}`);
  };

  // Filter out archived conversations
  const activeConversations = conversations.filter(conv => !archivedConversations.has(conv.id));

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fixlyfy mx-auto mb-4"></div>
        <p className="text-fixlyfy-text-secondary">Loading email conversations...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header Actions */}
      <div className="p-3 border-b border-fixlyfy-border/30 bg-fixlyfy-bg-interface">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-fixlyfy/10 text-fixlyfy">
              {activeConversations.length}
            </Badge>
            <span className="text-sm text-fixlyfy-text-secondary">conversations</span>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              onClick={handleNewEmailClick}
              className="gap-1 bg-fixlyfy hover:bg-fixlyfy-light text-white h-8 px-3"
            >
              <Plus className="h-3 w-3" />
              <span className="text-xs">New</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        {activeConversations.length === 0 ? (
          <div className="p-6 text-center text-fixlyfy-text-secondary">
            <Mail className="h-8 w-8 mx-auto mb-3 text-fixlyfy-text-muted" />
            <p className="text-sm">No email conversations yet</p>
            <p className="text-xs mt-1">Click "New" to start an email conversation</p>
          </div>
        ) : (
          <div className="space-y-0">
            {activeConversations.map((conversation) => {
              const unreadCount = getUnreadCount(conversation);
              const isSelected = selectedConversation?.id === conversation.id;
              
              return (
                <div
                  key={conversation.id}
                  className={cn(
                    "group relative p-3 cursor-pointer border-b border-fixlyfy-border/30 hover:bg-fixlyfy/5 transition-colors",
                    isSelected && "bg-fixlyfy/10 border-l-2 border-l-fixlyfy"
                  )}
                  onClick={() => onConversationSelect(conversation)}
                >
                  <div className="flex gap-3">
                    {/* Avatar */}
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarFallback className="bg-fixlyfy/20 text-fixlyfy font-medium">
                        {conversation.client?.name?.substring(0, 2).toUpperCase() || 'NC'}
                      </AvatarFallback>
                    </Avatar>

                    {/* Conversation Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <div className="font-medium text-sm truncate flex-1 text-fixlyfy-text">
                          {conversation.client?.name || 'Unknown Client'}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          {unreadCount > 0 && (
                            <Badge className="bg-fixlyfy text-white text-xs min-w-[20px] h-5 flex items-center justify-center">
                              {unreadCount}
                            </Badge>
                          )}
                          <span className="text-xs text-fixlyfy-text-muted">
                            {formatTime(conversation.last_message_at)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-xs text-fixlyfy-text-secondary mb-1 font-medium truncate">
                        {conversation.subject}
                      </div>
                      
                      <div className="text-xs text-fixlyfy-text-muted line-clamp-2">
                        {getConversationPreview(conversation)}
                      </div>

                      {conversation.client?.email && (
                        <div className="text-xs text-fixlyfy-text-muted mt-1 truncate">
                          {conversation.client.email}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Archive button - appears on hover */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleArchiveConversation(conversation.id, conversation.client?.name || 'Unknown Client');
                      }}
                      className="h-8 w-8 p-0 bg-white/80 hover:bg-white shadow-sm"
                      title="Archive conversation"
                    >
                      <Archive className="h-4 w-4 text-fixlyfy-text-muted" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Client Selection Dialog */}
      <ClientSelectionDialog
        open={showClientDialog}
        onOpenChange={setShowClientDialog}
        onClientSelect={handleClientSelect}
      />
    </div>
  );
};
