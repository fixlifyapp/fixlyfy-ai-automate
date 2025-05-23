
import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessagesList } from "@/components/connect/MessagesList";
import { CallsList } from "@/components/connect/CallsList";
import { EmailsList } from "@/components/connect/EmailsList";
import { Button } from "@/components/ui/button";
import { MessageSquare, Phone, Mail, Plus } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "react-router-dom";
import { MessageDialog } from "@/components/messages/MessageDialog";

const ConnectCenterPage = () => {
  const [activeTab, setActiveTab] = useState("messages");
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<{name: string; phone?: string; id?: string} | null>(null);
  
  // Read query parameters to handle direct navigation with a specific client
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const clientId = searchParams.get("clientId");
  const clientName = searchParams.get("clientName");
  const clientPhone = searchParams.get("clientPhone");
  const tabParam = searchParams.get("tab") || "messages";
  
  // Set the active tab based on URL parameters
  useEffect(() => {
    if (tabParam && ["messages", "calls", "emails"].includes(tabParam)) {
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
    }
  };

  return (
    <PageLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Connect Center</h1>
          <p className="text-fixlyfy-text-secondary">
            Manage all client communications in one place
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
        </Button>
      </div>
      
      <Tabs defaultValue={activeTab} value={activeTab} className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageSquare size={16} />
            <span>Messages</span>
            <Badge className="ml-1 bg-fixlyfy">12</Badge>
          </TabsTrigger>
          <TabsTrigger value="calls" className="flex items-center gap-2">
            <Phone size={16} />
            <span>Calls</span>
            <Badge className="ml-1 bg-fixlyfy">3</Badge>
          </TabsTrigger>
          <TabsTrigger value="emails" className="flex items-center gap-2">
            <Mail size={16} />
            <span>Emails</span>
            <Badge className="ml-1 bg-fixlyfy">5</Badge>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="messages" className="mt-0">
          <MessagesList setOpenMessageDialog={setIsMessageDialogOpen} setSelectedClient={setSelectedClient} />
        </TabsContent>
        
        <TabsContent value="calls" className="mt-0">
          <CallsList />
        </TabsContent>
        
        <TabsContent value="emails" className="mt-0">
          <EmailsList />
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
