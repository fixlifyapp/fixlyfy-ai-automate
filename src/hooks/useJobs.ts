import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { recordStatusChange } from "@/services/jobHistoryService";
import { useRBAC } from "@/components/auth/RBACProvider";
import { useUnifiedRealtime } from "@/hooks/useUnifiedRealtime";

export interface Job {
  id: string;
  title: string;
  description?: string;
  service?: string;
  status: string;
  client_id: string;
  client?: {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  property_id?: string;
  property?: {
    id: string;
    property_name: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  technician_id?: string;
  schedule_start?: string;
  schedule_end?: string;
  date: string;
  revenue?: number;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
  custom_fields?: Array<{
    id: string;
    name: string;
    value: string;
    field_type: string;
  }>;
  job_type?: string;
  lead_source?: string;
  tasks?: string[];
}

export const useJobs = (clientId?: string, includeCustomFields: boolean = false) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { currentUser } = useRBAC();
  
  // Function to fetch jobs from Supabase
  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      // Prepare base query with property information
      let query = supabase
        .from('jobs')
        .select(`
          id,
          title,
          description,
          service,
          status,
          client_id,
          property_id,
          technician_id,
          schedule_start,
          schedule_end,
          date,
          revenue,
          tags,
          created_at,
          updated_at,
          job_type,
          lead_source,
          tasks,
          clients(name, phone, email, address, city, state, zip),
          client_properties(id, property_name, address, city, state, zip)
        `);
        
      // Filter by client if provided
      if (clientId) {
        query = query.eq('client_id', clientId);
      }
      
      // Execute query
      const { data: jobsData, error: jobsError } = await query.order('date', { ascending: false });
      
      if (jobsError) throw jobsError;
      
      let transformedJobs = jobsData?.map(job => {
        // Safely convert tasks from JSONB to string array
        let tasksArray: string[] = [];
        if (job.tasks) {
          if (Array.isArray(job.tasks)) {
            tasksArray = job.tasks.map(task => String(task));
          } else if (typeof job.tasks === 'string') {
            try {
              const parsed = JSON.parse(job.tasks);
              tasksArray = Array.isArray(parsed) ? parsed.map(task => String(task)) : [];
            } catch {
              tasksArray = [];
            }
          }
        }

        return {
          ...job,
          tasks: tasksArray,
          client: {
            name: job.clients?.name || 'Unknown Client',
            phone: job.clients?.phone,
            email: job.clients?.email,
            address: [
              job.clients?.address,
              job.clients?.city,
              job.clients?.state,
              job.clients?.zip
            ].filter(Boolean).join(', ')
          },
          property: job.client_properties ? {
            id: job.client_properties.id,
            property_name: job.client_properties.property_name,
            address: job.client_properties.address,
            city: job.client_properties.city,
            state: job.client_properties.state,
            zip: job.client_properties.zip
          } : undefined
        };
      }) || [];

      // Fetch custom fields if requested
      if (includeCustomFields && transformedJobs.length > 0) {
        const jobIds = transformedJobs.map(job => job.id);
        
        const { data: customFieldData, error: customFieldError } = await supabase
          .from('job_custom_field_values')
          .select(`
            job_id,
            value,
            custom_fields!inner(
              id,
              name,
              field_type
            )
          `)
          .in('job_id', jobIds);

        if (!customFieldError && customFieldData) {
          // Group custom fields by job_id
          const customFieldsByJob = customFieldData.reduce((acc, field) => {
            if (!acc[field.job_id]) {
              acc[field.job_id] = [];
            }
            acc[field.job_id].push({
              id: field.custom_fields.id,
              name: field.custom_fields.name,
              value: field.value || '',
              field_type: field.custom_fields.field_type
            });
            return acc;
          }, {} as Record<string, any[]>);

          // Add custom fields to jobs
          transformedJobs = transformedJobs.map(job => ({
            ...job,
            custom_fields: customFieldsByJob[job.id] || []
          }));
        }
      }
      
      setJobs(transformedJobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Set up unified realtime sync
  useUnifiedRealtime({
    tables: ['jobs', 'clients', 'client_properties', 'job_custom_field_values'],
    onUpdate: fetchJobs,
    enabled: true
  });
  
  // Set up initial data fetch and refresh on dependency changes
  useEffect(() => {
    fetchJobs();
  }, [clientId, refreshTrigger, includeCustomFields]);
  
  const addJob = async (job: Omit<Job, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Generate a job ID in the format JOB-XXXXX
      const jobNumber = Math.floor(10000 + Math.random() * 90000);
      const jobId = `JOB-${jobNumber}`;
      
      // Validate required fields
      if (!job.title || !job.client_id) {
        throw new Error('Title and client are required');
      }
      
      // Prepare job data with property_id
      const newJob = {
        id: jobId,
        title: job.title,
        description: job.description || '',
        status: job.status || 'scheduled',
        client_id: job.client_id,
        property_id: job.property_id, // Include property_id
        service: job.service || 'General Service',
        job_type: job.job_type || job.service || 'General Service',
        lead_source: job.lead_source,
        tasks: job.tasks || [],
        ...(job.technician_id && job.technician_id !== '' && { technician_id: job.technician_id }),
        schedule_start: job.schedule_start,
        schedule_end: job.schedule_end,
        date: job.date || new Date().toISOString(),
        revenue: job.revenue || 0,
        tags: job.tags || []
      };
      
      console.log('Creating job with data:', newJob);
      
      const { data, error } = await supabase
        .from('jobs')
        .insert(newJob)
        .select(`
          id,
          title,
          description,
          service,
          status,
          client_id,
          property_id,
          technician_id,
          schedule_start,
          schedule_end,
          date,
          revenue,
          tags,
          job_type,
          lead_source,
          tasks,
          created_at,
          updated_at,
          clients(name, phone, email, address, city, state, zip),
          client_properties(id, property_name, address, city, state, zip)
        `)
        .single();
        
      if (error) {
        console.error('Error creating job:', error);
        throw error;
      }
      
      // Safely convert tasks from JSONB to string array
      let tasksArray: string[] = [];
      if (data.tasks) {
        if (Array.isArray(data.tasks)) {
          tasksArray = data.tasks.map(task => String(task));
        } else if (typeof data.tasks === 'string') {
          try {
            const parsed = JSON.parse(data.tasks);
            tasksArray = Array.isArray(parsed) ? parsed.map(task => String(task)) : [];
          } catch {
            tasksArray = [];
          }
        }
      }
      
      // Transform the returned data
      const jobWithClient = {
        ...data,
        tasks: tasksArray,
        client: {
          name: data.clients?.name || 'Unknown Client',
          phone: data.clients?.phone,
          email: data.clients?.email,
          address: [
            data.clients?.address,
            data.clients?.city,
            data.clients?.state,
            data.clients?.zip
          ].filter(Boolean).join(', ')
        },
        property: data.client_properties ? {
          id: data.client_properties.id,
          property_name: data.client_properties.property_name,
          address: data.client_properties.address,
          city: data.client_properties.city,
          state: data.client_properties.state,
          zip: data.client_properties.zip
        } : undefined
      };
      
      // Record job creation in history
      try {
        await recordStatusChange(
          jobId,
          'new',
          'scheduled',
          currentUser?.name,
          currentUser?.id
        );
      } catch (historyError) {
        console.warn('Failed to record job history:', historyError);
      }
      
      toast.success(`Job ${jobId} created successfully`);
      
      // Refresh the jobs list
      fetchJobs();
      
      return jobWithClient;
    } catch (error) {
      console.error('Error adding job:', error);
      toast.error('Failed to create job: ' + (error as Error).message);
      return null;
    }
  };

  const updateJob = async (id: string, updates: Partial<Job>) => {
    try {
      // If status is being updated, record it in history
      if (updates.status) {
        const job = jobs.find(j => j.id === id);
        if (job && job.status !== updates.status) {
          await recordStatusChange(
            id,
            job.status,
            updates.status,
            currentUser?.name,
            currentUser?.id
          );
        }
      }
      
      const { data, error } = await supabase
        .from('jobs')
        .update(updates)
        .eq('id', id)
        .select(`
          id,
          title,
          description,
          service,
          status,
          client_id,
          property_id,
          technician_id,
          schedule_start,
          schedule_end,
          date,
          revenue,
          tags,
          created_at,
          updated_at,
          clients(name)
        `)
        .single();
        
      if (error) throw error;
      
      toast.success('Job updated successfully');
      return data;
    } catch (error) {
      console.error('Error updating job:', error);
      toast.error('Failed to update job');
      return null;
    }
  };

  const deleteJob = async (id: string) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success('Job deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job');
      return false;
    }
  };

  return {
    jobs,
    isLoading,
    addJob,
    updateJob,
    deleteJob,
    refreshJobs: () => setRefreshTrigger(prev => prev + 1)
  };
};
