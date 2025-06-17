
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { JobInfo } from "./types";

// Request deduplication cache for job data with longer TTL
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
      console.log("❌ No jobId provided to useJobData");
      setIsLoading(false);
      return;
    }
    
    const cacheKey = `job_${jobId}_${refreshTrigger}`;
    
    // Check if request is already in flight
    if (jobRequestCache.has(cacheKey)) {
      console.log("🔄 Using cached request for job:", jobId);
      jobRequestCache.get(cacheKey)?.then((result) => {
        if (isMountedRef.current && result) {
          setJob(result.jobInfo);
          setCurrentStatus(result.status);
          setInvoiceAmount(result.invoiceAmount);
          setBalance(result.balance);
          setIsLoading(false);
        }
      }).catch((error) => {
        console.error("❌ Cached request failed:", error);
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      });
      return;
    }
    
    setIsLoading(true);
    
    const fetchJobData = async () => {
      try {
        console.log("🔍 Fetching job data for jobId:", jobId);
        
        // First, let's check if the user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) {
          console.error("❌ Auth error:", authError);
          throw new Error("Authentication failed");
        }
        
        if (!user) {
          console.error("❌ No authenticated user");
          throw new Error("No authenticated user");
        }
        
        console.log("✅ User authenticated:", user.id);
        
        // Check if job exists first with simple query
        const { data: jobExists, error: jobExistsError } = await supabase
          .from('jobs')
          .select('id, title, client_id')
          .eq('id', jobId)
          .single();
        
        if (jobExistsError || !jobExists) {
          console.error("❌ Job doesn't exist:", jobExistsError);
          toast.error(`Job ${jobId} not found`);
          throw new Error(`Job not found: ${jobId}`);
        }
        
        console.log("✅ Job exists:", jobExists);
        
        // Now try to get the full job data with client
        const { data: jobData, error: jobError } = await supabase
          .from('jobs')
          .select(`
            *,
            clients(*)
          `)
          .eq('id', jobId)
          .single();
        
        if (jobError) {
          console.error("❌ Error fetching job with client:", jobError);
          
          // Fallback: get job without client join
          const { data: jobOnly, error: jobOnlyError } = await supabase
            .from('jobs')
            .select('*')
            .eq('id', jobId)
            .single();
            
          if (jobOnlyError) {
            throw new Error(`Failed to fetch job: ${jobOnlyError.message}`);
          }
          
          // Get client separately if job has client_id
          let clientData = null;
          if (jobOnly.client_id) {
            const { data: client, error: clientError } = await supabase
              .from('clients')
              .select('*')
              .eq('id', jobOnly.client_id)
              .single();
              
            if (!clientError && client) {
              clientData = client;
            } else {
              console.warn("⚠️ Could not fetch client data:", clientError);
            }
          }
          
          // Use the separated data
          jobData = { ...jobOnly, clients: clientData };
        }
        
        if (!jobData) {
          console.error("❌ No job data returned for jobId:", jobId);
          toast.error(`Job ${jobId} not found`);
          throw new Error("Job not found");
        }
        
        console.log("✅ Job data fetched successfully:", {
          jobId: jobData.id,
          title: jobData.title,
          clientId: jobData.client_id,
          hasClient: !!jobData.clients
        });
        
        // Extract client information with type safety
        const client = jobData.clients || { 
          id: jobData.client_id || "",
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
          clientId: client.id || jobData.client_id || "",
          client: client.name || "Unknown Client",
          service: jobData.service || jobData.job_type || "General Service",
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
        
        // Batch fetch payments for this job to calculate balance
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('payments')
          .select('amount')
          .eq('job_id', jobId);
          
        if (paymentsError) {
          console.warn("⚠️ Could not fetch payments:", paymentsError);
        }
        
        const totalPayments = paymentsData 
          ? paymentsData.reduce((sum, payment) => sum + (payment.amount || 0), 0) 
          : 0;
        
        const result = {
          jobInfo,
          status: jobData.status || "scheduled",
          invoiceAmount: jobData.revenue || 0,
          balance: (jobData.revenue || 0) - totalPayments
        };
        
        console.log("✅ Job data processing complete:", {
          jobId: result.jobInfo.id,
          client: result.jobInfo.client,
          status: result.status,
          invoiceAmount: result.invoiceAmount,
          balance: result.balance
        });
        
        return result;
        
      } catch (error) {
        console.error("❌ Error in fetchJobData:", error);
        if (error instanceof Error) {
          toast.error(`Failed to load job: ${error.message}`);
        } else {
          toast.error("Failed to load job data");
        }
        throw error;
      }
    };
    
    // Cache and execute the request
    const requestPromise = fetchJobData();
    jobRequestCache.set(cacheKey, requestPromise);
    
    requestPromise
      .then((result) => {
        if (isMountedRef.current) {
          console.log("✅ Setting job data in state");
          setJob(result.jobInfo);
          setCurrentStatus(result.status);
          setInvoiceAmount(result.invoiceAmount);
          setBalance(result.balance);
        }
      })
      .catch((error) => {
        console.error("❌ Final error handling:", error);
        // Error already handled in fetchJobData
      })
      .finally(() => {
        // Keep cache longer for better performance
        setTimeout(() => {
          jobRequestCache.delete(cacheKey);
        }, 300000); // 5 minutes
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      });

    return () => {
      // Don't immediately clear cache on unmount
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
