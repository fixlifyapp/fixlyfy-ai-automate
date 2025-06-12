
import React, { useState, useEffect } from "react";
import { ModernCard, ModernCardHeader, ModernCardContent, ModernCardTitle } from "@/components/ui/modern-card";
import { Button } from "@/components/ui/button";
import { User, Calendar, MapPin, Home, Plus } from "lucide-react";
import { JobBasicInfo } from "./overview/JobBasicInfo";
import { JobScheduleInfo } from "./overview/JobScheduleInfo";
import { JobClientInfo } from "./overview/JobClientInfo";
import { JobPropertyInfo } from "./overview/JobPropertyInfo";
import { ScheduleJobModal } from "@/components/schedule/ScheduleJobModal";
import { useJobDetails } from "./context/JobDetailsContext";
import { Property } from "@/hooks/useProperties";
import { useProperty } from "@/hooks/useProperty";
import { useJobsConsolidated, Job } from "@/hooks/useJobsConsolidated";
import { toast } from "sonner";

interface JobOverviewProps {
  jobId: string;
}

interface JobInfoForOverview {
  id: string;
  client_id: string;
  clientId: string; // Make required to match usage
  title?: string;
  description?: string;
  service?: string;
  status: string;
  tags?: string[];
  notes?: string;
  job_type?: string;
  lead_source?: string;
  address?: string;
  date?: string;
  schedule_start?: string;
  schedule_end?: string;
  revenue?: number;
  technician_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  tasks?: string[];
  property_id?: string;
  client: string; // Required for overview
  phone?: string;
  email?: string;
  total?: number;
}

export const JobOverview = ({ jobId }: JobOverviewProps) => {
  const { job, isLoading } = useJobDetails();
  const { property, isLoading: isPropertyLoading } = useProperty(job?.property_id);
  const { addJob, refreshJobs } = useJobsConsolidated();
  const [propertyData, setPropertyData] = useState<Property | null>(null);
  const [isCreateJobModalOpen, setIsCreateJobModalOpen] = useState(false);

  useEffect(() => {
    if (property) {
      setPropertyData(property);
    }
  }, [property]);

  const transformJobForOverview = (job: Job): JobInfoForOverview => ({
    ...job,
    clientId: job.client_id || job.clientId || '', // Ensure clientId is always present
    client: typeof job.client === 'string' ? job.client : job.client?.name || 'Unknown Client'
  });

  const handleJobCreated = async (jobData: any) => {
    try {
      const createdJob = await addJob(jobData);
      if (createdJob) {
        toast.success(`Job ${createdJob.id} created successfully!`);
        refreshJobs();
        return createdJob;
      }
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error('Failed to create job');
      throw error;
    }
  };

  // Transform job data for overview components
  const overviewJob = job ? transformJobForOverview(job) : null;

  if (isLoading || isPropertyLoading) {
    return (
      <div className="space-y-3">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-2 w-48"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-red-500">
        Error loading job information
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create Job Button */}
      <div className="flex justify-end">
        <Button
          onClick={() => setIsCreateJobModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus size={16} />
          Create Job
        </Button>
      </div>

      {/* Basic Job Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ModernCard variant="elevated">
          <ModernCardHeader>
            <ModernCardTitle icon={User}>Job Information</ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent className="space-y-4">
            <JobBasicInfo job={overviewJob} />
          </ModernCardContent>
        </ModernCard>

        <ModernCard variant="elevated">
          <ModernCardHeader>
            <ModernCardTitle icon={Calendar}>Schedule</ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent className="space-y-4">
            <JobScheduleInfo job={overviewJob} />
          </ModernCardContent>
        </ModernCard>
      </div>

      {/* Client and Property Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ModernCard variant="elevated">
          <ModernCardHeader>
            <ModernCardTitle icon={MapPin}>Client Information</ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent className="space-y-4">
            <JobClientInfo job={overviewJob} />
          </ModernCardContent>
        </ModernCard>

        <ModernCard variant="elevated">
          <ModernCardHeader>
            <ModernCardTitle icon={Home}>Property Details</ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent className="space-y-4">
            <JobPropertyInfo jobId={jobId} propertyData={propertyData} />
          </ModernCardContent>
        </ModernCard>
      </div>

      {/* Job Creation Modal */}
      <ScheduleJobModal 
        open={isCreateJobModalOpen} 
        onOpenChange={setIsCreateJobModalOpen}
        onJobCreated={handleJobCreated}
        onSuccess={(job) => {
          toast.success(`Job ${job.id} created successfully!`);
          setIsCreateJobModalOpen(false);
        }}
      />
    </div>
  );
};
