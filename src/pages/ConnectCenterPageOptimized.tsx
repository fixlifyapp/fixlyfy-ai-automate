import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { DispatcherMessagesView } from "@/components/connect/DispatcherMessagesView";
import { EmailManagement } from "@/components/connect/EmailManagement";
import { IncomingCallHandler } from "@/components/connect/IncomingCallHandler";
import { CallMonitoring } from "@/components/connect/CallMonitoring";
import { EmailComposer } from "@/components/connect/EmailComposer";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { MessageSquare, Phone, Mail, Plus, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "react-router-dom";
import { ConnectSearch } from "@/components/connect/components/ConnectSearch";
import { useMessageContext } from "@/contexts/MessageContext";
import { useConnectCenterData } from "@/components/connect/hooks/useConnectCenterData";
import { toast } from "sonner";
import { TelnyxCallsView } from "@/components/telnyx/TelnyxCallsView";
import { supabase } from "@/integrations/supabase/client";
import { AIAgentToggle } from "@/components/connect/AIAgentToggle";
import { ActiveCallInterface } from "@/components/connect/ActiveCallInterface";

const ConnectCenterPageOptimized = () => {
  const [activeTab, setActiveTab] = useState("monitoring");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [emailComposerOpen, setEmailComposerOpen] = useState(false);
  const [isCallLoading, setIsCallLoading] = useState(false);
  
  const { openMessageDialog } = useMessageContext();
  const { unreadCounts, ownedNumbers, isLoading, refreshData } = useConnectCenterData();

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const clientId = searchParams.get("clientId");
  const clientName = searchParams.get("clientName");
  const clientPhone = searchParams.get("clientPhone");
  const clientEmail = searchParams.get("clientEmail");
  const tabParam = searchParams.get("tab") || "monitoring";
  
  useEffect(() => {
    if (tabParam && ["monitoring", "messages", "calls", "emails"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);
  
  useEffect(() => {
    const handleClientActions = async () => {
      if (!clientId || !clientName) return;

      // Auto-trigger actions based on the active tab
      if (activeTab === "messages" && clientPhone) {
        await openMessageDialog({
          id: clientId,
          name: clientName,
          phone: clientPhone,
          email: clientEmail || ""
        });
      } else if (activeTab === "calls" && clientPhone) {
        // Auto-initiate call for calls tab
        await handleAutoCall();
      } else if (activeTab === "emails" && clientEmail) {
        setEmailComposerOpen(true);
      }
    };

    // Delay to ensure tab is set first
    const timer = setTimeout(handleClientActions, 100);
    return () => clearTimeout(timer);
  }, [clientId, clientName, clientPhone, clientEmail, activeTab, openMessageDialog]);

  const handleAutoCall = async () => {
    if (!clientPhone || !clientId) return;

    setIsCallLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('telnyx-make-call', {
        body: {
          to: clientPhone,
          clientId: clientId
        }
      });

      if (error || !data?.success) {
        throw new Error(data?.error || 'Failed to initiate call');
      }

      toast.success(`Call initiated to ${clientName}`);
    } catch (error) {
      console.error('Error making call:', error);
      toast.error('Failed to make call: ' + error.message);
    } finally {
      setIsCallLoading(false);
    }
  };

  const handleNewCommunication = () => {
    switch (activeTab) {
      case "messages":
        openMessageDialog({ name: "New Client", phone: "" });
        break;
      case "calls":
        if (ownedNumbers.length === 0) {
          toast.error("Please configure phone numbers first");
        } else {
          toast.info("Use the call monitoring interface below to manage calls");
        }
        break;
      case "emails":
        setEmailComposerOpen(true);
        break;
    }
  };

  const getActionButtonText = () => {
    switch (activeTab) {
      case "messages": return "New Message";
      case "calls": return "New Call";
      case "emails": return "New Email";
      case "monitoring": return "Monitor Calls";
      default: return "New Action";
    }
  };

  return (
    <PageLayout>
      <IncomingCallHandler />
      
      <PageHeader
        title="Connect Center"
        subtitle={clientName ? `Communication with ${clientName}` : "Communication hub and call monitoring"}
        icon={MessageSquare}
        badges={[
          { text: "Telnyx", icon: Phone, variant: "fixlyfy" as const },
          { text: "Real-time Sync", icon: MessageSquare, variant: "info" as const },
          ...(isCallLoading ? [{ text: "Calling...", icon: Phone, variant: "warning" as const }] : [])
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

      {/* AI Agent Toggle */}
      <AIAgentToggle />

      {/* Active Call Interface */}
      <ActiveCallInterface />
      
      {isLoading ? (
        <LoadingSkeleton type="connect-tabs" />
      ) : (
        <Tabs defaultValue={activeTab} value={activeTab} className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="monitoring" className="flex items-center gap-2">
              <Phone size={16} />
              <span className="hidden sm:inline">Monitor</span>
            </TabsTrigger>
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
          </TabsList>
          
          <TabsContent value="monitoring" className="mt-0">
            <CallMonitoring />
          </TabsContent>
          
          <TabsContent value="messages" className="mt-0">
            <DispatcherMessagesView searchResults={searchResults} />
          </TabsContent>
          
          <TabsContent value="calls" className="mt-0">
            <TelnyxCallsView />
          </TabsContent>
          
          <TabsContent value="emails" className="mt-0">
            <EmailManagement />
          </TabsContent>
        </Tabs>
      )}

      {/* Email Composer Dialog */}
      <Dialog open={emailComposerOpen} onOpenChange={setEmailComposerOpen}>
        <DialogContent className="max-w-3xl">
          <EmailComposer 
            recipient={clientId && clientName && clientEmail ? {
              id: clientId,
              name: clientName,
              email: clientEmail
            } : undefined}
            onClose={() => setEmailComposerOpen(false)}
            onSent={() => {
              refreshData();
              setEmailComposerOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default ConnectCenterPageOptimized;
