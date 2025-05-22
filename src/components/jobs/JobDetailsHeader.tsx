
import { Card } from "@/components/ui/card";
import { useJobDetailsHeader } from "@/hooks/useJobDetailsHeader";
import { JobInfoSection } from "@/components/jobs/header/JobInfoSection";
import { JobActions } from "@/components/jobs/header/JobActions";
import { useState, useEffect } from "react";
import { useModal } from "@/components/ui/modal-provider";

interface JobDetailsHeaderProps {
  jobId: string;
}

export const JobDetailsHeader = ({ jobId }: JobDetailsHeaderProps) => {
  const { jobHeaderData, isLoading } = useJobDetailsHeader(jobId);
  const { openModal } = useModal();
  const [status, setStatus] = useState<string>("scheduled");

  // Update status when jobHeaderData changes
  useEffect(() => {
    if (jobHeaderData?.status) {
      setStatus(jobHeaderData.status);
    }
  }, [jobHeaderData]);

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

  if (!jobHeaderData) {
    return (
      <div className="p-6">
        <div className="text-red-500">Error loading job details</div>
      </div>
    );
  }

  const handleStatusChange = (newStatus: string) => {
    // Implementation to change status would be here
    setStatus(newStatus);
  };

  const handleEditClient = () => {
    // Navigate to client page logic would be here
  };

  const handleCompleteJob = () => {
    // Complete job logic would be here
    setStatus("completed");
  };

  const handleCancelJob = () => {
    // Cancel job logic would be here
    setStatus("cancelled");
  };

  const handleReschedule = () => {
    // Reschedule job logic would be here
  };

  const handleCallClick = () => {
    if (jobHeaderData.client && jobHeaderData.client.phone) {
      openModal("callClient", {
        clientName: jobHeaderData.client.name,
        phone: jobHeaderData.client.phone
      });
    }
  };

  const handleMessageClick = () => {
    if (jobHeaderData.client && jobHeaderData.client.phone) {
      openModal("messageClient", {
        clientName: jobHeaderData.client.name,
        phone: jobHeaderData.client.phone
      });
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
        <JobInfoSection 
          job={{
            id: jobHeaderData.id,
            title: jobHeaderData.title,
            client: jobHeaderData.client?.name || "Unknown Client",
            clientId: jobHeaderData.client?.id || "",
            address: jobHeaderData.client?.address || "",
            phone: jobHeaderData.client?.phone || "",
            email: jobHeaderData.client?.email || ""
          }}
          status={status}
          onStatusChange={handleStatusChange}
          onCallClick={handleCallClick}
          onMessageClick={handleMessageClick}
          onEditClient={handleEditClient}
          // For now, we'll pass placeholders for these values
          invoiceAmount={0}
          balance={0}
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
