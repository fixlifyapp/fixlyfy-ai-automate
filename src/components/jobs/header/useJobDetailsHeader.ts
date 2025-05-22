
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { payments } from "@/data/payments";
import { Payment } from "@/types/payment";

export interface JobInfo {
  id: string;
  clientId: string;
  client: string;
  service: string;
  address: string;
  phone: string;
  email: string;
  total: number;
  status?: string;
  companyName?: string;
  companyLogo?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  legalText?: string;
}

export const useJobDetailsHeader = (id: string) => {
  // Use a try-catch to handle cases where the router context isn't available
  let navigate;
  try {
    navigate = useNavigate();
  } catch (error) {
    console.warn("Navigation context not available:", error);
    // Provide a fallback navigate function that does nothing
    navigate = () => {};
  }
  
  const [job, setJob] = useState<JobInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<string>("scheduled");
  const [invoiceAmount, setInvoiceAmount] = useState(0);
  const [estimateAmount, setEstimateAmount] = useState(0);
  const [paymentsMade, setPaymentsMade] = useState<number[]>([]);
  const [hasEstimate, setHasEstimate] = useState(false);
  const [jobPayments, setJobPayments] = useState<Payment[]>([]);
  
  // Load job info and initial payment data
  useEffect(() => {
    if (!id) return;
    
    setIsLoading(true);
    
    const fetchJobData = async () => {
      try {
        // Fetch job details from Supabase
        const { data: jobData, error: jobError } = await supabase
          .from('jobs')
          .select(`
            *,
            clients(id, name, email, phone, address, city, state, zip, country)
          `)
          .eq('id', id)
          .single();
        
        if (jobError) {
          console.error("Error fetching job:", jobError);
          toast.error("Error loading job details");
          setIsLoading(false);
          return;
        }
        
        if (!jobData) {
          console.error("Job not found");
          toast.error("Job not found");
          setIsLoading(false);
          return;
        }
        
        // Extract client information
        const client = jobData.clients || {};
        
        // Create formatted address from client data
        const formattedAddress = [
          client.address,
          client.city,
          client.state,
          client.zip,
          client.country
        ].filter(Boolean).join(', ');
        
        // Create job info object
        const jobInfo: JobInfo = {
          id: jobData.id,
          clientId: client.id || "",
          client: client.name || "Unknown Client",
          service: jobData.service || "General Service",
          address: formattedAddress,
          phone: client.phone || "",
          email: client.email || "",
          total: jobData.revenue || 0,
          status: jobData.status || "scheduled"
        };
        
        setJob(jobInfo);
        setStatus(jobData.status || "scheduled");
        
        // Set invoice amount from job total
        setInvoiceAmount(jobData.revenue || 0);
        
        // Fetch payments for this job
        const { data: paymentsData } = await supabase
          .from('payments')
          .select('*')
          .eq('invoice_id', id);
        
        if (paymentsData && paymentsData.length > 0) {
          setJobPayments(paymentsData);
          
          // Extract payment amounts
          const paymentAmounts = paymentsData.map(payment => payment.amount || 0);
          setPaymentsMade(paymentAmounts);
        }
        
        // Fetch estimates for this job
        const { data: estimatesData } = await supabase
          .from('estimates')
          .select('*')
          .eq('job_id', id);
        
        if (estimatesData && estimatesData.length > 0) {
          setHasEstimate(true);
          setEstimateAmount(estimatesData[0].total || 0);
        }
        
      } catch (error) {
        console.error("Error in useJobDetailsHeader:", error);
        toast.error("Error loading job details");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchJobData();
  }, [id]);

  // Calculate balance based on invoice amount minus payments
  // Note: Estimates don't affect the balance
  const balance = invoiceAmount - paymentsMade.reduce((total, payment) => total + payment, 0);

  const handleStatusChange = async (newStatus: string) => {
    if (!id) return;
    
    try {
      // Update job status in database
      const { error } = await supabase
        .from('jobs')
        .update({ status: newStatus })
        .eq('id', id);
        
      if (error) {
        console.error("Error updating job status:", error);
        toast.error("Failed to update job status");
        return;
      }
      
      setStatus(newStatus);
      toast.success(`Job status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error in handleStatusChange:", error);
      toast.error("Failed to update job status");
    }
  };

  const handleEditClient = () => {
    if (job?.clientId) {
      navigate(`/clients/${job.clientId}`);
    }
  };

  const handleInvoiceCreated = (amount: number) => {
    setInvoiceAmount(amount);
    toast.success(`Invoice created for $${amount.toFixed(2)}`);
  };

  const handleEstimateCreated = (amount: number) => {
    setEstimateAmount(amount);
    setHasEstimate(true);
    toast.success(`Estimate created for $${amount.toFixed(2)}`);
  };

  const handleSyncEstimateToInvoice = () => {
    setInvoiceAmount(estimateAmount);
    toast.success(`Estimate of $${estimateAmount.toFixed(2)} synced to invoice successfully`);
  };

  // Handle recording a payment
  const handlePaymentRecorded = async (amount: number) => {
    if (!id || !job?.clientId) return;
    
    try {
      // Create payment record in database
      const newPayment = {
        amount: amount,
        date: new Date().toISOString(),
        invoice_id: id,
        method: "credit-card",
        reference: `Payment for job ${id}`
      };
      
      const { data, error } = await supabase
        .from('payments')
        .insert(newPayment)
        .select()
        .single();
      
      if (error) {
        console.error("Error recording payment:", error);
        toast.error("Failed to record payment");
        return;
      }
      
      // Update the payments list
      setPaymentsMade(prevPayments => [...prevPayments, amount]);
      setJobPayments(prevPayments => [...prevPayments, data]);
      
      toast.success(`Payment of $${amount.toFixed(2)} recorded`);
    } catch (error) {
      console.error("Error in handlePaymentRecorded:", error);
      toast.error("Failed to record payment");
    }
  };

  // Add the missing handler methods
  const handleCompleteJob = () => {
    handleStatusChange("completed");
  };

  const handleCancelJob = () => {
    handleStatusChange("cancelled");
  };

  const handleReschedule = () => {
    toast.success("Job rescheduling initiated");
    // In a real app, this would open a rescheduling dialog
  };

  return {
    job,
    isLoading,
    status,
    balance,
    invoiceAmount,
    estimateAmount,
    hasEstimate,
    jobPayments,
    handleStatusChange,
    handleEditClient,
    handleInvoiceCreated,
    handleEstimateCreated,
    handleSyncEstimateToInvoice,
    handlePaymentRecorded,
    handleCompleteJob,
    handleCancelJob,
    handleReschedule
  };
};
