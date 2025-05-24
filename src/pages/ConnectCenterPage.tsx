
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
import { ConnectSearch } from "@/components/connect/components/ConnectSearch";
import { supabase } from "@/integrations/supabase/client";
import { EnhancedCallingInterface } from "@/components/connect/EnhancedCallingInterface";
import { IncomingCallHandler } from "@/components/connect/IncomingCallHandler";
import { useMessageContext } from "@/contexts/MessageContext";

const ConnectCenterPage = () => {
  const [activeTab, setActiveTab] = useState("messages");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [unreadCounts, setUnreadCounts] = useState({
    messages: 0,
    calls: 0,
    emails: 0
  });
  const [ownedNumbers, setOwnedNumbers] = useState<any[]>([]);

  const { openMessageDialog } = useMessageContext();

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
      openMessageDialog({
        id: clientId,
        name: clientName,
        phone: clientPhone || ""
      });
    }
  }, [clientId, clientName, clientPhone, openMessageDialog]);

  // Load owned phone numbers
  useEffect(() => {
    const loadOwnedNumbers = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('manage-phone-numbers', {
          body: { action: 'list-owned' }
        });

        if (error) throw error;
        setOwnedNumbers(data.phone_numbers || []);
      } catch (error) {
        console.error('Error loading owned numbers:', error);
      }
    };

    loadOwnedNumbers();
  }, []);

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

        // Count missed calls
        const { data: missedCalls } = await supabase
          .from('calls')
          .select('id')
          .eq('direction', 'missed');

        setUnreadCounts({
          messages: unreadMessages,
          calls: missedCalls?.length || 0,
          emails: 0 // Mock for now
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
        openMessageDialog({ name: "New Client", phone: "" });
        break;
      case "calls":
        if (ownedNumbers.length === 0) {
          toast.error("Please purchase a phone number first to make calls");
        } else {
          toast.info("Use the calling interface below to make calls");
        }
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
      {/* Incoming call handler - shows when there's an incoming call */}
      <IncomingCallHandler />
      
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
            searchResults={searchResults}
          />
        </TabsContent>
        
        <TabsContent value="calls" className="mt-0">
          <div className="space-y-6">
            {ownedNumbers.length > 0 && (
              <EnhancedCallingInterface ownedNumbers={ownedNumbers} />
            )}
            <CallsList />
          </div>
        </TabsContent>
        
        <TabsContent value="emails" className="mt-0">
          <EmailsList />
        </TabsContent>
        
        <TabsContent value="phone-numbers" className="mt-0">
          <PhoneNumbersList searchResults={searchResults} />
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};

export default ConnectCenterPage;
