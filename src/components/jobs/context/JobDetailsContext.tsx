
import { createContext, useContext, useState, useEffect, useRef } from "react";
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
  const isMountedRef = useRef(true);
  
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  const refreshJob = () => {
    if (isMountedRef.current) {
      console.log('Refreshing job data for jobId:', jobId);
      setRefreshTrigger(prev => prev + 1);
    }
  };
  
  // Load job data with stable refresh trigger
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
    // Optimistic update - update UI immediately
    setCurrentStatus(newStatus);
    
    try {
      await handleUpdateJobStatus(newStatus);
      // Don't trigger manual refresh - real-time will handle it
    } catch (error) {
      // Revert optimistic update on error
      setCurrentStatus(currentStatus);
      throw error;
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

// Re-export types for backward compatibility
export type { JobInfo } from "./types";
