
import { useState } from "react";
import { useJobDetails } from "./context/JobDetailsContext";
import { JobInfoSection } from "./header/JobInfoSection";
import { PropertyInfoSection } from "./header/PropertyInfoSection";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export const JobDetailsHeader = () => {
  const { job, isLoading, updateJobStatus } = useJobDetails();

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateJobStatus(newStatus);
      toast.success('Job status updated successfully');
    } catch (error) {
      console.error('Error updating job status:', error);
      toast.error('Failed to update job status');
    }
  };

  const handleCallClick = () => {
    if (job?.phone) {
      window.open(`tel:${job.phone}`, '_self');
    }
  };

  const handleMessageClick = () => {
    if (job?.phone) {
      window.open(`sms:${job.phone}`, '_self');
    }
  };

  const handleEditClient = () => {
    // TODO: Implement edit client functionality
    toast.info('Edit client functionality coming soon');
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-slate-50 via-white to-blue-50/30 border-b border-slate-200/60">
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-24 w-full rounded-2xl" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-24 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="bg-gradient-to-br from-slate-50 via-white to-blue-50/30 border-b border-slate-200/60">
        <div className="p-6">
          <div className="text-center text-slate-500">
            Job not found
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-blue-50/30 border-b border-slate-200/60">
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <JobInfoSection
            job={job}
            status={job.status || 'scheduled'}
            onStatusChange={handleStatusChange}
            onCallClick={handleCallClick}
            onMessageClick={handleMessageClick}
            onEditClient={handleEditClient}
          />

          <PropertyInfoSection job={job} />
        </div>
      </div>
    </div>
  );
};
