
import { createContext, useContext, useState } from "react";
import { useUnifiedRealtime } from "@/hooks/useUnifiedRealtime";
import { JobDetailsContextType } from "./types";
import { useJobData } from "./useJobData";
import { useJobStatusUpdate } from "./useJobStatusUpdate";

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
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const refreshJob = () => {
    console.log('Refreshing job data for jobId:', jobId);
    setRefreshTrigger(prev => prev + 1);
  };
  
  // Use unified realtime for all related data
  useUnifiedRealtime({
    tables: ['jobs', 'clients', 'payments', 'invoices'],
    onUpdate: refreshJob,
    enabled: !!jobId
  });
  
  // Load job data
  const {
    job,
    isLoading,
    currentStatus,
    setCurrentStatus,
    invoiceAmount,
    balance
  } = useJobData(jobId, refreshTrigger);
  
  // Handle status updates
  const { updateJobStatus: handleUpdateJobStatus } = useJobStatusUpdate(jobId, refreshJob);
  
  const updateJobStatus = async (newStatus: string) => {
    await handleUpdateJobStatus(newStatus);
    setCurrentStatus(newStatus);
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

// Re-export types for backward compatibility
export type { JobInfo } from "./types";
