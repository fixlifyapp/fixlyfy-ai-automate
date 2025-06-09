
import { useState, useEffect } from 'react';

export interface JobData {
  id: string;
  title: string;
  client_name?: string;
  client_phone?: string;
  client_email?: string;
  address?: string;
}

export const useJobData = (jobId: string) => {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    setIsLoading(false);
  }, [jobId]);

  // Mock client info
  const clientInfo = {
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '(555) 123-4567'
  };

  const jobAddress = '123 Main St, Anytown, ST 12345';

  return {
    clientInfo,
    jobAddress,
    loading: isLoading
  };
};
