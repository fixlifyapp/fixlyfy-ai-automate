import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/ui/page-header';
import { ModernCard } from '@/components/ui/modern-card';
import { AnimatedContainer } from '@/components/ui/animated-container';
import { Calculator } from 'lucide-react';

const FinancePage = () => {
  return (
    <PageLayout>
      <div className="space-y-6">
        <PageHeader
          title="Finance"
          subtitle="Manage estimates, invoices, and payments"
		  icon={Calculator}
        />

        <AnimatedContainer>
          <ModernCard className="p-6">
            <p>Finance functionality coming soon...</p>
          </ModernCard>
        </AnimatedContainer>
      </div>
    </PageLayout>
  );
};

export default FinancePage;
