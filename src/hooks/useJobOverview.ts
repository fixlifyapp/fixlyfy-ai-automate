
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface JobOverview {
  id: string;
  job_id: string;
  property_type?: string;
  property_age?: string;
  property_size?: string;
  previous_service_date?: string;
  warranty_info?: any;
  emergency_contact?: any;
  billing_contact?: any;
  lead_source?: string;
  estimated_duration?: number;
  special_instructions?: string;
  client_requirements?: string;
  access_instructions?: string;
  preferred_time?: string;
  equipment_needed?: string[];
  safety_notes?: string;
  created_at?: string;
  updated_at?: string;
}

export const useJobOverview = (jobId: string) => {
  const [overview, setOverview] = useState<JobOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!jobId) {
      setIsLoading(false);
      return;
    }

    const fetchOverview = async () => {
      try {
        setIsLoading(true);
        
        // First, get the job data with additional fields (removed priority)
        const { data: jobData, error: jobError } = await supabase
          .from('jobs')
          .select(`
            id,
            job_type,
            lead_source,
            estimated_duration,
            special_instructions,
            client_requirements,
            access_instructions,
            preferred_time,
            equipment_needed,
            safety_notes
          `)
          .eq('id', jobId)
          .maybeSingle();

        if (jobError) {
          console.error("Error fetching job overview data:", jobError);
          toast.error("Error loading job overview");
          return;
        }

        // Then get the job_overview data
        const { data: overviewData, error: overviewError } = await supabase
          .from('job_overview')
          .select('*')
          .eq('job_id', jobId)
          .maybeSingle();

        if (overviewError && overviewError.code !== 'PGRST116') {
          console.error("Error fetching job overview:", overviewError);
          toast.error("Error loading job overview details");
          return;
        }

        // Combine the data (removed priority)
        const combinedOverview: JobOverview = {
          id: overviewData?.id || '',
          job_id: jobId,
          lead_source: jobData?.lead_source,
          estimated_duration: jobData?.estimated_duration,
          special_instructions: jobData?.special_instructions,
          client_requirements: jobData?.client_requirements,
          access_instructions: jobData?.access_instructions,
          preferred_time: jobData?.preferred_time,
          equipment_needed: jobData?.equipment_needed || [],
          safety_notes: jobData?.safety_notes,
          property_type: overviewData?.property_type,
          property_age: overviewData?.property_age,
          property_size: overviewData?.property_size,
          previous_service_date: overviewData?.previous_service_date,
          warranty_info: overviewData?.warranty_info || {},
          emergency_contact: overviewData?.emergency_contact || {},
          billing_contact: overviewData?.billing_contact || {},
          created_at: overviewData?.created_at,
          updated_at: overviewData?.updated_at
        };

        setOverview(combinedOverview);
      } catch (error) {
        console.error("Error in fetchOverview:", error);
        toast.error("Error loading job overview");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOverview();
  }, [jobId]);

  const saveOverview = async (data: Partial<JobOverview>) => {
    try {
      // Separate job table fields from job_overview table fields (removed priority)
      const jobFields = {
        job_type: data.lead_source,
        lead_source: data.lead_source,
        estimated_duration: data.estimated_duration,
        special_instructions: data.special_instructions,
        client_requirements: data.client_requirements,
        access_instructions: data.access_instructions,
        preferred_time: data.preferred_time,
        equipment_needed: data.equipment_needed,
        safety_notes: data.safety_notes
      };

      const overviewFields = {
        job_id: jobId,
        property_type: data.property_type,
        property_age: data.property_age,
        property_size: data.property_size,
        previous_service_date: data.previous_service_date,
        warranty_info: data.warranty_info || {},
        emergency_contact: data.emergency_contact || {},
        billing_contact: data.billing_contact || {}
      };

      // Update jobs table
      const { error: jobError } = await supabase
        .from('jobs')
        .update(jobFields)
        .eq('id', jobId);

      if (jobError) throw jobError;

      // Upsert job_overview table
      const { error: overviewError } = await supabase
        .from('job_overview')
        .upsert(overviewFields, { onConflict: 'job_id' });

      if (overviewError) throw overviewError;

      toast.success("Job overview updated successfully");
      
      // Refresh the data
      setOverview(prev => prev ? { ...prev, ...data } : null);
      
      return true;
    } catch (error) {
      console.error("Error saving job overview:", error);
      toast.error("Failed to save job overview");
      return false;
    }
  };

  return {
    overview,
    isLoading,
    saveOverview
  };
};
