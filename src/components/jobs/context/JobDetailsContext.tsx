
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  description?: string;
}

interface JobDetailsContextType {
  job: JobInfo | null;
  isLoading: boolean;
  currentStatus: string;
  invoiceAmount: number;
  balance: number;
  refreshJob: () => void;
  updateJobStatus: (newStatus: string) => Promise<void>;
}

const JobDetailsContext = createContext<JobDetailsContextType | undefined>(undefined);

export const useJobDetails = () => {
  const context = useContext(JobDetailsContext);
  if (context === undefined) {
    throw new Error("useJobDetails must be used within a JobDetailsProvider");
  }
  return context;
};

export const JobDetailsProvider = ({ 
  jobId, 
  children 
}: { 
  jobId: string;
  children: React.ReactNode;
}) => {
  const [job, setJob] = useState<JobInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStatus, setCurrentStatus] = useState<string>("scheduled");
  const [invoiceAmount, setInvoiceAmount] = useState(0);
  const [balance, setBalance] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const refreshJob = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  
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
          status: jobData.status || "scheduled",
          description: jobData.description || ""
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
  }, [jobId, refreshTrigger]);
  
  // Handle status change
  const updateJobStatus = async (newStatus: string) => {
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
      
      // Refresh job data
      refreshJob();
      
    } catch (error) {
      console.error("Error in updateJobStatus:", error);
      toast.error("Failed to update job status");
    }
  };
  
  return (
    <JobDetailsContext.Provider value={{
      job,
      isLoading,
      currentStatus,
      invoiceAmount,
      balance,
      refreshJob,
      updateJobStatus
    }}>
      {children}
    </JobDetailsContext.Provider>
  );
};
