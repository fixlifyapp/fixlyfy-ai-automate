import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mail, Send, Reply, Archive, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { EmailThread } from './components/EmailThread';
import { EmailInput } from './components/EmailInput';
import { useLocation, useNavigate } from 'react-router-dom';

interface EmailMessage {
  id: string;
  sender_email: string;
  recipient_email: string;
  subject: string;
  body_html: string;
  body_text: string;
  direction: 'inbound' | 'outbound';
  delivery_status: string;
  created_at: string;
}

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
  emails: EmailMessage[];
}

export const EmailManagement = () => {
  const [conversations, setConversations] = useState<EmailConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<EmailConversation | null>(null);
  const [loading, setLoading] = useState(true);
  
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const clientId = searchParams.get("clientId");
  const clientName = searchParams.get("clientName");
  const clientEmail = searchParams.get("clientEmail");
  const autoOpen = searchParams.get("autoOpen") === "true";

  const fetchConversations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get company settings
      const { data: companySettings } = await supabase
        .from('company_settings')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!companySettings) return;

      // Fetch conversations with messages
      const { data: conversationsData, error } = await supabase
        .from('email_conversations')
        .select(`
          id,
          subject,
          last_message_at,
          status,
          client_id,
          email_messages (
            id,
            sender_email,
            recipient_email,
            subject,
            body_html,
            body_text,
            direction,
            delivery_status,
            created_at
          )
        `)
        .eq('company_id', companySettings.id)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      // Get client information for conversations
      const conversationsWithClients = await Promise.all(
        (conversationsData || []).map(async (conv) => {
          let clientInfo = null;
          
          if (conv.client_id) {
            const { data: client } = await supabase
              .from('clients')
              .select('id, name, email, phone')
              .eq('id', conv.client_id)
              .single();
            
            if (client) {
              clientInfo = client;
            }
          }
          
          // If no client info from database, try to extract from email messages
          if (!clientInfo && conv.email_messages?.length > 0) {
            const firstMessage = conv.email_messages[0];
            const clientEmailAddr = firstMessage.direction === 'inbound' 
              ? firstMessage.sender_email 
              : firstMessage.recipient_email;
              
            clientInfo = {
              id: 'email_' + clientEmailAddr,
              name: clientEmailAddr.split('@')[0],
              email: clientEmailAddr,
              phone: null
            };
          }

          return {
            id: conv.id,
            subject: conv.subject,
            last_message_at: conv.last_message_at,
            status: conv.status,
            client_id: conv.client_id,
            client: clientInfo,
            emails: (conv.email_messages || []).map(msg => ({
              id: msg.id,
              sender_email: msg.sender_email,
              recipient_email: msg.recipient_email,
              subject: msg.subject,
              body_html: msg.body_html,
              body_text: msg.body_text,
              direction: msg.direction as 'inbound' | 'outbound',
              delivery_status: msg.delivery_status,
              created_at: msg.created_at
            })).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
          };
        })
      );

      setConversations(conversationsWithClients as EmailConversation[]);
    } catch (error) {
      console.error('Error fetching email conversations:', error);
      toast.error('Failed to load email conversations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();

    // Set up real-time subscription for new emails
    const channel = supabase
      .channel('email-updates')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'email_messages' 
      }, () => {
        fetchConversations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const handleAutoOpenEmail = async () => {
      if (!clientId || !clientName || !clientEmail || !autoOpen) return;

      console.log('Email Management: Auto-opening email for client:', clientName);

      // Check if there's already a conversation with this client
      const existingConversation = conversations.find(conv => 
        conv.client?.email === clientEmail || conv.client_id === clientId
      );

      if (existingConversation) {
        setSelectedConversation(existingConversation);
      } else {
        // Create a new conversation placeholder
        const newConversation: EmailConversation = {
          id: 'new_' + Date.now(),
          subject: `New conversation with ${clientName}`,
          last_message_at: new Date().toISOString(),
          status: 'active',
          client_id: clientId,
          client: {
            id: clientId,
            name: clientName,
            email: clientEmail,
            phone: searchParams.get("clientPhone") || undefined
          },
          emails: []
        };

        setSelectedConversation(newConversation);
      }

      // Clear the autoOpen parameter from URL
      const newSearchParams = new URLSearchParams(location.search);
      newSearchParams.delete("autoOpen");
      const newUrl = `${location.pathname}?${newSearchParams.toString()}`;
      navigate(newUrl, { replace: true });
    };

    if (autoOpen && conversations.length >= 0) {
      handleAutoOpenEmail();
    }
  }, [clientId, clientName, clientEmail, autoOpen, conversations, navigate, location]);

  const getConversationPreview = (conversation: EmailConversation) => {
    const latestMessage = conversation.emails?.[conversation.emails.length - 1];
    if (!latestMessage) return 'No messages';
    
    const content = latestMessage.body_text || latestMessage.body_html || 'No content';
    return content.replace(/<[^>]*>/g, '').substring(0, 100) + (content.length > 100 ? '...' : '');
  };

  const getUnreadCount = (conversation: EmailConversation) => {
    return conversation.emails?.filter(msg => 
      msg.direction === 'inbound' && msg.delivery_status !== 'read'
    ).length || 0;
  };

  const handleNewEmail = () => {
    const newConversation: EmailConversation = {
      id: 'new_conversation_' + Date.now(),
      subject: 'New Email',
      last_message_at: new Date().toISOString(),
      status: 'active',
      client: {
        id: 'new_client',
        name: 'New Client',
        email: '',
      },
      emails: []
    };
    setSelectedConversation(newConversation);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fixlyfy mx-auto mb-4"></div>
          <p className="text-fixlyfy-text-secondary">Loading email conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <Card className="h-full flex flex-col">
            <CardHeader className="flex-shrink-0 pb-3">
              <CardTitle className="flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-fixlyfy" />
                  <span className="text-fixlyfy-text">Email Conversations</span>
                  <Badge variant="secondary" className="bg-fixlyfy/10 text-fixlyfy">
                    {conversations.length}
                  </Badge>
                </div>
                <Button 
                  size="sm" 
                  onClick={handleNewEmail} 
                  className="gap-1 bg-fixlyfy hover:bg-fixlyfy-light text-white"
                >
                  <Plus className="h-4 w-4" />
                  New
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 min-h-0">
              <ScrollArea className="h-full">
                {conversations.length === 0 ? (
                  <div className="p-4 text-center text-fixlyfy-text-secondary">
                    <Mail className="h-8 w-8 mx-auto mb-3 text-fixlyfy-text-muted" />
                    <p className="text-sm">No email conversations yet</p>
                    <p className="text-xs mt-1">Click "New" to start</p>
                  </div>
                ) : (
                  <div className="space-y-0">
                    {conversations.map((conversation) => {
                      const unreadCount = getUnreadCount(conversation);
                      const isSelected = selectedConversation?.id === conversation.id;
                      
                      return (
                        <div
                          key={conversation.id}
                          className={`p-3 cursor-pointer border-b border-fixlyfy-border/30 hover:bg-fixlyfy/5 transition-colors ${
                            isSelected ? 'bg-fixlyfy/10 border-l-2 border-l-fixlyfy' : ''
                          }`}
                          onClick={() => setSelectedConversation(conversation)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-medium text-sm truncate flex-1 text-fixlyfy-text">
                              {conversation.client?.name || 'Unknown Client'}
                            </div>
                            {unreadCount > 0 && (
                              <Badge className="ml-2 bg-fixlyfy text-white text-xs">
                                {unreadCount}
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-fixlyfy-text-secondary mb-1 font-medium truncate">
                            {conversation.subject}
                          </div>
                          <div className="text-xs text-fixlyfy-text-muted line-clamp-2">
                            {getConversationPreview(conversation)}
                          </div>
                          <div className="text-xs text-fixlyfy-text-muted mt-1">
                            {new Date(conversation.last_message_at).toLocaleDateString()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Email Detail */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            <CardContent className="p-0 h-full flex flex-col min-h-0">
              <div className="flex-1 min-h-0">
                <EmailThread selectedConversation={selectedConversation} />
              </div>
              {selectedConversation && (
                <div className="flex-shrink-0 border-t border-fixlyfy-border/50">
                  <EmailInput 
                    selectedConversation={selectedConversation}
                    onEmailSent={fetchConversations}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
