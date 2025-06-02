
import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { DispatcherMessagesView } from "@/components/connect/DispatcherMessagesView";
import { RealCallsList } from "@/components/connect/RealCallsList";
import { EmailManagement } from "@/components/connect/EmailManagement";
import { PhoneNumbersList } from "@/components/connect/PhoneNumbersList";
import { IncomingCallHandler } from "@/components/connect/IncomingCallHandler";
import { CallMonitoring } from "@/components/connect/CallMonitoring";
import { AmazonConnectFlowInstructions } from "@/components/connect/AmazonConnectFlowInstructions";
import { EmailComposer } from "@/components/connect/EmailComposer";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { MessageSquare, Phone, Mail, Plus, PhoneCall, Users, Workflow } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "react-router-dom";
import { ConnectSearch } from "@/components/connect/components/ConnectSearch";
import { useMessageContext } from "@/contexts/MessageContext";
import { useConnectCenterData } from "@/components/connect/hooks/useConnectCenterData";
import { toast } from "sonner";

const ConnectCenterPageOptimized = () => {
  const [activeTab, setActiveTab] = useState("flow-setup");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [emailComposerOpen, setEmailComposerOpen] = useState(false);
  
  const { openMessageDialog } = useMessageContext();
  const { unreadCounts, ownedNumbers, isLoading, refreshData } = useConnectCenterData();

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const clientId = searchParams.get("clientId");
  const clientName = searchParams.get("clientName");
  const clientPhone = searchParams.get("clientPhone");
  const clientEmail = searchParams.get("clientEmail");
  const tabParam = searchParams.get("tab") || "flow-setup";
  
  useEffect(() => {
    if (tabParam && ["flow-setup", "monitoring", "messages", "calls", "emails", "phone-numbers"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);
  
  useEffect(() => {
    if (clientId && clientName) {
      if (activeTab === "emails" && clientEmail) {
        setEmailComposerOpen(true);
      } else {
        openMessageDialog({
          id: clientId,
          name: clientName,
          phone: clientPhone || ""
        });
      }
    }
  }, [clientId, clientName, clientPhone, clientEmail, activeTab, openMessageDialog]);

  const handleNewCommunication = () => {
    switch (activeTab) {
      case "messages":
        openMessageDialog({ name: "New Client", phone: "" });
        break;
      case "calls":
        if (ownedNumbers.length === 0) {
          toast.error("Please configure Amazon Connect phone numbers first");
        } else {
          toast.info("Use the Amazon Connect calling interface below to make calls");
        }
        break;
      case "emails":
        setEmailComposerOpen(true);
        break;
      case "phone-numbers":
        toast.info("Use the search above to find and configure Amazon Connect numbers");
        break;
    }
  };

  const getActionButtonText = () => {
    switch (activeTab) {
      case "messages": return "New Message";
      case "calls": return "New Call";
      case "emails": return "New Email";
      case "phone-numbers": return "Search Numbers";
      case "flow-setup": return "View Flow Docs";
      default: return "New Action";
    }
  };

  return (
    <PageLayout>
      <IncomingCallHandler />
      
      <PageHeader
        title="Connect Center"
        subtitle="Amazon Connect communication hub and call monitoring"
        icon={MessageSquare}
        badges={[
          { text: "Amazon Connect", icon: Phone, variant: "fixlyfy" },
          { text: "Media Streaming", icon: Workflow, variant: "success" },
          { text: "Real-time Sync", icon: MessageSquare, variant: "info" }
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
      
      {isLoading ? (
        <LoadingSkeleton type="connect-tabs" />
      ) : (
        <Tabs defaultValue={activeTab} value={activeTab} className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-6 mb-6">
            <TabsTrigger value="flow-setup" className="flex items-center gap-2">
              <Workflow size={16} />
              <span className="hidden sm:inline">Flow Setup</span>
            </TabsTrigger>
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
            <TabsTrigger value="phone-numbers" className="flex items-center gap-2">
              <PhoneCall size={16} />
              <span className="hidden sm:inline">Numbers</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="flow-setup" className="mt-0">
            <AmazonConnectFlowInstructions />
          </TabsContent>
          
          <TabsContent value="monitoring" className="mt-0">
            <CallMonitoring />
          </TabsContent>
          
          <TabsContent value="messages" className="mt-0">
            <DispatcherMessagesView searchResults={searchResults} />
          </TabsContent>
          
          <TabsContent value="calls" className="mt-0">
            <RealCallsList />
          </TabsContent>
          
          <TabsContent value="emails" className="mt-0">
            <EmailManagement />
          </TabsContent>
          
          <TabsContent value="phone-numbers" className="mt-0">
            <PhoneNumbersList />
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
