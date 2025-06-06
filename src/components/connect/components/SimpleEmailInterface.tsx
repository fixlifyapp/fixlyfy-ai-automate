import { useState, useEffect } from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { EmailConversationsPanel } from "./EmailConversationsPanel";
import { EmailThreadPanel } from "./EmailThreadPanel";
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

  const restoreArchivedEmailConversation = async (clientId: string) => {
    console.log('🔄 Restoring archived email conversation for client:', clientId);
    
    try {
      // Check if there's an archived email conversation for this client
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
        .eq('client_id', clientId)
        .eq('status', 'archived')
        .order('last_message_at', { ascending: false })
        .limit(1)
        .single();

      if (!error && archivedConv) {
        console.log('Found archived email conversation:', archivedConv.id);
        
        // Restore it to active status
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
          throw restoreError;
        }

        console.log('✅ Successfully restored archived email conversation');
        
        // Format the restored conversation with emails
        const sortedEmails = (archivedConv.email_messages || []).sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

        const restoredConversation: EmailConversation = {
          id: archivedConv.id,
          subject: archivedConv.subject,
          last_message_at: archivedConv.last_message_at,
          status: 'active',
          client_id: archivedConv.clients?.id || clientId,
          client: archivedConv.clients ? {
            id: archivedConv.clients.id,
            name: archivedConv.clients.name,
            email: archivedConv.clients.email,
            phone: archivedConv.clients.phone
          } : undefined,
          emails: sortedEmails
        };

        // Add to conversations list and set as selected
        setConversations(prev => [restoredConversation, ...prev]);
        setSelectedConversation(restoredConversation);
        
        return restoredConversation;
      } else {
        console.log('No archived email conversation found for client:', clientId);
        return null;
      }
    } catch (error) {
      console.error('Error in restoreArchivedEmailConversation:', error);
      return null;
    }
  };

  const handleNewEmail = () => {
    setShowNewEmailDialog(true);
  };

  const handleClientSelect = async (client: { id: string; name: string; email?: string; phone?: string; company?: string }) => {
    console.log('Selected client for email:', client);
    
    // First try to restore archived conversation
    const restoredConversation = await restoreArchivedEmailConversation(client.id);
    
    if (restoredConversation) {
      toast.success(`Restored email conversation with ${client.name} including history`);
      setShowNewEmailDialog(false);
      return;
    }

    // Check if there's an active conversation
    const existingConversation = conversations.find(conv => conv.client?.id === client.id);
    
    if (existingConversation) {
      setSelectedConversation(existingConversation);
      setShowNewEmailDialog(false);
      return;
    }

    // Create new conversation placeholder
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
    console.log('📧 Email sent, refreshing conversations...');
    
    // Force refresh conversations to show the new/updated conversation
    loadConversations();
    
    // Clear selection temporarily to force re-render, then restore after refresh
    const currentConversation = selectedConversation;
    if (currentConversation) {
      setSelectedConversation(null);
      
      // After refresh, try to restore the selection with updated conversation
      setTimeout(() => {
        loadConversations().then(() => {
          setTimeout(() => {
            const updatedConversation = conversations.find(conv => 
              conv.client?.id === currentConversation.client?.id
            );
            
            if (updatedConversation) {
              setSelectedConversation(updatedConversation);
              console.log('✅ Restored selection to updated email conversation');
            } else {
              // If still not found, keep the original selection
              setSelectedConversation(currentConversation);
              console.log('⚠️ Could not find updated email conversation, keeping original');
            }
          }, 500);
        });
      }, 100);
    }
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
          <EmailConversationsPanel
            conversations={conversations}
            selectedConversation={selectedConversation}
            onConversationSelect={setSelectedConversation}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            isLoading={isLoading}
            onRefresh={handleRefresh}
            onNewEmail={handleNewEmail}
            filteredConversations={filteredConversations}
          />
        </ResizablePanel>

        <ResizableHandle withHandle className="bg-fixlyfy-border hover:bg-fixlyfy/20 transition-colors w-1" />

        {/* Right Panel - Email Thread View */}
        <ResizablePanel defaultSize={65} minSize={50} maxSize={75}>
          <EmailThreadPanel
            selectedConversation={selectedConversation}
            onMessageSent={handleMessageSent}
          />
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
