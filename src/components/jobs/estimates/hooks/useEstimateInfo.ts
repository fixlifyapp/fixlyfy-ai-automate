
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useEstimateInfo = (jobId?: string) => {
  const [jobInfo, setJobInfo] = useState<any>(null);
  const [clientInfo, setClientInfo] = useState<any>(null);
  const [companyInfo, setCompanyInfo] = useState<any>({
    name: "Fixlyfy Services",
    logo: "/placeholder.svg",
    address: "123 Business Ave",
    phone: "(555) 123-4567",
    email: "info@fixlyfy.com",
    legalText: "All estimates are valid for 30 days from the date of issue."
  });
  
  // Generate a unique number for the estimate
  const generateUniqueNumber = (prefix: string) => {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000);
    return `${prefix}-${timestamp % 10000}${random}`;
  };
  
  return {
    jobInfo,
    clientInfo,
    companyInfo,
    generateUniqueNumber
  };
};
