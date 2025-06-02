
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mail, Send, Reply, Archive } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  messages: EmailMessage[];
}

export const EmailManagement = () => {
  const [conversations, setConversations] = useState<EmailConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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

      // Transform the data to match our interface
      const transformedConversations: EmailConversation[] = (conversationsData || []).map(conv => ({
        id: conv.id,
        subject: conv.subject,
        last_message_at: conv.last_message_at,
        status: conv.status,
        messages: conv.email_messages || []
      }));

      setConversations(transformedConversations);
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

  const getConversationPreview = (conversation: EmailConversation) => {
    const latestMessage = conversation.messages?.[0];
    if (!latestMessage) return 'No messages';
    
    return latestMessage.body_text?.substring(0, 100) + '...' || 'No content';
  };

  const getUnreadCount = (conversation: EmailConversation) => {
    return conversation.messages?.filter(msg => 
      msg.direction === 'inbound' && msg.delivery_status !== 'read'
    ).length || 0;
  };

  if (loading) {
    return <div>Loading email conversations...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Conversations List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Conversations
            <Badge variant="secondary">{conversations.length}</Badge>
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
                  const isSelected = selectedConversation === conversation.id;
                  
                  return (
                    <div
                      key={conversation.id}
                      className={`p-4 cursor-pointer border-b hover:bg-gray-50 ${
                        isSelected ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                      onClick={() => setSelectedConversation(conversation.id)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium text-sm truncate flex-1">
                          {conversation.subject}
                        </div>
                        {unreadCount > 0 && (
                          <Badge variant="default" className="ml-2">
                            {unreadCount}
                          </Badge>
                        )}
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

      {/* Message Detail */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>
              {selectedConversation ? 
                conversations.find(c => c.id === selectedConversation)?.subject :
                'Select a conversation'
              }
            </span>
            {selectedConversation && (
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Reply className="h-4 w-4 mr-1" />
                  Reply
                </Button>
                <Button size="sm" variant="outline">
                  <Archive className="h-4 w-4 mr-1" />
                  Archive
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            {selectedConversation ? (
              <div className="space-y-4 p-4">
                {conversations
                  .find(c => c.id === selectedConversation)
                  ?.messages?.sort((a, b) => 
                    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                  )
                  .map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 rounded-lg ${
                        message.direction === 'inbound' 
                          ? 'bg-gray-50 ml-8' 
                          : 'bg-blue-50 mr-8'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-medium text-sm">
                          {message.direction === 'inbound' ? message.sender_email : message.recipient_email}
                        </div>
                        <div className="flex gap-2">
                          <Badge 
                            variant={message.direction === 'inbound' ? 'default' : 'secondary'}
                          >
                            {message.direction === 'inbound' ? 'Received' : 'Sent'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(message.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div 
                        className="text-sm"
                        dangerouslySetInnerHTML={{ 
                          __html: message.body_html || message.body_text || 'No content' 
                        }}
                      />
                    </div>
                  ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select an email conversation to view messages</p>
                </div>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
