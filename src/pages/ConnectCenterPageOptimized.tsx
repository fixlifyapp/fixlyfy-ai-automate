
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
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { MessageSquare, Phone, Mail, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLocation, useNavigate } from "react-router-dom";
import { useMessageContext } from "@/contexts/MessageContext";
import { useConnectCenterData } from "@/components/connect/hooks/useConnectCenterData";
import { toast } from "sonner";
import { TelnyxCallsView } from "@/components/telnyx/TelnyxCallsView";
import { supabase } from "@/integrations/supabase/client";
import { ActiveCallInterface } from "@/components/connect/ActiveCallInterface";

const ConnectCenterPageOptimized = () => {
  const [activeTab, setActiveTab] = useState("messages");
  const [emailComposerOpen, setEmailComposerOpen] = useState(false);
  const [isCallLoading, setIsCallLoading] = useState(false);
  
  const { openMessageDialog } = useMessageContext();
  const { unreadCounts, ownedNumbers, isLoading, refreshData } = useConnectCenterData();

  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const clientId = searchParams.get("clientId");
  const clientName = searchParams.get("clientName");
  const clientPhone = searchParams.get("clientPhone");
  const clientEmail = searchParams.get("clientEmail");
  const tabParam = searchParams.get("tab") || "messages";
  const autoOpen = searchParams.get("autoOpen") === "true";
  
  useEffect(() => {
    if (tabParam && ["messages", "calls", "emails"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);
  
  useEffect(() => {
    const handleClientActions = async () => {
      if (!clientId || !clientName) return;

      console.log('Connect Center: Handling client actions', {
        clientId,
        clientName,
        clientPhone,
        clientEmail,
        activeTab,
        autoOpen
      });

      // Auto-trigger actions based on the active tab and autoOpen parameter
      if (activeTab === "messages" && clientPhone && autoOpen) {
        console.log('Connect Center: Auto-opening message dialog for client:', clientName);
        try {
          await openMessageDialog({
            id: clientId,
            name: clientName,
            phone: clientPhone || '',
            email: clientEmail || ''
          });
          
          // Clear the autoOpen parameter from URL to prevent re-triggering
          const newSearchParams = new URLSearchParams(location.search);
          newSearchParams.delete("autoOpen");
          const newUrl = `${location.pathname}?${newSearchParams.toString()}`;
          navigate(newUrl, { replace: true });
          
        } catch (error) {
          console.error('Connect Center: Error opening message dialog:', error);
          toast.error('Failed to open message dialog');
        }
      } else if (activeTab === "calls" && clientPhone) {
        // Auto-initiate call for calls tab
        await handleAutoCall();
      } else if (activeTab === "emails" && clientEmail && autoOpen) {
        // Email tab auto-open is handled by EmailManagement component
        console.log('Connect Center: Email auto-open will be handled by EmailManagement component');
      }
    };

    // Only trigger if we have the required parameters and the tab is set
    if (clientId && clientName && activeTab && autoOpen) {
      // Add a small delay to ensure components are mounted
      const timer = setTimeout(handleClientActions, 500);
      return () => clearTimeout(timer);
    }
  }, [clientId, clientName, clientPhone, clientEmail, activeTab, autoOpen, openMessageDialog, navigate, location]);

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
        openMessageDialog({ 
          id: "new-client", 
          name: "New Client", 
          phone: "" 
        });
        break;
      case "calls":
        if (ownedNumbers.length === 0) {
          toast.error("Please configure phone numbers first");
        } else {
          toast.info("Use the call monitoring interface below to manage calls");
        }
        break;
      case "emails":
        // Email new conversation is handled by EmailManagement component
        toast.info("Use the 'New' button in the email conversations list");
        break;
    }
  };

  const getActionButtonText = () => {
    switch (activeTab) {
      case "messages": return "New Message";
      case "calls": return "New Call";
      case "emails": return "New Email";
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

      {/* Active Call Interface */}
      <ActiveCallInterface />
      
      {isLoading ? (
        <LoadingSkeleton type="connect-tabs" />
      ) : (
        <Tabs defaultValue={activeTab} value={activeTab} className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-6">
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
          
          <TabsContent value="messages" className="mt-0">
            <DispatcherMessagesView searchResults={[]} />
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
