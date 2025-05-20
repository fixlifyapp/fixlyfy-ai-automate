
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface EstimateItem {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  taxable: boolean;
  category: string;
  tags: string[];
}

export interface Estimate {
  id: string;
  number: string;
  date: string;
  amount: number;
  status: string;
  viewed: boolean;
  items: EstimateItem[];
  recommendedProduct: any;
  techniciansNote: string;
}

export const useEstimateData = (jobId: string) => {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch estimates from Supabase
  useEffect(() => {
    const fetchEstimates = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('estimates')
          .select('*, estimate_items(*), recommended_products(*)')
          .eq('job_id', jobId)
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }

        // Transform the data to match our Estimate interface
        const transformedEstimates = data.map((est) => {
          // Extract estimate items
          const items = est.estimate_items || [];
          
          // Extract recommended product (if any)
          const recProduct = est.recommended_products && est.recommended_products.length > 0 
            ? {
                id: est.recommended_products[0].id,
                name: est.recommended_products[0].name,
                description: est.recommended_products[0].description || '',
                price: est.recommended_products[0].price,
                category: est.recommended_products[0].category || '',
                tags: est.recommended_products[0].tags || [],
              }
            : null;
            
          return {
            id: est.id,
            number: est.number,
            date: est.date,
            amount: est.amount,
            status: est.status,
            viewed: est.viewed,
            items: items.map((item: any) => ({
              id: item.id,
              name: item.name,
              description: item.description || '',
              price: item.price,
              quantity: item.quantity,
              taxable: item.taxable,
              category: item.category || '',
              tags: item.tags || [],
            })),
            recommendedProduct: recProduct,
            techniciansNote: est.technicians_note || '',
          };
        });
        
        setEstimates(transformedEstimates);
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
