
import React, { createContext, useContext } from 'react';
import { useJobData, JobData } from './useJobData';

interface JobInfo {
  id: string;
  title: string;
  clientId: string;
  client: string;
  service: string;
  phone: string;
  status: string;
  address?: string;
}

interface JobDetailsContextType {
  job: JobData | null;
  isLoading: boolean;
  error: string | null;
  refreshJobData: () => void;
  currentStatus: string;
  setCurrentStatus: (status: string) => void;
  updateJobStatus?: (status: string) => void;
  invoiceAmount: number;
  balance: number;
  jobInfo: JobInfo | null;
}

const JobDetailsContext = createContext<JobDetailsContextType | undefined>(undefined);

interface JobDetailsProviderProps {
  jobId: string;
  children: React.ReactNode;
}

export const JobDetailsProvider = ({ jobId, children }: JobDetailsProviderProps) => {
  const { job, isLoading, error, refreshJobData } = useJobData(jobId);

  // Mock additional properties that were expected
  const currentStatus = job?.status || 'scheduled';
  const setCurrentStatus = (status: string) => {
    console.log('Status update:', status);
  };
  
  const updateJobStatus = (status: string) => {
    console.log('Update job status:', status);
    setCurrentStatus(status);
  };
  
  const invoiceAmount = 0;
  const balance = 0;

  // Transform JobData to JobInfo format
  const jobInfo: JobInfo | null = job ? {
    id: job.id,
    title: job.title,
    clientId: job.client_id,
    client: job.client_name || job.client || 'Unknown Client',
    service: job.service || job.description || 'No description',
    phone: job.client_phone || job.phone || '',
    status: job.status,
    address: job.address
  } : null;

  return (
    <JobDetailsContext.Provider
      value={{
        job,
        isLoading,
        error,
        refreshJobData,
        currentStatus,
        setCurrentStatus,
        updateJobStatus,
        invoiceAmount,
        balance,
        jobInfo
      }}
    >
      {children}
    </JobDetailsContext.Provider>
  );
};

export const useJobDetails = () => {
  const context = useContext(JobDetailsContext);
  if (context === undefined) {
    throw new Error('useJobDetails must be used within a JobDetailsProvider');
  }
  return context;
};
