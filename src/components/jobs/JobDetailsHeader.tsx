
import { Card } from "@/components/ui/card";
import { JobInfoSection } from "@/components/jobs/header/JobInfoSection";
import { JobActions } from "@/components/jobs/header/JobActions";
import { useState, useEffect } from "react";
import { useModal } from "@/components/ui/modal-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface JobDetailsHeaderProps {
  jobId: string;
}

export interface JobInfo {
  id: string;
  clientId: string;
  client: string;
  service: string;
  address: string;
  phone: string;
  email: string;
  total: number;
  status?: string;
}

export const JobDetailsHeader = ({ jobId }: JobDetailsHeaderProps) => {
  const navigate = useNavigate();
  const [job, setJob] = useState<JobInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStatus, setCurrentStatus] = useState<string>("scheduled");
  const [invoiceAmount, setInvoiceAmount] = useState(0);
  const [balance, setBalance] = useState(0);
  
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
  
  // Load job data
  useEffect(() => {
    if (!jobId) return;
    
    setIsLoading(true);
    
    const fetchJobData = async () => {
      try {
        // Fetch job details from Supabase
        const { data: jobData, error: jobError } = await supabase
          .from('jobs')
          .select(`
            *,
            clients(id, name, email, phone, address, city, state, zip, country)
          `)
          .eq('id', jobId)
          .single();
        
        if (jobError) {
          console.error("Error fetching job:", jobError);
          toast.error("Error loading job details");
          setIsLoading(false);
          return;
        }
        
        if (!jobData) {
          console.error("Job not found");
          toast.error("Job not found");
          setIsLoading(false);
          return;
        }
        
        // Extract client information with type safety
        const client = jobData.clients || { 
          id: "",
          name: "Unknown Client",
          email: "",
          phone: "",
          address: "",
          city: "",
          state: "",
          zip: "",
          country: ""
        };
        
        // Create formatted address from client data
        const formattedAddress = [
          client.address || '',
          client.city || '',
          client.state || '',
          client.zip || '',
          client.country || ''
        ].filter(Boolean).join(', ');
        
        // Create job info object
        const jobInfo: JobInfo = {
          id: jobData.id,
          clientId: client.id || "",
          client: client.name || "Unknown Client",
          service: jobData.service || "General Service",
          address: formattedAddress,
          phone: client.phone || "",
          email: client.email || "",
          total: jobData.revenue || 0,
          status: jobData.status || "scheduled"
        };
        
        setJob(jobInfo);
        setCurrentStatus(jobData.status || "scheduled");
        
        // Set invoice amount from job total
        setInvoiceAmount(jobData.revenue || 0);
        
        // Fetch payments for this job to calculate balance
        const { data: paymentsData } = await supabase
          .from('payments')
          .select('amount')
          .eq('invoice_id', jobId);
          
        const totalPayments = paymentsData 
          ? paymentsData.reduce((sum, payment) => sum + (payment.amount || 0), 0) 
          : 0;
          
        setBalance(jobData.revenue - totalPayments);
        
      } catch (error) {
        console.error("Error in fetching job details:", error);
        toast.error("Error loading job details");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchJobData();
  }, [jobId]);
  
  // Handle status change
  const handleStatusChange = async (newStatus: string) => {
    if (!jobId) return;
    
    try {
      // Update job status in database
      const { error } = await supabase
        .from('jobs')
        .update({ status: newStatus })
        .eq('id', jobId);
        
      if (error) {
        console.error("Error updating job status:", error);
        toast.error("Failed to update job status");
        return;
      }
      
      setCurrentStatus(newStatus);
      toast.success(`Job status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error in handleStatusChange:", error);
      toast.error("Failed to update job status");
    }
  };
  
  // Handle Edit Client action
  const handleEditClient = () => {
    if (job?.clientId) {
      navigate(`/clients/${job.clientId}`);
    }
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
            } else {
              handleEditClient();
            }
          }}
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
