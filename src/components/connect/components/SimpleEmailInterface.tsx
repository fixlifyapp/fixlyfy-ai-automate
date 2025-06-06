
import { useState, useEffect } from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Mail, Plus, RefreshCw } from "lucide-react";
import { EmailConversationsList } from "./EmailConversationsList";
import { EmailMessageInput } from "./EmailMessageInput";
import { ClientSelectionDialog } from "./ClientSelectionDialog";
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

export const SimpleEmailInterface = () => {
  const [conversations, setConversations] = useState<EmailConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<EmailConversation | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showNewEmailDialog, setShowNewEmailDialog] = useState(false);

  const loadConversations = async () => {
    setIsLoading(true);
    try {
      console.log('📧 Loading email conversations...');
      
      const { data: conversationsData, error } = await supabase
        .from('email_conversations')
        .select(`
          id,
          subject,
          last_message_at,
          status,
          client_id,
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
        .eq('status', 'active')
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading email conversations:', error);
        throw error;
      }

      console.log('📧 Raw email conversations:', conversationsData);

      const formattedConversations: EmailConversation[] = (conversationsData || []).map(conv => ({
        id: conv.id,
        subject: conv.subject,
        last_message_at: conv.last_message_at,
        status: conv.status,
        client_id: conv.client_id,
        client: conv.clients ? {
          id: conv.clients.id,
          name: conv.clients.name,
          email: conv.clients.email,
          phone: conv.clients.phone
        } : undefined,
        emails: conv.email_messages || []
      }));

      console.log('📧 Formatted email conversations:', formattedConversations);
      setConversations(formattedConversations);
      
    } catch (error) {
      console.error('💥 Error loading email conversations:', error);
      toast.error('Failed to load email conversations');
      setConversations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewEmail = () => {
    setShowNewEmailDialog(true);
  };

  const handleClientSelect = (client: { id: string; name: string; email?: string; phone?: string; company?: string }) => {
    const newConversation: EmailConversation = {
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
    
    setSelectedConversation(newConversation);
    setShowNewEmailDialog(false);
    toast.success(`Started new email conversation with ${client.name}`);
  };

  const handleMessageSent = () => {
    // Refresh conversations and clear selection to show updated list
    loadConversations();
    
    // Clear the selection to force user to see the updated conversation in the list
    setTimeout(() => {
      setSelectedConversation(null);
    }, 1000);
  };

  const handleRefresh = () => {
    loadConversations();
  };

  // Auto-refresh every 10 seconds
  useEffect(() => {
    loadConversations();
    
    const interval = setInterval(() => {
      loadConversations();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv =>
    conv.client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (conv.client?.email && conv.client.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="h-[700px] border border-fixlyfy-border rounded-xl overflow-hidden bg-white shadow-card">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Left Panel - Email Conversations */}
        <ResizablePanel defaultSize={35} minSize={25} maxSize={50}>
          <div className="h-full flex flex-col">
            {/* Header with search and new email */}
            <div className="p-4 border-b border-fixlyfy-border bg-gradient-to-r from-fixlyfy/5 to-fixlyfy-light/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-primary rounded-lg">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-fixlyfy-text">Email Conversations</h2>
              </div>
              
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-fixlyfy-text-muted h-4 w-4" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-fixlyfy-border focus:ring-2 focus:ring-fixlyfy/20 focus:border-fixlyfy"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
                className="border-fixlyfy-border hover:bg-fixlyfy/5 mt-2"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                onClick={handleNewEmail}
                className="bg-fixlyfy hover:bg-fixlyfy-light text-white mt-2 ml-2"
              >
                <Plus className="h-4 w-4 mr-1" />
                New
              </Button>
            </div>

            {/* Conversations List */}
            <div className="flex-1">
              <EmailConversationsList
                conversations={searchTerm ? filteredConversations : conversations}
                selectedConversation={selectedConversation}
                onConversationSelect={setSelectedConversation}
                isLoading={isLoading}
                onRefresh={handleRefresh}
                onNewEmail={handleNewEmail}
              />
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle className="bg-fixlyfy-border hover:bg-fixlyfy/20 transition-colors w-1" />

        {/* Right Panel - Email Thread View */}
        <ResizablePanel defaultSize={65} minSize={50} maxSize={75}>
          <div className="h-full flex flex-col bg-fixlyfy-bg-interface">
            {/* Email Thread Display */}
            <div className="flex-1 overflow-hidden">
              {selectedConversation ? (
                <div className="h-full flex flex-col">
                  {/* Thread Header */}
                  <div className="p-4 border-b border-fixlyfy-border/50 bg-white">
                    <h3 className="font-semibold text-fixlyfy-text mb-1">
                      {selectedConversation.client?.name || 'Unknown Client'}
                    </h3>
                    <p className="text-sm text-fixlyfy-text-secondary mb-2">
                      {selectedConversation.client?.email}
                    </p>
                    <p className="text-sm font-medium text-fixlyfy-text">
                      {selectedConversation.subject}
                    </p>
                  </div>
                  
                  {/* Email Messages */}
                  <ScrollArea className="flex-1 p-4">
                    {selectedConversation.emails.length === 0 ? (
                      <div className="text-center py-8 text-fixlyfy-text-muted">
                        <Mail className="h-8 w-8 mx-auto mb-3 text-fixlyfy-text-muted" />
                        <p>No emails yet</p>
                        <p className="text-xs mt-1">Start the conversation below</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {selectedConversation.emails.map((email, index) => (
                          <Card key={index} className="max-w-2xl">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-fixlyfy-text">
                                  {email.direction === 'inbound' ? email.sender_email : 'You'}
                                </span>
                                <span className="text-xs text-fixlyfy-text-muted">
                                  {new Date(email.created_at).toLocaleString()}
                                </span>
                              </div>
                              {email.subject && (
                                <p className="text-sm font-medium text-fixlyfy-text mb-2">
                                  Subject: {email.subject}
                                </p>
                              )}
                              <div className="text-sm text-fixlyfy-text-secondary">
                                {email.body_text || email.body_html?.replace(/<[^>]*>/g, '') || 'No content'}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-center p-8">
                  <div>
                    <Mail className="h-12 w-12 mx-auto mb-4 text-fixlyfy-text-muted" />
                    <h3 className="text-lg font-medium text-fixlyfy-text mb-2">No conversation selected</h3>
                    <p className="text-fixlyfy-text-secondary">
                      Select an email conversation from the list or start a new one
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Email Input */}
            <div className="border-t border-fixlyfy-border/50">
              <EmailMessageInput 
                selectedConversation={selectedConversation}
                onMessageSent={handleMessageSent}
              />
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Client Selection Dialog for New Emails */}
      <ClientSelectionDialog
        open={showNewEmailDialog}
        onOpenChange={setShowNewEmailDialog}
        onClientSelect={handleClientSelect}
      />
    </div>
  );
};
