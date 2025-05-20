
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Estimate } from "@/hooks/useEstimates";

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
        const transformedEstimates: Estimate[] = data.map((est) => {
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
            job_id: est.job_id,
            number: est.number,
            date: est.date,
            amount: est.amount,
            status: est.status,
            viewed: est.viewed,
            discount: est.discount || 0,
            tax_rate: est.tax_rate || 0,
            technicians_note: est.technicians_note || '',
            created_at: est.created_at,
            updated_at: est.updated_at,
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
            estimate_items: items,
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
