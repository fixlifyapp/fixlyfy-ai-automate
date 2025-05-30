
import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DispatcherMessagesView } from "@/components/connect/DispatcherMessagesView";
import { RealCallsList } from "@/components/connect/RealCallsList";
import { RealEmailsList } from "@/components/connect/RealEmailsList";
import { PhoneNumbersList } from "@/components/connect/PhoneNumbersList";
import { IncomingCallHandler } from "@/components/connect/IncomingCallHandler";
import { Button } from "@/components/ui/button";
import { MessageSquare, Phone, Mail, Plus, PhoneCall, Users, Target } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "react-router-dom";
import { ConnectSearch } from "@/components/connect/components/ConnectSearch";
import { supabase } from "@/integrations/supabase/client";
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

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const clientId = searchParams.get("clientId");
  const clientName = searchParams.get("clientName");
  const clientPhone = searchParams.get("clientPhone");
  const tabParam = searchParams.get("tab") || "messages";
  
  useEffect(() => {
    if (tabParam && ["messages", "calls", "emails", "phone-numbers"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);
  
  useEffect(() => {
    if (clientId && clientName) {
      openMessageDialog({
        id: clientId,
        name: clientName,
        phone: clientPhone || ""
      });
    }
  }, [clientId, clientName, clientPhone, openMessageDialog]);

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

        // Count missed calls (using amazon_connect_calls)
        const { data: missedCalls } = await supabase
          .from('amazon_connect_calls')
          .select('id')
          .eq('call_status', 'failed');

        // Count unread emails
        const { data: unreadEmails } = await supabase
          .from('emails')
          .select('id')
          .eq('is_read', false);

        setUnreadCounts({
          messages: unreadMessages,
          calls: missedCalls?.length || 0,
          emails: unreadEmails?.length || 0
        });
      } catch (error) {
        console.error("Error fetching unread counts:", error);
      }
    };

    fetchUnreadCounts();

    // Set up real-time subscriptions to update counts
    const messagesChannel = supabase
      .channel('unread-counts-messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, fetchUnreadCounts)
      .subscribe();

    const callsChannel = supabase
      .channel('unread-counts-calls')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'amazon_connect_calls' }, fetchUnreadCounts)
      .subscribe();

    const emailsChannel = supabase
      .channel('unread-counts-emails')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'emails' }, fetchUnreadCounts)
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(callsChannel);
      supabase.removeChannel(emailsChannel);
    };
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

  const getActionButtonText = () => {
    switch (activeTab) {
      case "messages": return "New Message";
      case "calls": return "New Call";
      case "emails": return "New Email";
      case "phone-numbers": return "Search Numbers";
      default: return "New Action";
    }
  };

  return (
    <PageLayout>
      <IncomingCallHandler />
      
      <PageHeader
        title="Connect Center"
        subtitle="Manage all client communications and contact channels"
        icon={MessageSquare}
        badges={[
          { text: "Multi-Channel", icon: Users, variant: "fixlyfy" },
          { text: "Real-time Sync", icon: Target, variant: "success" },
          { text: "Communication Hub", icon: MessageSquare, variant: "info" }
        ]}
        actionButton={{
          text: getActionButtonText(),
          icon: Plus,
          onClick: handleNewCommunication
        }}
      />
      
      <div className="mb-6">
        <ConnectSearch onSearchResults={setSearchResults} />
      </div>
      
      <Tabs defaultValue={activeTab} value={activeTab} className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageSquare size={16} />
            <span className="hidden sm:inline">Messages</span>
            {unreadCounts.messages > 0 && (
              <Badge className="ml-1 bg-fixlyfy">{unreadCounts.messages}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="calls" className="flex items-center gap-2">
            <Phone size={16} />
            <span className="hidden sm:inline">Calls</span>
            {unreadCounts.calls > 0 && (
              <Badge className="ml-1 bg-fixlyfy">{unreadCounts.calls}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="emails" className="flex items-center gap-2">
            <Mail size={16} />
            <span className="hidden sm:inline">Emails</span>
            {unreadCounts.emails > 0 && (
              <Badge className="ml-1 bg-fixlyfy">{unreadCounts.emails}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="phone-numbers" className="flex items-center gap-2">
            <PhoneCall size={16} />
            <span className="hidden sm:inline">Numbers</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="messages" className="mt-0">
          <DispatcherMessagesView searchResults={searchResults} />
        </TabsContent>
        
        <TabsContent value="calls" className="mt-0">
          <RealCallsList />
        </TabsContent>
        
        <TabsContent value="emails" className="mt-0">
          <RealEmailsList />
        </TabsContent>
        
        <TabsContent value="phone-numbers" className="mt-0">
          <PhoneNumbersList />
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};

export default ConnectCenterPage;
