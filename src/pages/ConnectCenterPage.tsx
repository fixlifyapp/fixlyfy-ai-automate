
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessagesList } from "@/components/connect/MessagesList";
import { CallsList } from "@/components/connect/CallsList";
import { EmailsList } from "@/components/connect/EmailsList";
import { Button } from "@/components/ui/button";
import { MessageSquare, Phone, Mail, Plus } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { Badge } from "@/components/ui/badge";

const ConnectCenterPage = () => {
  const [activeTab, setActiveTab] = useState("messages");

  const handleNewCommunication = () => {
    switch (activeTab) {
      case "messages":
        toast.info("New message feature coming soon");
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
      
      <Tabs defaultValue="messages" className="w-full" onValueChange={setActiveTab}>
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
          <MessagesList />
        </TabsContent>
        
        <TabsContent value="calls" className="mt-0">
          <CallsList />
        </TabsContent>
        
        <TabsContent value="emails" className="mt-0">
          <EmailsList />
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};

export default ConnectCenterPage;
