
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useUnifiedRealtime } from "@/hooks/useUnifiedRealtime";
import { useJobTypes, useJobStatuses } from "@/hooks/useConfigItems";
import { generateNextId } from "@/utils/idGeneration";
import { usePermissions } from "@/hooks/usePermissions";

export interface Job {
  id: string;
  title?: string; // Made optional
  client_id?: string;
  description?: string;
  job_type?: string;
  lead_source?: string;
  status: string;
  service?: string;
  date?: string;
  schedule_start?: string;
  schedule_end?: string;
  technician_id?: string;
  revenue?: number;
  notes?: string;
  tags?: string[];
  tasks?: string[];
  property_id?: string;
  address?: string; // Added address field
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  client?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
}

export const useJobs = (clientId?: string, enableCustomFields?: boolean) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { user } = useAuth();
  const { getJobViewScope, canCreateJobs, canEditJobs, canDeleteJobs } = usePermissions();
  
  // Get configuration data for validation and consistency
  const { items: jobTypes } = useJobTypes();
  const { items: jobStatuses } = useJobStatuses();

  // Set up real-time updates
  useUnifiedRealtime({
    tables: ['jobs', 'job_custom_field_values'],
    onUpdate: () => {
      console.log('Real-time update triggered for jobs');
      setRefreshTrigger(prev => prev + 1);
    },
    enabled: true
  });

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('jobs')
        .select(`
          *,
          client:clients(id, name, email, phone, address, city, state, zip)
        `);
      
      // Apply client filter if specified
      if (clientId) {
        query = query.eq('client_id', clientId);
      }
      
      // Apply role-based filtering
      const jobViewScope = getJobViewScope();
      if (jobViewScope === "assigned" && user?.id) {
        query = query.eq('technician_id', user.id);
      } else if (jobViewScope === "none") {
        // User has no permission to view jobs
        setJobs([]);
        setIsLoading(false);
        return;
      }
      // For "all" scope, no additional filtering needed
      
      query = query.order('created_at', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Process jobs to ensure they have proper arrays for tags and tasks
      const processedJobs = (data || []).map(job => ({
        ...job,
        tags: Array.isArray(job.tags) ? job.tags : [],
        tasks: Array.isArray(job.tasks) 
          ? job.tasks.map(task => typeof task === 'string' ? task : String(task))
          : [],
        // Auto-generate title if missing
        title: job.title || `${job.client?.name || 'Service'} - ${job.job_type || job.service || 'General Service'}`
      }));
      
      setJobs(processedJobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setIsLoading(false);
    }
  }, [clientId, getJobViewScope, user?.id]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs, refreshTrigger]);

  const validateJobData = (jobData: any) => {
    // Validate job type against configuration
    if (jobData.job_type && jobTypes.length > 0) {
      const validJobType = jobTypes.find(jt => jt.name === jobData.job_type);
      if (!validJobType) {
        console.warn(`Job type "${jobData.job_type}" not found in configuration, using default`);
        const defaultJobType = jobTypes.find(jt => jt.is_default);
        jobData.job_type = defaultJobType?.name || 'General Service';
      }
    }

    // Validate status against configuration
    if (jobData.status && jobStatuses.length > 0) {
      const validStatus = jobStatuses.find(js => js.name.toLowerCase() === jobData.status.toLowerCase());
      if (!validStatus) {
        console.warn(`Job status "${jobData.status}" not found in configuration, using default`);
        const defaultStatus = jobStatuses.find(js => js.is_default) || jobStatuses[0];
        jobData.status = defaultStatus?.name || 'scheduled';
      }
    }

    return jobData;
  };

  const addJob = async (jobData: Partial<Job>) => {
    if (!canCreateJobs()) {
      toast.error("You don't have permission to create jobs");
      return null;
    }

    try {
      // Generate new job ID using the database function
      const jobId = await generateNextId('job');
      
      // Auto-generate title if not provided
      const autoTitle = jobData.title || 
        `${jobData.client?.name || 'Service'} - ${jobData.job_type || jobData.service || 'General Service'}`;
      
      // Get client address if client_id is provided
      let clientAddress = '';
      if (jobData.client_id) {
        const { data: clientData } = await supabase
          .from('clients')
          .select('address, city, state, zip')
          .eq('id', jobData.client_id)
          .single();
        
        if (clientData) {
          const addressParts = [
            clientData.address,
            clientData.city,
            clientData.state,
            clientData.zip
          ].filter(Boolean);
          clientAddress = addressParts.join(', ');
        }
      }
      
      // Validate and normalize job data using configuration
      const validatedJobData = validateJobData({
        ...jobData,
        id: jobId,
        title: autoTitle,
        address: clientAddress,
        created_by: user?.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tags: Array.isArray(jobData.tags) ? jobData.tags : [],
        tasks: Array.isArray(jobData.tasks) ? jobData.tasks.map(task => String(task)) : []
      });

      const { data, error } = await supabase
        .from('jobs')
        .insert(validatedJobData)
        .select()
        .single();

      if (error) throw error;

      console.log('Job created successfully:', data);
      
      // Real-time will handle the refresh automatically
      return data;
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  };

  const updateJob = async (jobId: string, updates: Partial<Job>) => {
    if (!canEditJobs()) {
      toast.error("You don't have permission to edit jobs");
      return null;
    }

    try {
      // Validate updates using configuration
      const validatedUpdates = validateJobData({
        ...updates,
        updated_at: new Date().toISOString()
      });

      const { data, error } = await supabase
        .from('jobs')
        .update(validatedUpdates)
        .eq('id', jobId)
        .select()
        .single();

      if (error) throw error;

      console.log('Job updated successfully:', data);
      
      // Real-time will handle the refresh automatically
      return data;
    } catch (error) {
      console.error('Error updating job:', error);
      throw error;
    }
  };

  const deleteJob = async (jobId: string) => {
    if (!canDeleteJobs()) {
      toast.error("You don't have permission to delete jobs");
      return false;
    }

    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) throw error;

      console.log('Job deleted successfully:', jobId);
      
      // Real-time will handle the refresh automatically
      return true;
    } catch (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  };

  const refreshJobs = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return {
    jobs,
    isLoading,
    addJob,
    updateJob,
    deleteJob,
    refreshJobs,
    // Permission flags for UI
    canCreate: canCreateJobs(),
    canEdit: canEditJobs(),
    canDelete: canDeleteJobs(),
    viewScope: getJobViewScope()
  };
};
