
import { useState } from "react";
import { useJobDetails } from "./context/JobDetailsContext";
import { JobInfoSection } from "./header/JobInfoSection";
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
      <div className="p-6">
        <Skeleton className="h-8 w-64 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="p-6">
        <div className="text-center text-muted-foreground">
          Job not found
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <JobInfoSection
        job={job}
        status={job.status || 'scheduled'}
        onStatusChange={handleStatusChange}
        onCallClick={handleCallClick}
        onMessageClick={handleMessageClick}
        onEditClient={handleEditClient}
      />
    </div>
  );
};
