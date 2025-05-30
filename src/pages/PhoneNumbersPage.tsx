
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Phone, Zap, Shield } from "lucide-react";
import { PhoneNumbersList } from "@/components/connect/PhoneNumbersList";
import { PhoneNumberPurchase } from "@/components/connect/PhoneNumberPurchase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";

const PhoneNumbersPage = () => {
  const isMobile = useIsMobile();

  return (
    <PageLayout>
      <PageHeader
        title="Phone Numbers"
        subtitle="Purchase and manage your business phone numbers with AI dispatcher"
        icon={Phone}
        badges={[
          { text: "AI Powered", icon: Zap, variant: "fixlyfy" },
          { text: "Secure", icon: Shield, variant: "success" }
        ]}
      />
      
      <div className="space-y-6">
        <Tabs defaultValue="manage" className="w-full">
          <TabsList className={`grid w-full grid-cols-2 ${isMobile ? 'h-10' : ''}`}>
            <TabsTrigger value="manage" className={isMobile ? 'text-sm' : ''}>
              Manage Numbers
            </TabsTrigger>
            <TabsTrigger value="purchase" className={isMobile ? 'text-sm' : ''}>
              Purchase New
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="manage" className="space-y-6">
            <PhoneNumbersList />
          </TabsContent>
          
          <TabsContent value="purchase" className="space-y-6">
            <PhoneNumberPurchase />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default PhoneNumbersPage;
