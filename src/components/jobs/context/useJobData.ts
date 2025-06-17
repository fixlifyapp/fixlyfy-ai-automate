
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { JobInfo } from "./types";
import { fetchJobWithClient } from "./utils/jobDataFetcher";
import { transformJobData } from "./utils/jobDataTransformer";
import { getCachedJobData, setCachedJobData, hasCachedJobData } from "./utils/jobDataCache";

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
    if (hasCachedJobData(cacheKey)) {
      console.log("🔄 Using cached request for job:", jobId);
      getCachedJobData(cacheKey)?.then((result) => {
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
        const { jobData, paymentsData } = await fetchJobWithClient(jobId);
        return transformJobData(jobData, paymentsData);
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
    setCachedJobData(cacheKey, requestPromise);
    
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
