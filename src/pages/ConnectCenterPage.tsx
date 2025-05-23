
import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessagesList } from "@/components/connect/MessagesList";
import { CallsList } from "@/components/connect/CallsList";
import { EmailsList } from "@/components/connect/EmailsList";
import { PhoneNumbersList } from "@/components/connect/PhoneNumbersList";
import { Button } from "@/components/ui/button";
import { MessageSquare, Phone, Mail, Plus, PhoneCall } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "react-router-dom";
import { MessageDialog } from "@/components/messages/MessageDialog";
import { ConnectSearch } from "@/components/connect/components/ConnectSearch";
import { supabase } from "@/integrations/supabase/client";

const ConnectCenterPage = () => {
  const [activeTab, setActiveTab] = useState("messages");
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<{name: string; phone?: string; id?: string} | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [unreadCounts, setUnreadCounts] = useState({
    messages: 0,
    calls: 0,
    emails: 0
  });
  
  // Read query parameters to handle direct navigation with a specific client
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const clientId = searchParams.get("clientId");
  const clientName = searchParams.get("clientName");
  const clientPhone = searchParams.get("clientPhone");
  const tabParam = searchParams.get("tab") || "messages";
  
  // Set the active tab based on URL parameters
  useEffect(() => {
    if (tabParam && ["messages", "calls", "emails", "phone-numbers"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);
  
  // Handle opening the message dialog if client parameters are provided
  useEffect(() => {
    if (clientId && clientName) {
      setSelectedClient({
        id: clientId,
        name: clientName,
        phone: clientPhone || ""
      });
      setIsMessageDialogOpen(true);
    }
  }, [clientId, clientName, clientPhone]);

  // Fetch unread counts
  useEffect(() => {
    const fetchUnreadCounts = async () => {
      try {
        // Count unread messages
        const { data: conversations } = await supabase
          .from('conversations')
          .select(`
            id,
            messages!inner(id, read_at)
          `);
        
        let unreadMessages = 0;
        conversations?.forEach(conv => {
          const unreadInConv = conv.messages.filter((msg: any) => !msg.read_at).length;
          unreadMessages += unreadInConv;
        });

        // For now, using mock data for calls and emails
        // In a real app, you would fetch from actual tables
        const missedCalls = 3; // Mock missed calls count
        const unreadEmails = 5; // Mock unread emails count

        setUnreadCounts({
          messages: unreadMessages,
          calls: missedCalls,
          emails: unreadEmails
        });
      } catch (error) {
        console.error("Error fetching unread counts:", error);
      }
    };

    fetchUnreadCounts();
  }, []);

  const handleNewCommunication = () => {
    switch (activeTab) {
      case "messages":
        setIsMessageDialogOpen(true);
        break;
      case "calls":
        toast.info("New call feature coming soon");
        break;
      case "emails":
        toast.info("New email feature coming soon");
        break;
      case "phone-numbers":
        toast.info("Use the search above to find and purchase phone numbers");
        break;
    }
  };

  return (
    <PageLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Connect Center</h1>
          <p className="text-fixlyfy-text-secondary">
            Manage all client communications and phone numbers in one place
          </p>
        </div>
        <Button 
          className="bg-fixlyfy hover:bg-fixlyfy/90"
          onClick={handleNewCommunication}
        >
          <Plus size={18} className="mr-2" /> 
          {activeTab === "messages" && "New Message"}
          {activeTab === "calls" && "New Call"}
          {activeTab === "emails" && "New Email"}
          {activeTab === "phone-numbers" && "Search Numbers"}
        </Button>
      </div>
      
      {/* Global Search Component */}
      <div className="mb-6">
        <ConnectSearch onSearchResults={setSearchResults} />
      </div>
      
      <Tabs defaultValue={activeTab} value={activeTab} className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageSquare size={16} />
            <span>Messages</span>
            {unreadCounts.messages > 0 && (
              <Badge className="ml-1 bg-fixlyfy">{unreadCounts.messages}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="calls" className="flex items-center gap-2">
            <Phone size={16} />
            <span>Calls</span>
            {unreadCounts.calls > 0 && (
              <Badge className="ml-1 bg-fixlyfy">{unreadCounts.calls}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="emails" className="flex items-center gap-2">
            <Mail size={16} />
            <span>Emails</span>
            {unreadCounts.emails > 0 && (
              <Badge className="ml-1 bg-fixlyfy">{unreadCounts.emails}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="phone-numbers" className="flex items-center gap-2">
            <PhoneCall size={16} />
            <span>Phone Numbers</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="messages" className="mt-0">
          <MessagesList 
            setOpenMessageDialog={setIsMessageDialogOpen} 
            setSelectedClient={setSelectedClient}
            searchResults={searchResults}
          />
        </TabsContent>
        
        <TabsContent value="calls" className="mt-0">
          <CallsList />
        </TabsContent>
        
        <TabsContent value="emails" className="mt-0">
          <EmailsList />
        </TabsContent>
        
        <TabsContent value="phone-numbers" className="mt-0">
          <PhoneNumbersList searchResults={searchResults} />
        </TabsContent>
      </Tabs>
      
      {/* Message Dialog for direct conversations */}
      {selectedClient && (
        <MessageDialog
          open={isMessageDialogOpen}
          onOpenChange={setIsMessageDialogOpen}
          client={selectedClient}
        />
      )}
    </PageLayout>
  );
};

export default ConnectCenterPage;
