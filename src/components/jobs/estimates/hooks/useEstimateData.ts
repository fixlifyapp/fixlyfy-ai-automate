
import { useState, useEffect } from "react";
import { toast } from "sonner";
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
  viewed?: boolean; // For UI tracking
  recommendedProduct?: any; // Added for upsell functionality
  techniciansNote?: string; // Added for technician notes
}

export const useEstimateData = (jobId: string) => {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch estimates from Supabase
  useEffect(() => {
    const fetchEstimates = async () => {
      setIsLoading(true);
      try {
        const { data: estimatesData, error: estimatesError } = await supabase
          .from('estimates')
          .select('*')
          .eq('job_id', jobId)
          .order('created_at', { ascending: false });
        
        if (estimatesError) {
          throw estimatesError;
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
                viewed: false, // Default to not viewed for UI tracking
                recommendedProduct: null, // Default to no recommended product
                techniciansNote: "" // Default to no technician's note
              };
            })
          );
          
          setEstimates(estimatesWithItems);
        } else {
          setEstimates([]);
        }
      } catch (error) {
        console.error('Error fetching estimates:', error);
        toast.error('Failed to load estimates');
      } finally {
        setIsLoading(false);
      }
    };

    if (jobId) {
      fetchEstimates();
    }
  }, [jobId]);

  return {
    estimates,
    setEstimates,
    isLoading
  };
};
