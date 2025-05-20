
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "../../builder/types";
import { Estimate } from "./useEstimateData";

export const useEstimateUpsell = (
  estimates: Estimate[],
  setEstimates: (estimates: Estimate[]) => void
) => {
  const [recommendedProduct, setRecommendedProduct] = useState<Product | null>(null);
  const [techniciansNote, setTechniciansNote] = useState("");

  // Handle view estimate function
  const handleViewEstimate = (estimate: Estimate) => {
    if (!estimate.viewed && estimate.recommendedProduct) {
      // Show upsell dialog when estimate is viewed the first time
      setRecommendedProduct(estimate.recommendedProduct);
      setTechniciansNote(estimate.techniciansNote || "");
      
      // Mark as viewed in state
      updateEstimateViewed(estimate.id);

      return true; // Indicating upsell should be shown
    }
    
    return false; // No upsell needed
  };

  // Update estimate viewed status in local state only
  const updateEstimateViewed = async (estimateId: string) => {
    try {
      // Update local state only, since 'viewed' is not in the database schema
      setEstimates(estimates.map(e => 
        e.id === estimateId ? {...e, viewed: true} : e
      ));
      
      // We could store this in notes if needed in the future
      const { error } = await supabase
        .from('estimates')
        .update({ 
          notes: 'Viewed by customer' // Store viewing state in notes
        })
        .eq('id', estimateId);
      
      if (error) {
        console.error('Error updating estimate viewed status:', error);
      }
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
