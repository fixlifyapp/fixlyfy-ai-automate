
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
    // Store recommendation data in the component state if not viewed yet
    if (!estimate.viewed) {
      // Check if there's any recommendation data in notes or attached product
      const hasRecommendation = estimate.notes?.includes("Recommended:") || false;
      
      if (hasRecommendation) {
        // For demonstration, we'll create a placeholder product from notes
        const fakeProduct: Product = {
          id: `rec-${Date.now()}`,
          name: "Recommended Service",
          description: estimate.notes || "",
          price: 99.99,
          category: "Services",
          taxable: true,
          cost: 50,
          ourPrice: 75,
          sku: ""
          // Do not include quantity here as it's optional in the Product interface
        };
        
        setRecommendedProduct(fakeProduct);
        setTechniciansNote(estimate.notes || "");
        
        // Mark as viewed in state
        updateEstimateViewed(estimate.id);
        
        return true; // Indicating upsell should be shown
      }
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
