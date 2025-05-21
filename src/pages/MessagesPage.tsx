
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Plus, PhoneIncoming, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PhoneNumberPurchaseDialog } from "@/components/messages/PhoneNumberPurchaseDialog";
import { MessagesList } from "@/components/messages/MessagesList";
import { ConversationsList } from "@/components/messages/ConversationsList";
import { MessageComposer } from "@/components/messages/MessageComposer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const MessagesPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("conversations");
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false);
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState(null);

  useEffect(() => {
    if (user) {
      fetchUserPhoneNumbers();
    }
  }, [user]);

  const fetchUserPhoneNumbers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('twilio', {
        body: { action: 'list', userId: user?.id }
      });

      if (error) throw error;
      setPhoneNumbers(data.numbers || []);
    } catch (error) {
      console.error('Error fetching phone numbers:', error);
      toast.error('Failed to load your phone numbers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
  };

  return (
    <PageLayout>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Messaging Center</h1>
            <p className="text-fixlyfy-text-secondary">
              Manage conversations with your clients
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={fetchUserPhoneNumbers}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
              Refresh
            </Button>
            <Button 
              onClick={() => setIsPurchaseDialogOpen(true)}
              className="gap-2"
            >
              <PhoneIncoming size={16} />
              Get Phone Number
            </Button>
          </div>
        </div>

        {phoneNumbers.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <Card className="h-[calc(100vh-12rem)]">
                <CardHeader className="py-3">
                  <CardTitle className="text-lg">Conversations</CardTitle>
                </CardHeader>
                <CardContent className="p-0 h-full overflow-hidden">
                  <ConversationsList 
                    onSelectConversation={handleConversationSelect}
                    selectedConversation={selectedConversation}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-3">
              <Card className="h-[calc(100vh-12rem)] flex flex-col">
                <CardHeader className="py-3 border-b">
                  {selectedConversation ? (
                    <CardTitle className="text-lg">
                      {selectedConversation.client?.name || 'Conversation'}
                      <span className="text-sm text-muted-foreground ml-2">
                        {selectedConversation.client?.phone}
                      </span>
                    </CardTitle>
                  ) : (
                    <CardTitle className="text-lg">Select a conversation</CardTitle>
                  )}
                </CardHeader>
                <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
                  {selectedConversation ? (
                    <>
                      <div className="flex-1 overflow-y-auto p-4">
                        <MessagesList conversationId={selectedConversation.id} />
                      </div>
                      <div className="p-4 border-t">
                        <MessageComposer 
                          conversationId={selectedConversation.id}
                          recipientPhone={selectedConversation.client?.phone}
                          senderPhone={phoneNumbers[0]?.phone_number}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      Select a conversation to view messages
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <Card className="p-6 flex flex-col items-center justify-center min-h-[400px]">
            <PhoneIncoming size={48} className="mb-4 text-fixlyfy-text-secondary" />
            <h2 className="text-xl font-semibold mb-2">No Phone Numbers Yet</h2>
            <p className="text-fixlyfy-text-secondary text-center max-w-md mb-4">
              You need to purchase a phone number to start messaging with your clients.
            </p>
            <Button onClick={() => setIsPurchaseDialogOpen(true)}>
              <Plus size={18} className="mr-2" /> Get Your First Phone Number
            </Button>
          </Card>
        )}

        <PhoneNumberPurchaseDialog
          open={isPurchaseDialogOpen}
          onOpenChange={setIsPurchaseDialogOpen}
          onSuccess={fetchUserPhoneNumbers}
          userId={user?.id}
        />
      </div>
    </PageLayout>
  );
};

export default MessagesPage;
