
import { useState, useEffect } from "react";

interface EstimateDetails {
  estimate_id: string;
  estimate_number: string;
  total: number;
  status: string;
  notes?: string;
  job_id: string;
  job_title: string;
  job_description?: string;
  client_id: string;
  client_name: string;
  client_email?: string;
  client_phone?: string;
  client_company?: string;
}

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  taxable: boolean;
}

export const useEstimateData = (estimateNumber: string, jobId?: string) => {
  const [estimateDetails, setEstimateDetails] = useState<EstimateDetails | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchEstimateAndClientDetails = async () => {
    if (!estimateNumber) return;
    
    setIsLoading(true);
    try {
      console.log("=== FETCHING ESTIMATE DATA ===");
      console.log("Estimate number:", estimateNumber);
      console.log("Job ID:", jobId);
      
      // Mock estimate data for now since we don't have estimates table in current schema
      const mockEstimateDetails: EstimateDetails = {
        estimate_id: 'est-001',
        estimate_number: estimateNumber,
        total: 250.00,
        status: 'draft',
        notes: 'Standard maintenance estimate',
        job_id: jobId || 'job-001',
        job_title: 'HVAC Maintenance',
        job_description: 'Annual HVAC system inspection and maintenance',
        client_id: 'client-001',
        client_name: 'John Smith',
        client_email: 'john.smith@email.com',
        client_phone: '(555) 123-4567',
        client_company: 'Smith Residence'
      };

      const mockLineItems: LineItem[] = [
        {
          id: 'item-1',
          description: 'HVAC System Inspection',
          quantity: 1,
          unit_price: 75.00,
          taxable: true
        },
        {
          id: 'item-2', 
          description: 'Filter Replacement',
          quantity: 2,
          unit_price: 25.00,
          taxable: true
        }
      ];

      setEstimateDetails(mockEstimateDetails);
      setLineItems(mockLineItems);

      console.log("=== ESTIMATE DATA FETCH COMPLETED ===");

    } catch (error: any) {
      console.error('Error in fetchEstimateAndClientDetails:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEstimateAndClientDetails();
  }, [estimateNumber, jobId]);

  return {
    estimateDetails,
    lineItems,
    isLoading,
    refetchData: fetchEstimateAndClientDetails
  };
};
