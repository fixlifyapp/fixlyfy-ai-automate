
import React from 'react';
import { useParams } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/ui/page-header';
import { ModernCard } from '@/components/ui/modern-card';
import { AnimatedContainer } from '@/components/ui/animated-container';

const JobDetailPage = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <PageLayout>
      <div className="space-y-6">
        <PageHeader
          title={`Job ${id}`}
          subtitle="View and manage job details"
        />

        <AnimatedContainer>
          <ModernCard className="p-6">
            <p>Job detail functionality coming soon...</p>
          </ModernCard>
        </AnimatedContainer>
      </div>
    </PageLayout>
  );
};

export default JobDetailPage;
