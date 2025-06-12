
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useJobStatusUpdate } from './useJobStatusUpdate';
import { supabase } from '@/integrations/supabase/client';
import { Job } from '@/hooks/useJobs';

interface JobDetailsContextType {
  job: Job | null;
  isLoading: boolean;
  updateJobStatus: (jobId: string, newStatus: string) => Promise<void>;
  refreshJob: () => Promise<void>;
}

const JobDetailsContext = createContext<JobDetailsContextType | undefined>(undefined);

export const useJobDetails = () => {
  const context = useContext(JobDetailsContext);
  if (!context) {
    throw new Error('useJobDetails must be used within a JobDetailsProvider');
  }
  return context;
};

interface JobDetailsProviderProps {
  children: React.ReactNode;
  jobId: string;
}

export const JobDetailsProvider = ({ children, jobId }: JobDetailsProviderProps) => {
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { updateJobStatus } = useJobStatusUpdate();

  const refreshJob = async () => {
    if (!jobId) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (error) {
        console.error('Error fetching job:', error);
        return;
      }

      setJob(data);
    } catch (error) {
      console.error('Error in refreshJob:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshJob();
  }, [jobId]);

  const handleUpdateJobStatus = async (jobId: string, newStatus: string) => {
    await updateJobStatus(jobId, newStatus);
    await refreshJob(); // Refresh job data after status update
  };

  const value: JobDetailsContextType = {
    job,
    isLoading,
    updateJobStatus: handleUpdateJobStatus,
    refreshJob
  };

  return (
    <JobDetailsContext.Provider value={value}>
      {children}
    </JobDetailsContext.Provider>
  );
};
