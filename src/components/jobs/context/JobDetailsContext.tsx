
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useJobStatusUpdate } from './useJobStatusUpdate';
import { supabase } from '@/integrations/supabase/client';
import { Job } from '@/hooks/useJobs';
import { DbJob, DbClient, extractStringArray } from '@/types/database-types';

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
        .select(`
          *,
          clients:client_id (
            id,
            name,
            email,
            phone,
            address,
            city,
            state,
            zip
          )
        `)
        .eq('id', jobId)
        .single();

      if (error) {
        console.error('Error fetching job:', error);
        return;
      }

      // Transform the data to match Job interface
      const dbJob = data as DbJob & { clients?: DbClient | DbClient[] };
      const clientData = Array.isArray(dbJob.clients) ? dbJob.clients[0] : dbJob.clients;
      
      const transformedJob: Job = {
        id: dbJob.id,
        client_id: dbJob.client_id || '',
        clientId: dbJob.client_id || '',
        title: dbJob.title || '',
        description: dbJob.description || undefined,
        service: dbJob.service || undefined,
        status: dbJob.status || 'scheduled',
        tags: extractStringArray(dbJob.tags),
        notes: dbJob.notes || undefined,
        job_type: dbJob.job_type || undefined,
        lead_source: dbJob.lead_source || undefined,
        address: dbJob.address || undefined,
        date: dbJob.date || undefined,
        schedule_start: dbJob.schedule_start || undefined,
        schedule_end: dbJob.schedule_end || undefined,
        revenue: dbJob.revenue || undefined,
        technician_id: dbJob.technician_id || undefined,
        created_by: dbJob.created_by || undefined,
        created_at: dbJob.created_at,
        updated_at: dbJob.updated_at || dbJob.created_at,
        tasks: extractStringArray(dbJob.tasks),
        property_id: dbJob.property_id || undefined,
        client: clientData?.name || dbJob.client_id || '',
        phone: clientData?.phone || '',
        email: clientData?.email || '',
        total: dbJob.revenue || 0
      };

      setJob(transformedJob);
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
