
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
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
        <div className="p-3 sm:p-6">
          <div className="max-w-5xl mx-auto">
            <div className="space-y-4">
              <Skeleton className="h-4 sm:h-6 w-24 sm:w-32" />
              <Skeleton className="h-24 sm:h-32 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
        <div className="p-3 sm:p-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center text-gray-500">
              Job not found
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
      <div className="p-3 sm:p-6">
        <div className="max-w-5xl mx-auto">
          <JobInfoSection
            job={job}
            status={job.status || 'scheduled'}
            onStatusChange={handleStatusChange}
            onCallClick={handleCallClick}
            onMessageClick={handleMessageClick}
            onEditClient={handleEditClient}
          />
        </div>
      </div>
    </div>
  );
};
