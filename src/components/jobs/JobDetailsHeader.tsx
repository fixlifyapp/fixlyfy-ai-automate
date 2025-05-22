
import { Card } from "@/components/ui/card";
import { useJobDetailsHeader } from "@/components/jobs/header/useJobDetailsHeader";
import { JobInfoSection } from "@/components/jobs/header/JobInfoSection";
import { JobActions } from "@/components/jobs/header/JobActions";
import { useState, useEffect } from "react";
import { useModal } from "@/components/ui/modal-provider";
import { Skeleton } from "@/components/ui/skeleton";

interface JobDetailsHeaderProps {
  jobId: string;
}

export const JobDetailsHeader = ({ jobId }: JobDetailsHeaderProps) => {
  const { 
    job, 
    isLoading, 
    status, 
    handleStatusChange, 
    handleEditClient,
    handleCompleteJob,
    handleCancelJob,
    handleReschedule,
    invoiceAmount,
    balance
  } = useJobDetailsHeader(jobId);
  
  const { openModal } = useModal();
  const [currentStatus, setCurrentStatus] = useState<string>("scheduled");
  
  // Update status when job data changes
  useEffect(() => {
    if (status) {
      setCurrentStatus(status);
    }
  }, [status]);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4 w-48"></div>
          <div className="h-5 bg-gray-200 rounded w-72"></div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="p-6">
        <div className="text-red-500">Error loading job details</div>
      </div>
    );
  }

  const handleLocalStatusChange = (newStatus: string) => {
    handleStatusChange(newStatus);
    setCurrentStatus(newStatus);
  };

  const handleCallClick = () => {
    if (job.phone) {
      // We'll use a standard modal type instead
      openModal("deleteConfirm", {
        title: "Call Client",
        description: `Call ${job.client} at ${job.phone}?`,
        onConfirm: () => window.open(`tel:${job.phone}`)
      });
    }
  };

  const handleMessageClick = () => {
    if (job.phone) {
      // We'll use a standard modal type instead
      openModal("deleteConfirm", {
        title: "Message Client",
        description: `Message ${job.client} at ${job.phone}?`,
        onConfirm: () => window.open(`sms:${job.phone}`)
      });
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
        <JobInfoSection 
          job={{
            id: job.id,
            clientId: job.clientId,
            client: job.client,
            service: job.service,
            address: job.address,
            phone: job.phone,
            email: job.email,
            total: job.total || 0 // Ensure total is provided
          }}
          status={currentStatus}
          onStatusChange={handleLocalStatusChange}
          onCallClick={handleCallClick}
          onMessageClick={handleMessageClick}
          onEditClient={handleEditClient}
          invoiceAmount={invoiceAmount}
          balance={balance}
        />
        
        <div>
          <JobActions 
            onCompleteJob={handleCompleteJob}
            onCancelJob={handleCancelJob}
            onReschedule={handleReschedule}
          />
        </div>
      </div>
    </div>
  );
};
