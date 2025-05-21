
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LineItem } from "@/components/jobs/builder/types";

export interface Estimate {
  id: string;
  job_id: string;
  date: string;
  estimate_number: string;
  status: string;
  total: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  items?: LineItem[];
  viewed?: boolean;
  recommendedProduct?: any;
  techniciansNote?: string;
}

export const useEstimateData = (jobId: string) => {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch estimates from Supabase
  useEffect(() => {
    const fetchEstimates = async () => {
      if (!jobId) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        const { data: estimatesData, error: estimatesError } = await supabase
          .from('estimates')
          .select('*')
          .eq('job_id', jobId)
          .order('created_at', { ascending: false });
        
        if (estimatesError) {
          console.error('Error fetching estimates:', estimatesError);
          setError(estimatesError);
          setEstimates([]);
          setIsLoading(false);
          return;
        }

        if (estimatesData?.length) {
          const estimatesWithItems = await Promise.all(
            estimatesData.map(async (estimate) => {
              // Fetch line items for each estimate
              const { data: itemsData, error: itemsError } = await supabase
                .from('line_items')
                .select('*')
                .eq('parent_type', 'estimate')
                .eq('parent_id', estimate.id);
                
              if (itemsError) {
                console.error('Error fetching line items:', itemsError);
                return {
                  ...estimate,
                  items: []
                };
              }
              
              // Transform items to match our LineItem interface
              const items = itemsData?.map(item => ({
                id: item.id,
                description: item.description || '',
                quantity: item.quantity,
                unitPrice: Number(item.unit_price),
                taxable: item.taxable,
                total: item.quantity * Number(item.unit_price)
              })) || [];
              
              return {
                ...estimate,
                items,
                viewed: false,
                recommendedProduct: null,
                techniciansNote: ""
              };
            })
          );
          
          setEstimates(estimatesWithItems);
        } else {
          setEstimates([]);
        }
      } catch (error) {
        console.error('Error in useEstimateData:', error);
        setError(error instanceof Error ? error : new Error('Unknown error occurred'));
        setEstimates([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEstimates();
  }, [jobId]);

  return {
    estimates,
    setEstimates,
    isLoading,
    error
  };
};
