
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
  
  // Optimized real-time subscription with minimal refresh
  useEffect(() => {
    if (!jobId) return;

    // Clean up previous subscription
    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current);
    }

    let debounceTimer: NodeJS.Timeout;
    let isSubscribed = true;
    
    const channel = supabase
      .channel(`job-details-optimized-${jobId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs',
          filter: `id=eq.${jobId}`
        },
        (payload) => {
          if (!isSubscribed || !isMountedRef.current) return;
          
          console.log('Real-time job update:', payload);
          
          // For status changes, update immediately without debounce
          if (payload.eventType === 'UPDATE' && payload.new?.status !== payload.old?.status) {
            setCurrentStatus(payload.new.status);
            return;
          }
          
          // For other changes, use longer debounce
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            if (isSubscribed && isMountedRef.current) {
              refreshJob();
            }
          }, 2000); // 2 second debounce for non-status changes
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
  }, [jobId, setCurrentStatus]);
  
  const updateJobStatus = async (newStatus: string) => {
    // Optimistic update - update UI immediately without waiting
    const previousStatus = currentStatus;
    setCurrentStatus(newStatus);
    
    try {
      await handleUpdateJobStatus(newStatus);
      // Status already updated optimistically, no need to refresh
    } catch (error) {
      // Revert optimistic update on error
      setCurrentStatus(previousStatus);
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
