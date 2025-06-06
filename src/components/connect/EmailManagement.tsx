
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

      // Get company settings to find company_id
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

      // Create a mock conversation for new client
      const mockConversation: EmailConversation = {
        id: 'new_' + clientId,
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

      setSelectedConversation(mockConversation);

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
    
    return latestMessage.body_text?.substring(0, 100) + '...' || 
           latestMessage.body_html?.substring(0, 100) + '...' || 
           'No content';
  };

  const getUnreadCount = (conversation: EmailConversation) => {
    return conversation.emails?.filter(msg => 
      msg.direction === 'inbound' && msg.delivery_status !== 'read'
    ).length || 0;
  };

  const handleNewEmail = () => {
    // Create a new conversation placeholder
    const newConversation: EmailConversation = {
      id: 'new_conversation',
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
    return <div>Loading email conversations...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Conversations List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Conversations
              <Badge variant="secondary">{conversations.length}</Badge>
            </div>
            <Button size="sm" onClick={handleNewEmail} className="gap-1">
              <Plus className="h-4 w-4" />
              New
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No email conversations yet
              </div>
            ) : (
              <div className="space-y-1">
                {conversations.map((conversation) => {
                  const unreadCount = getUnreadCount(conversation);
                  const isSelected = selectedConversation?.id === conversation.id;
                  
                  return (
                    <div
                      key={conversation.id}
                      className={`p-4 cursor-pointer border-b hover:bg-gray-50 ${
                        isSelected ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium text-sm truncate flex-1">
                          {conversation.client?.name || 'Unknown Client'}
                        </div>
                        {unreadCount > 0 && (
                          <Badge variant="default" className="ml-2">
                            {unreadCount}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mb-1">
                        {conversation.subject}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {getConversationPreview(conversation)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
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

      {/* Email Detail */}
      <Card className="lg:col-span-2">
        <CardContent className="p-0 h-[600px] flex flex-col">
          <div className="flex-1">
            <EmailThread selectedConversation={selectedConversation} />
          </div>
          {selectedConversation && (
            <div className="border-t">
              <EmailInput 
                selectedConversation={selectedConversation}
                onEmailSent={fetchConversations}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
