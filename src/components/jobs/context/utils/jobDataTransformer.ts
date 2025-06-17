
import { JobInfo } from "../types";

export const transformJobData = (jobData: any, paymentsData: any[] | null) => {
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
  
  // Calculate financial data
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
};
