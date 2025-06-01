
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, Settings, ShoppingCart, Bot } from "lucide-react";
import { TelnyxPhoneNumbersPage } from "@/components/telnyx/TelnyxPhoneNumbersPage";
import { TelnyxSettings } from "@/components/telnyx/TelnyxSettings";

const TelnyxPage = () => {
  return (
    <PageLayout>
      <PageHeader
        title="Telnyx Integration"
        subtitle="Simple phone system with AI - much easier than Amazon Connect!"
        icon={Phone}
        badges={[
          { text: "AI Voice", icon: Bot, variant: "fixlyfy" },
          { text: "SMS Ready", icon: Phone, variant: "success" },
          { text: "Simple Setup", icon: Settings, variant: "info" }
        ]}
      />
      
      <Tabs defaultValue="numbers" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="numbers" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Phone Numbers
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            AI Settings
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="numbers" className="space-y-6">
          <TelnyxPhoneNumbersPage />
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-6">
          <TelnyxSettings />
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};

export default TelnyxPage;
