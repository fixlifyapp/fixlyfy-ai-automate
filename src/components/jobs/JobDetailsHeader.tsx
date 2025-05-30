
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { JobInfoSection } from "./header/JobInfoSection";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export const JobDetailsHeader = () => {
  const { id: jobId } = useParams<{ id: string }>();
  const [job, setJob] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      setIsLoading(true);
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select(`
          *,
          client:clients(*)
        `)
        .eq('id', jobId)
        .single();

      if (jobError) throw jobError;

      if (jobData) {
        const clientData = Array.isArray(jobData.client) ? jobData.client[0] : jobData.client;
        
        setJob({
          id: jobData.id,
          clientId: clientData?.id || '',
          client: clientData?.name || 'Unknown Client',
          service: jobData.service || '',
          address: clientData?.address || '',
          phone: clientData?.phone || '',
          email: clientData?.email || '',
          total: 0, // This will be calculated by useJobFinancials
          status: jobData.status || 'scheduled'
        });
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
      toast.error('Failed to load job details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!jobId) return;
    
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ status: newStatus })
        .eq('id', jobId);

      if (error) throw error;

      setJob(prev => prev ? { ...prev, status: newStatus } : null);
      toast.success('Job status updated successfully');
    } catch (error) {
      console.error('Error updating job status:', error);
      toast.error('Failed to update job status');
    }
  };

  const handleCallClick = () => {
    if (job?.phone) {
      window.open(`tel:${job.phone}`, '_self');
    }
  };

  const handleMessageClick = () => {
    if (job?.phone) {
      window.open(`sms:${job.phone}`, '_self');
    }
  };

  const handleEditClient = () => {
    // TODO: Implement edit client functionality
    toast.info('Edit client functionality coming soon');
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-8 w-64 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="p-6">
        <div className="text-center text-muted-foreground">
          Job not found
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <JobInfoSection
        job={job}
        status={job.status}
        onStatusChange={handleStatusChange}
        onCallClick={handleCallClick}
        onMessageClick={handleMessageClick}
        onEditClient={handleEditClient}
      />
    </div>
  );
};
