
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Phone, Shield } from "lucide-react";
import { PhoneNumbersList } from "@/components/connect/PhoneNumbersList";
import { TelnyxCallsView } from "@/components/telnyx/TelnyxCallsView";
import { TelnyxSettings } from "@/components/telnyx/TelnyxSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { History, Bot } from "lucide-react";

const PhoneNumbersPage = () => {
  const isMobile = useIsMobile();

  return (
    <PageLayout>
      <PageHeader
        title="Phone Numbers"
        subtitle="Complete AI-powered phone system - Manage numbers, configure AI, and track calls"
        icon={Phone}
        badges={[
          { text: "AI Powered", icon: Bot, variant: "fixlyfy" },
          { text: "Secure", icon: Shield, variant: "success" }
        ]}
      />
      
      <div className="space-y-6">
        <Tabs defaultValue="numbers" className="w-full">
          <TabsList className={`grid w-full grid-cols-3 ${isMobile ? 'h-10' : ''}`}>
            <TabsTrigger value="numbers" className={isMobile ? 'text-sm' : ''}>
              <Phone size={16} className="mr-1" />
              Numbers
            </TabsTrigger>
            <TabsTrigger value="calls" className={isMobile ? 'text-sm' : ''}>
              <History size={16} className="mr-1" />
              Call History
            </TabsTrigger>
            <TabsTrigger value="settings" className={isMobile ? 'text-sm' : ''}>
              <Bot size={16} className="mr-1" />
              AI Settings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="numbers" className="space-y-6">
            <PhoneNumbersList />
          </TabsContent>
          
          <TabsContent value="calls" className="space-y-6">
            <TelnyxCallsView />
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-6">
            <TelnyxSettings />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default PhoneNumbersPage;
