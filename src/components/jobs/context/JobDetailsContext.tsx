
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
  const invoiceAmount = 0;
  const balance = 0;

  // Transform JobData to JobInfo format
  const jobInfo: JobInfo | null = job ? {
    id: job.id,
    title: job.title,
    clientId: job.client_id,
    client: job.client_name || 'Unknown Client',
    service: job.description || 'No description',
    phone: '', // Not available in current JobData
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
