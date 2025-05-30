
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
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
        <div className="p-8">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
        <div className="p-8">
          <div className="text-center text-muted-foreground">
            Job not found
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {job.title || 'Untitled Job'}
          </h1>
          <p className="text-gray-600 text-lg">
            Job ID: <span className="font-semibold">{job.id}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
