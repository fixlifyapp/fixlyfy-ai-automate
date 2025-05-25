
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { JobInfo } from "./types";

export const useJobData = (jobId: string, refreshTrigger: number) => {
  const [job, setJob] = useState<JobInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStatus, setCurrentStatus] = useState<string>("scheduled");
  const [invoiceAmount, setInvoiceAmount] = useState(0);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (!jobId) {
      console.log('No jobId provided');
      setIsLoading(false);
      return;
    }
    
    console.log('Fetching job data for ID:', jobId);
    setIsLoading(true);
    
    const fetchJobData = async () => {
      try {
        // Fetch job details from Supabase with all fields including the new ones
        const { data: jobData, error: jobError } = await supabase
          .from('jobs')
          .select(`
            *,
            clients!inner(id, name, email, phone, address, city, state, zip, country)
          `)
          .eq('id', jobId)
          .maybeSingle();
        
        if (jobError) {
          console.error("Error fetching job:", jobError);
          toast.error("Error loading job details");
          setIsLoading(false);
          return;
        }
        
        if (!jobData) {
          console.error("Job not found for ID:", jobId);
          toast.error("Job not found");
          setIsLoading(false);
          return;
        }
        
        console.log('Fetched job data:', jobData);
        
        // Extract client information with type safety
        const client = jobData.clients || { 
          id: "",
          name: "Unknown Client",
          email: "",
          phone: "",
          address: "",
          city: "",
          state: "",
          zip: "",
          country: ""
        };
        
        // Create formatted address from client data
        const formattedAddress = [
          client.address || '',
          client.city || '',
          client.state || '',
          client.zip || '',
          client.country || ''
        ].filter(Boolean).join(', ');
        
        // Create job info object with all fields including the new ones
        const jobInfo: JobInfo = {
          id: jobData.id,
          clientId: client.id || "",
          client: client.name || "Unknown Client",
          service: jobData.service || "General Service",
          address: formattedAddress,
          phone: client.phone || "",
          email: client.email || "",
          total: jobData.revenue || 0,
          status: jobData.status || "scheduled",
          description: jobData.description || "",
          tags: jobData.tags || [],
          technician_id: jobData.technician_id,
          schedule_start: jobData.schedule_start,
          schedule_end: jobData.schedule_end,
          job_type: jobData.job_type || jobData.service,
          priority: jobData.priority || "medium",
          lead_source: jobData.lead_source,
          estimated_duration: jobData.estimated_duration,
          special_instructions: jobData.special_instructions,
          client_requirements: jobData.client_requirements,
          access_instructions: jobData.access_instructions,
          preferred_time: jobData.preferred_time,
          equipment_needed: jobData.equipment_needed || [],
          safety_notes: jobData.safety_notes,
          tasks: jobData.tasks || []
        };
        
        console.log('Processed job info:', jobInfo);
        
        setJob(jobInfo);
        setCurrentStatus(jobData.status || "scheduled");
        
        // Set invoice amount from job total
        setInvoiceAmount(jobData.revenue || 0);
        
        // Fetch payments for this job to calculate balance
        const { data: paymentsData } = await supabase
          .from('payments')
          .select('amount')
          .eq('invoice_id', jobId);
          
        const totalPayments = paymentsData 
          ? paymentsData.reduce((sum, payment) => sum + (payment.amount || 0), 0) 
          : 0;
          
        setBalance((jobData.revenue || 0) - totalPayments);
        
      } catch (error) {
        console.error("Error in fetching job details:", error);
        toast.error("Error loading job details");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchJobData();

    // Set up real-time subscription for job updates
    const channel = supabase
      .channel('job-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs',
          filter: `id=eq.${jobId}`
        },
        () => {
          console.log('Real-time job update detected, refetching...');
          fetchJobData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [jobId, refreshTrigger]);

  return {
    job,
    isLoading,
    currentStatus,
    setCurrentStatus,
    invoiceAmount,
    balance
  };
};
