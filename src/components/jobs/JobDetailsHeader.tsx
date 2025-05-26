
import { Card } from "@/components/ui/card";
import { JobInfoSection } from "@/components/jobs/header/JobInfoSection";
import { JobActions } from "@/components/jobs/header/JobActions";
import { useModal } from "@/components/ui/modal-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useJobDetails } from "./context/JobDetailsContext";
import { useJobFinancials } from "@/hooks/useJobFinancials";

interface JobDetailsHeaderProps {
  jobId?: string;
}

export const JobDetailsHeader = ({ jobId }: JobDetailsHeaderProps = {}) => {
  const navigate = useNavigate();
  const { job, isLoading, currentStatus, updateJobStatus } = useJobDetails();
  const { 
    invoiceAmount, 
    balance, 
    totalPaid,
    overdueAmount,
    paidInvoices,
    unpaidInvoices,
    isLoading: financialsLoading,
    refresh: refreshFinancials
  } = useJobFinancials(job?.id || jobId || "");
  
  // Safely use the modal context with a fallback
  let openModal: (type: any, props?: any) => void;
  try {
    const modalContext = useModal();
    openModal = modalContext.openModal;
  } catch (error) {
    console.warn("Modal context not available:", error);
    openModal = () => toast.error("Modal functionality unavailable");
  }
  
  if (isLoading) {
    return (
      <div className="p-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="p-4">
        <div className="text-center py-6">
          <div className="text-red-500 font-medium">Error loading job details</div>
          <p className="text-slate-500 text-sm mt-1">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  const handleCallClick = () => {
    if (job.phone) {
      openModal("callClient", {
        title: "Call Client",
        description: `Call ${job.client} at ${job.phone}?`,
        clientName: job.client,
        phone: job.phone
      });
    } else {
      toast.warning("No phone number available for this client");
    }
  };

  const handleMessageClick = () => {
    if (job.phone) {
      openModal("messageClient", {
        title: "Message Client",
        description: `Message ${job.client} at ${job.phone}?`,
        clientName: job.client,
        phone: job.phone
      });
    } else {
      toast.warning("No phone number available for this client");
    }
  };
  
  const handleStatusChange = (newStatus: string) => {
    updateJobStatus(newStatus);
  };
  
  const handleCompleteJob = () => {
    handleStatusChange("completed");
  };

  const handleCancelJob = () => {
    handleStatusChange("cancelled");
  };

  const handleReschedule = () => {
    toast.success("Job rescheduling initiated");
  };
  
  return (
    <div className="p-4">
      <div className="flex flex-col lg:flex-row gap-6 lg:items-start lg:justify-between">
        <div className="flex-1 min-w-0">
          <JobInfoSection 
            job={job}
            status={currentStatus}
            onStatusChange={handleStatusChange}
            onCallClick={handleCallClick}
            onMessageClick={handleMessageClick}
            onEditClient={() => {
              if (job.clientId) {
                navigate(`/clients/${job.clientId}`);
              }
            }}
            invoiceAmount={financialsLoading ? 0 : invoiceAmount}
            balance={financialsLoading ? 0 : balance}
            totalPaid={financialsLoading ? 0 : totalPaid}
            overdueAmount={financialsLoading ? 0 : overdueAmount}
            paidInvoices={financialsLoading ? 0 : paidInvoices}
            unpaidInvoices={financialsLoading ? 0 : unpaidInvoices}
            isLoadingFinancials={financialsLoading}
          />
        </div>
        
        <div className="lg:flex-shrink-0">
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
