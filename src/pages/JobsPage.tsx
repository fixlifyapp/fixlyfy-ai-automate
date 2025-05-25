
import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { JobsList } from "@/components/jobs/JobsList";
import { JobsFilters } from "@/components/jobs/JobsFilters";
import { JobsCreateModal } from "@/components/jobs/JobsCreateModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useUnifiedRealtime } from "@/hooks/useUnifiedRealtime";

const JobsPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Set up real-time updates for jobs page
  useUnifiedRealtime({
    tables: ['jobs', 'clients', 'job_statuses', 'job_types', 'custom_fields', 'job_custom_field_values', 'tags', 'lead_sources'],
    onUpdate: () => {
      console.log('Real-time update triggered for jobs page');
      setRefreshTrigger(prev => prev + 1);
    },
    enabled: true
  });

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Jobs</h1>
            <p className="text-gray-600">Manage and track all your service jobs</p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Job
          </Button>
        </div>
        
        <JobsFilters />
        <JobsList key={refreshTrigger} />
        
        <JobsCreateModal 
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
        />
      </div>
    </PageLayout>
  );
};

export default JobsPage;
