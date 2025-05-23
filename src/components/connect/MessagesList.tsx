
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { MessageDialog } from "@/components/messages/MessageDialog";
import { useConversations } from "./hooks/useConversations";
import { ConversationsList } from "./components/ConversationsList";
import { ConversationThread } from "./components/ConversationThread";
import { useRealTimeMessaging } from "./hooks/useRealTimeMessaging";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MessagesListProps {
  setOpenMessageDialog?: (isOpen: boolean) => void;
  setSelectedClient?: (client: any) => void;
}

export const MessagesList = ({ setOpenMessageDialog, setSelectedClient }: MessagesListProps) => {
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  
  const {
    conversations,
    activeConversation,
    isLoading,
    selectedClient: localSelectedClient,
    setSelectedClient: setLocalSelectedClient,
    handleConversationClick,
    refreshConversations
  } = useConversations();

  // Use real-time messaging hook to refresh conversations on new messages
  useRealTimeMessaging({
    onNewMessage: refreshConversations
  });

  // Fetch clients for the new message dialog
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('id, name, phone')
          .order('name');
          
        if (error) {
          throw error;
        }
        
        setClients(data || []);
      } catch (error) {
        console.error("Error fetching clients:", error);
        toast.error("Failed to load clients");
      }
    };
    
    fetchClients();
  }, []);

  const handleNewMessageClick = (client: any) => {
    // Use the parent component's state setter if provided
    if (setSelectedClient) {
      setSelectedClient(client);
    } else {
      setLocalSelectedClient(client);
    }
    
    // Use the parent component's dialog opener if provided
    if (setOpenMessageDialog) {
      setOpenMessageDialog(true);
    } else {
      setIsMessageDialogOpen(true);
    }
  };

  const activeConv = conversations.find(c => c.id === activeConversation);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Conversations List */}
      <Card className="p-0">
        <div className="p-4 border-b border-fixlyfy-border">
          <h3 className="font-medium">Recent Messages</h3>
        </div>
        
        <div className="h-[600px] overflow-y-auto">
          <ConversationsList
            conversations={conversations}
            activeConversation={activeConversation}
            isLoading={isLoading}
            onConversationClick={handleConversationClick}
          />
        </div>
      </Card>
      
      {/* Message Thread */}
      <Card className="p-0 md:col-span-2">
        <div className="h-[600px] flex flex-col">
          <ConversationThread conversation={activeConv} />
        </div>
      </Card>
      
      {/* Only render internal dialog if parent doesn't control it */}
      {!setOpenMessageDialog && (
        <MessageDialog
          open={isMessageDialogOpen}
          onOpenChange={setIsMessageDialogOpen}
          client={localSelectedClient || {
            name: "New Client",
            phone: ""
          }}
        />
      )}
    </div>
  );
};
