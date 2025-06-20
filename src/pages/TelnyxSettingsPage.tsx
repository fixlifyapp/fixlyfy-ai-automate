
import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/ui/page-header';
import { TelnyxPhoneManagement } from '@/components/telnyx/TelnyxPhoneManagement';
import { Phone, Bot, Zap } from 'lucide-react';

const TelnyxSettingsPage = () => {
  return (
    <PageLayout>
      <PageHeader
        title="Telnyx Settings"
        subtitle="Manage your phone numbers and AI configuration"
        icon={Phone}
        badges={[
          { text: "AI Powered", icon: Bot, variant: "fixlyfy" },
          { text: "Real-time", icon: Zap, variant: "success" }
        ]}
      />

      <div className="container mx-auto py-6">
        <TelnyxPhoneManagement />
      </div>
    </PageLayout>
  );
};

export default TelnyxSettingsPage;
