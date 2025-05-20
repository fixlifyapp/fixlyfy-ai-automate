
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "../../builder/types";

export const useEstimateUpsell = (
  estimates: any[],
  setEstimates: (estimates: any[]) => void
) => {
  const [recommendedProduct, setRecommendedProduct] = useState<Product | null>(null);
  const [techniciansNote, setTechniciansNote] = useState("");

  // Handle view estimate function
  const handleViewEstimate = (estimate: any) => {
    if (!estimate.viewed && estimate.recommendedProduct) {
      // Show upsell dialog when estimate is viewed the first time
      setRecommendedProduct(estimate.recommendedProduct);
      setTechniciansNote(estimate.techniciansNote);
      
      // Mark as viewed in the database
      updateEstimateViewed(estimate.id);

      return true; // Indicating upsell should be shown
    }
    
    return false; // No upsell needed
  };

  // Update estimate viewed status
  const updateEstimateViewed = async (estimateId: string) => {
    try {
      const { error } = await supabase
        .from('estimates')
        .update({ viewed: true })
        .eq('id', estimateId);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setEstimates(estimates.map(e => 
        e.id === estimateId ? {...e, viewed: true} : e
      ));
    } catch (error) {
      console.error('Error updating estimate viewed status:', error);
    }
  };

  // Handle upsell acceptance
  const handleUpsellAccept = (product: Product) => {
    toast.success(`${product.name} added to the estimate`);
    // In a real app, this would update the estimate with the added product
  };

  return {
    state: {
      recommendedProduct,
      techniciansNote,
    },
    actions: {
      handleViewEstimate,
      handleUpsellAccept,
      setRecommendedProduct,
      setTechniciansNote,
    }
  };
};
