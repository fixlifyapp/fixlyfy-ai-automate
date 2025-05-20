
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ClientInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
}

export interface CompanyInfo {
  name: string;
  logo: string;
  address: string;
  phone: string;
  email: string;
  legalText: string;
}

export interface JobInfo {
  id: string;
  title: string;
  description: string;
  service?: string;
}

export const useEstimateInfo = (jobId?: string, clientId?: string) => {
  const [clientInfo, setClientInfo] = useState<ClientInfo>({
    name: "Client Name",
    address: "123 Client St",
    phone: "(555) 555-5555",
    email: "client@example.com"
  });
  
  const [jobInfo, setJobInfo] = useState<JobInfo | null>(null);
  
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: "Your Company",
    logo: "",
    address: "456 Company Ave",
    phone: "(555) 123-4567",
    email: "company@example.com",
    legalText: "Standard terms and conditions apply."
  });
  
  const [isLoading, setIsLoading] = useState(false);

  // Get client information from Supabase
  const fetchClientInfo = async (id: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('name, address, phone, email')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setClientInfo({
          name: data.name || "Unknown Client",
          address: data.address || "",
          phone: data.phone || "",
          email: data.email || ""
        });
      }
    } catch (error) {
      console.error('Error fetching client:', error);
      toast.error("Failed to load client information");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get job information from Supabase
  const fetchJobInfo = async (id: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('id, title, description, service, client_id')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setJobInfo({
          id: data.id,
          title: data.title || "Unnamed Job",
          description: data.description || "",
          service: data.service
        });
        
        // If clientId is not provided but available in the job data, fetch client info
        if (!clientId && data.client_id) {
          fetchClientInfo(data.client_id);
        }
      }
    } catch (error) {
      console.error('Error fetching job:', error);
      toast.error("Failed to load job information");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get company information
  const getCompanyInfo = (): CompanyInfo => {
    // In a real app, this would come from company settings stored in Supabase
    return companyInfo;
  };
  
  // Generate a unique estimate/invoice number
  const generateUniqueNumber = (prefix: string) => {
    const randomPart = Math.floor(10000 + Math.random() * 90000);
    const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    return `${prefix}-${datePart}-${randomPart}`;
  };

  useEffect(() => {
    if (clientId) {
      fetchClientInfo(clientId);
    }
    
    if (jobId) {
      fetchJobInfo(jobId);
    }
  }, [jobId, clientId]);

  return {
    state: {
      clientInfo,
      companyInfo,
      jobInfo,
      isLoading
    },
    actions: {
      fetchClientInfo,
      fetchJobInfo,
      getCompanyInfo,
      generateUniqueNumber
    }
  };
};
