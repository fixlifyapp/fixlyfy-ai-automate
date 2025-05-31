
import { createContext, useContext, useState, useEffect, useRef } from "react";
import { JobDetailsContextType } from "./types";
import { useJobData } from "./useJobData";
import { useJobStatusUpdate } from "./useJobStatusUpdate";
import { supabase } from "@/integrations/supabase/client";

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
  const subscriptionRef = useRef<any>(null);
  
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  const refreshJob = () => {
    if (isMountedRef.current) {
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
  
  // Single real-time subscription with smart debouncing
  useEffect(() => {
    if (!jobId) return;

    // Clean up previous subscription
    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current);
    }

    let debounceTimer: NodeJS.Timeout;
    let isSubscribed = true;
    
    const channel = supabase
      .channel(`job-details-realtime-${jobId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs',
          filter: `id=eq.${jobId}`
        },
        () => {
          if (!isSubscribed || !isMountedRef.current) return;
          
          // Smart debouncing with longer delay
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            if (isSubscribed && isMountedRef.current) {
              refreshJob();
            }
          }, 1500); // 1.5 second debounce
        }
      )
      .subscribe();

    subscriptionRef.current = channel;

    return () => {
      isSubscribed = false;
      clearTimeout(debounceTimer);
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, [jobId]);
  
  const updateJobStatus = async (newStatus: string) => {
    // Optimistic update - update UI immediately
    setCurrentStatus(newStatus);
    
    try {
      await handleUpdateJobStatus(newStatus);
      // Don't trigger manual refresh - real-time will handle it with debounce
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
