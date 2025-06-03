
import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { TelnyxPhoneNumbersPage } from '@/components/telnyx/TelnyxPhoneNumbersPage';
import { Phone, Bot } from 'lucide-react';

const TelnyxPage = () => {
  return (
    <PageLayout>
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Phone className="h-8 w-8" />
            AI Phone System
          </h1>
          <p className="text-muted-foreground">
            Complete AI-powered phone system with Telnyx - Manage numbers and configure AI
          </p>
        </div>

        <TelnyxPhoneNumbersPage />
      </div>
    </PageLayout>
  );
};

export default TelnyxPage;
