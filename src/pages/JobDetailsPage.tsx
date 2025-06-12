
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { JobDetailsHeader } from '@/components/jobs/JobDetailsHeader';
import { JobDetailsTabs } from '@/components/jobs/JobDetailsTabs';
import { JobQuickActions } from '@/components/jobs/JobDetailsQuickActions';
import { QuickActionsPanel } from '@/components/jobs/quick-actions/QuickActionsPanel';
import { ModernJobEstimatesTab } from '@/components/jobs/overview/ModernJobEstimatesTab';
import { ModernJobInvoicesTab } from '@/components/jobs/overview/ModernJobInvoicesTab';
import { ModernJobPaymentsTab } from '@/components/jobs/overview/ModernJobPaymentsTab';
import { ModernJobHistoryTab } from '@/components/jobs/overview/ModernJobHistoryTab';
import { useJobs } from '@/hooks/useJobs';
import { useJobStatusUpdate } from '@/components/jobs/context/useJobStatusUpdate';
import { JobDetailsProvider } from '@/components/jobs/context/JobDetailsContext';
import { formatCurrency } from '@/lib/utils';
import { JobOverview } from '@/components/jobs/JobOverview';
import { JobMessages } from '@/components/jobs/JobMessages';
import { useState } from 'react';

export const JobDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { jobs, isLoading } = useJobs();
  const { updateJobStatus } = useJobStatusUpdate();
  const [activeTab, setActiveTab] = useState('overview');

  if (!id) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Job Not Found</h1>
          <p className="text-muted-foreground mt-2">
            The job you're looking for could not be found.
          </p>
        </div>
      </div>
    );
  }

  const job = jobs.find(j => j.id === id);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Job Not Found</h1>
          <p className="text-muted-foreground mt-2">
            Job with ID "{id}" could not be found.
          </p>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <JobOverview jobId={id} />;
      case 'estimates':
        return <ModernJobEstimatesTab jobId={id} />;
      case 'invoices':
        return <ModernJobInvoicesTab jobId={id} />;
      case 'payments':
        return <ModernJobPaymentsTab jobId={id} />;
      case 'history':
        return <ModernJobHistoryTab jobId={id} />;
      case 'messages':
        return <JobMessages jobId={id} />;
      default:
        return <JobOverview jobId={id} />;
    }
  };

  return (
    <JobDetailsProvider jobId={id}>
      <div className="container mx-auto p-6 space-y-6">
        <JobDetailsHeader job={job} />
        <JobQuickActions job={job} />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <JobDetailsTabs 
              activeTab={activeTab} 
              onTabChange={setActiveTab}
            />
            {renderTabContent()}
          </div>
          
          <div className="space-y-6">
            <QuickActionsPanel jobId={id} />
          </div>
        </div>
      </div>
    </JobDetailsProvider>
  );
};

export default JobDetailsPage;
