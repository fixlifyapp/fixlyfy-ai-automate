
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { JobInfo } from "./types";

// Request deduplication cache for job data
const jobRequestCache = new Map<string, Promise<any>>();

export const useJobData = (jobId: string, refreshTrigger: number) => {
  const [job, setJob] = useState<JobInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStatus, setCurrentStatus] = useState<string>("scheduled");
  const [invoiceAmount, setInvoiceAmount] = useState(0);
  const [balance, setBalance] = useState(0);
  
  const isMountedRef = useRef(true);
  
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!jobId) {
      console.log('No jobId provided');
      setIsLoading(false);
      return;
    }
    
    const cacheKey = `job_${jobId}_${refreshTrigger}`;
    
    // Check if request is already in flight
    if (jobRequestCache.has(cacheKey)) {
      jobRequestCache.get(cacheKey)?.then((result) => {
        if (isMountedRef.current && result) {
          setJob(result.jobInfo);
          setCurrentStatus(result.status);
          setInvoiceAmount(result.invoiceAmount);
          setBalance(result.balance);
          setIsLoading(false);
        }
      }).catch(() => {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      });
      return;
    }
    
    console.log('Fetching job data for ID:', jobId);
    setIsLoading(true);
    
    const fetchJobData = async () => {
      try {
        // Fetch job details from Supabase with proper client relationship
        const { data: jobData, error: jobError } = await supabase
          .from('jobs')
          .select(`
            *,
            clients(*)
          `)
          .eq('id', jobId)
          .maybeSingle();
        
        if (jobError) {
          console.error("Error fetching job:", jobError);
          toast.error("Error loading job details");
          throw jobError;
        }
        
        if (!jobData) {
          console.error("Job not found for ID:", jobId);
          toast.error("Job not found");
          throw new Error("Job not found");
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
        
        // Safely convert tasks from JSONB to string array
        let tasksArray: string[] = [];
        if (jobData.tasks) {
          if (Array.isArray(jobData.tasks)) {
            tasksArray = jobData.tasks.map(task => String(task));
          } else if (typeof jobData.tasks === 'string') {
            try {
              const parsed = JSON.parse(jobData.tasks);
              tasksArray = Array.isArray(parsed) ? parsed.map(task => String(task)) : [];
            } catch {
              tasksArray = [];
            }
          }
        }
        
        // Create job info object
        const jobInfo: JobInfo = {
          id: jobData.id,
          clientId: client.id || "",
          client: client.name || "Unknown Client",
          service: jobData.service || "General Service",
          address: formattedAddress || jobData.address || "",
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
          lead_source: jobData.lead_source,
          tasks: tasksArray
        };
        
        console.log('Processed job info:', jobInfo);
        
        // Fetch payments for this job to calculate balance
        const { data: paymentsData } = await supabase
          .from('payments')
          .select('amount')
          .eq('invoice_id', jobId);
          
        const totalPayments = paymentsData 
          ? paymentsData.reduce((sum, payment) => sum + (payment.amount || 0), 0) 
          : 0;
        
        const result = {
          jobInfo,
          status: jobData.status || "scheduled",
          invoiceAmount: jobData.revenue || 0,
          balance: (jobData.revenue || 0) - totalPayments
        };
        
        return result;
        
      } catch (error) {
        console.error("Error in fetching job details:", error);
        toast.error("Error loading job details");
        throw error;
      }
    };
    
    // Cache and execute the request
    const requestPromise = fetchJobData();
    jobRequestCache.set(cacheKey, requestPromise);
    
    requestPromise
      .then((result) => {
        if (isMountedRef.current) {
          setJob(result.jobInfo);
          setCurrentStatus(result.status);
          setInvoiceAmount(result.invoiceAmount);
          setBalance(result.balance);
        }
      })
      .catch(() => {
        // Error already handled in fetchJobData
      })
      .finally(() => {
        jobRequestCache.delete(cacheKey);
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      });

    // Set up real-time subscription for job updates - single subscription
    const channel = supabase
      .channel(`job-updates-${jobId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs',
          filter: `id=eq.${jobId}`
        },
        () => {
          if (isMountedRef.current) {
            console.log('Real-time job update detected, triggering refresh...');
            // Clear cache and trigger refresh by incrementing trigger
            jobRequestCache.delete(cacheKey);
            setRefreshTrigger(prev => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      jobRequestCache.delete(cacheKey);
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
