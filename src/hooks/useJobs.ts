
import { useEffect } from "react";
import { useJobsData } from "./useJobsData";
import { useJobsActions } from "./useJobsActions";
import { useRealtimeSync } from "./useRealtimeSync";

export const useJobs = (clientId?: string, enableCustomFields?: boolean) => {
  const { 
    jobs, 
    isLoading, 
    totalJobs, 
    filters, 
    updateFilters, 
    fetchJobs, 
    transformDatabaseJob 
  } = useJobsData(clientId);

  const { addJob, updateJob, deleteJob } = useJobsActions(fetchJobs, transformDatabaseJob);

  useEffect(() => {
    fetchJobs();
  }, [filters, clientId]);

  useRealtimeSync({
    tables: ['jobs', 'clients', 'estimates', 'invoices', 'client_properties'],
    onUpdate: () => {
      void fetchJobs();
    },
    enabled: true
  });

  return {
    jobs,
    isLoading,
    totalJobs,
    filters,
    updateFilters,
    addJob,
    updateJob,
    deleteJob,
    refreshJobs: fetchJobs
  };
};
