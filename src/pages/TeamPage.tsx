
import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/ui/page-header';
import { ModernCard } from '@/components/ui/modern-card';
import { AnimatedContainer } from '@/components/ui/animated-container';
import { Users } from 'lucide-react';

const TeamPage = () => {
  return (
    <PageLayout>
      <div className="space-y-6">
        <PageHeader
          title="Team"
          subtitle="Manage your team members and permissions"
        />

        <AnimatedContainer>
          <ModernCard className="p-6">
            <p>Team management functionality coming soon...</p>
          </ModernCard>
        </AnimatedContainer>
      </div>
    </PageLayout>
  );
};

export default TeamPage;
