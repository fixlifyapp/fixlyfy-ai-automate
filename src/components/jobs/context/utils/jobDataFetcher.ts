
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface JobDataFetchResult {
  jobData: any;
  paymentsData: any[] | null;
}

export const fetchJobWithClient = async (jobId: string): Promise<JobDataFetchResult> => {
  console.log("🔍 Fetching job data for jobId:", jobId);
  
  // First, check authentication
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
  
  // Try to get the full job data with client
  let jobData: any = null;
  const { data: jobDataResult, error: jobError } = await supabase
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
    
    jobData = { ...jobOnly, clients: clientData };
  } else {
    jobData = jobDataResult;
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
  
  // Fetch payments for this job
  const { data: paymentsData, error: paymentsError } = await supabase
    .from('payments')
    .select('amount')
    .eq('job_id', jobId);
    
  if (paymentsError) {
    console.warn("⚠️ Could not fetch payments:", paymentsError);
  }
  
  return { jobData, paymentsData };
};
