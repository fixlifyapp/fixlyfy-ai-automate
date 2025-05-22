
import { Card } from "@/components/ui/card";
import { JobInfoSection } from "@/components/jobs/header/JobInfoSection";
import { JobActions } from "@/components/jobs/header/JobActions";
import { useModal } from "@/components/ui/modal-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useJobDetails } from "./context/JobDetailsContext";
import { Button } from "@/components/ui/button";
import { FileText, DollarSign, PlusCircle } from "lucide-react";

interface JobDetailsHeaderProps {
  jobId?: string;
}

export const JobDetailsHeader = ({ jobId }: JobDetailsHeaderProps = {}) => {
  const navigate = useNavigate();
  const { job, isLoading, currentStatus, invoiceAmount, balance, updateJobStatus } = useJobDetails();
  
  // Safely use the modal context with a fallback
  let openModal: (type: any, props?: any) => void;
  try {
    const modalContext = useModal();
    openModal = modalContext.openModal;
  } catch (error) {
    console.warn("Modal context not available:", error);
    // Provide a fallback function that shows a toast instead
    openModal = () => toast.error("Modal functionality unavailable");
  }
  
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

  const handleCallClick = () => {
    if (job.phone) {
      // Use the proper modal type that's defined in ModalType
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
      // Use the proper modal type that's defined in ModalType
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
  
  // Handle status change
  const handleStatusChange = (newStatus: string) => {
    updateJobStatus(newStatus);
  };
  
  // Job action handlers
  const handleCompleteJob = () => {
    handleStatusChange("completed");
  };

  const handleCancelJob = () => {
    handleStatusChange("cancelled");
  };

  const handleReschedule = () => {
    toast.success("Job rescheduling initiated");
    // In a real app, this would open a rescheduling dialog
  };

  // New handlers for estimate, invoice, payment flows
  const handleCreateEstimate = () => {
    openModal("createEstimate", {
      title: "Create Estimate",
      jobId: job.id,
      client: job.client,
      onSuccess: () => {
        toast.success("Estimate created successfully");
        // Navigate to the estimates tab
        navigate(`/jobs/${job.id}`, { state: { activeTab: "estimates" } });
      }
    });
  };

  const handleGenerateInvoice = () => {
    openModal("createInvoice", {
      title: "Generate Invoice",
      jobId: job.id,
      client: job.client,
      onSuccess: () => {
        toast.success("Invoice generated successfully");
        // Navigate to the invoices tab
        navigate(`/jobs/${job.id}`, { state: { activeTab: "invoices" } });
      }
    });
  };

  const handleCollectPayment = () => {
    openModal("collectPayment", {
      title: "Collect Payment",
      jobId: job.id,
      client: job.client,
      balance: balance,
      onSuccess: () => {
        toast.success("Payment recorded successfully");
        // Navigate to the payments tab
        navigate(`/jobs/${job.id}`, { state: { activeTab: "payments" } });
      }
    });
  };
  
  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
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
          invoiceAmount={invoiceAmount}
          balance={balance}
        />
        
        <div className="space-y-2">
          <JobActions 
            onCompleteJob={handleCompleteJob}
            onCancelJob={handleCancelJob}
            onReschedule={handleReschedule}
          />
          
          {/* Financial Action Buttons */}
          <div className="flex flex-wrap gap-2 mt-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 border-green-200 text-green-700 hover:bg-green-50"
              onClick={handleCreateEstimate}
            >
              <PlusCircle size={16} />
              Create Estimate
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
              onClick={handleGenerateInvoice}
            >
              <FileText size={16} />
              Generate Invoice
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 border-purple-200 text-purple-700 hover:bg-purple-50"
              onClick={handleCollectPayment}
            >
              <DollarSign size={16} />
              Collect Payment
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
