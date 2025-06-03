
import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Phone, Settings, ShoppingCart, Bot, MessageSquare, BarChart3 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { NumbersManagement } from '@/components/phone/NumbersManagement';
import { PurchaseNumbers } from '@/components/phone/PurchaseNumbers';
import { AIConfiguration } from '@/components/phone/AIConfiguration';
import { SMSConfiguration } from '@/components/phone/SMSConfiguration';
import { CallConfiguration } from '@/components/phone/CallConfiguration';
import { BillingUsage } from '@/components/phone/BillingUsage';

const PhoneSettingsPage = () => {
  const isMobile = useIsMobile();

  return (
    <PageLayout>
      <PageHeader
        title="Phone Settings"
        subtitle="Manage your phone numbers, AI dispatcher, SMS, and call routing"
        icon={Phone}
        badges={[
          { text: "Telnyx Powered", icon: Phone, variant: "fixlyfy" },
          { text: "AI Ready", icon: Bot, variant: "success" }
        ]}
      />
      
      <div className="space-y-6">
        <Tabs defaultValue="numbers" className="w-full">
          <TabsList className={`grid w-full grid-cols-6 ${isMobile ? 'h-auto' : ''}`}>
            <TabsTrigger value="numbers" className={isMobile ? 'text-xs p-2' : ''}>
              <Settings size={16} className="mr-1" />
              {!isMobile && "Numbers"}
            </TabsTrigger>
            <TabsTrigger value="purchase" className={isMobile ? 'text-xs p-2' : ''}>
              <ShoppingCart size={16} className="mr-1" />
              {!isMobile && "Purchase"}
            </TabsTrigger>
            <TabsTrigger value="ai" className={isMobile ? 'text-xs p-2' : ''}>
              <Bot size={16} className="mr-1" />
              {!isMobile && "AI"}
            </TabsTrigger>
            <TabsTrigger value="sms" className={isMobile ? 'text-xs p-2' : ''}>
              <MessageSquare size={16} className="mr-1" />
              {!isMobile && "SMS"}
            </TabsTrigger>
            <TabsTrigger value="calls" className={isMobile ? 'text-xs p-2' : ''}>
              <Phone size={16} className="mr-1" />
              {!isMobile && "Calls"}
            </TabsTrigger>
            <TabsTrigger value="billing" className={isMobile ? 'text-xs p-2' : ''}>
              <BarChart3 size={16} className="mr-1" />
              {!isMobile && "Billing"}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="numbers" className="space-y-6">
            <NumbersManagement />
          </TabsContent>
          
          <TabsContent value="purchase" className="space-y-6">
            <PurchaseNumbers />
          </TabsContent>
          
          <TabsContent value="ai" className="space-y-6">
            <AIConfiguration />
          </TabsContent>
          
          <TabsContent value="sms" className="space-y-6">
            <SMSConfiguration />
          </TabsContent>
          
          <TabsContent value="calls" className="space-y-6">
            <CallConfiguration />
          </TabsContent>
          
          <TabsContent value="billing" className="space-y-6">
            <BillingUsage />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default PhoneSettingsPage;
