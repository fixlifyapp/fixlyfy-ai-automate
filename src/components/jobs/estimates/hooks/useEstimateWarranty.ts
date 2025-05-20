
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "../../builder/types";

export const useEstimateWarranty = (
  estimates: any[],
  setEstimates: (estimates: any[]) => void,
  selectedEstimate: any
) => {
  // Handle warranty selection and addition
  const handleWarrantySelection = async (selectedWarranty: Product | null, customNote: string) => {
    if (selectedWarranty && selectedEstimate) {
      try {
        // Add the warranty to the estimate in Supabase
        const { error: itemError } = await supabase
          .from('estimate_items')
          .insert({
            estimate_id: selectedEstimate.id,
            name: selectedWarranty.name,
            description: selectedWarranty.description,
            price: selectedWarranty.price,
            quantity: 1,
            taxable: true,
            category: selectedWarranty.category,
            tags: selectedWarranty.tags || [],
          });
          
        if (itemError) {
          throw itemError;
        }
        
        // Update the estimate amount
        const newAmount = selectedEstimate.amount + selectedWarranty.price;
        const { error: updateError } = await supabase
          .from('estimates')
          .update({ amount: newAmount })
          .eq('id', selectedEstimate.id);
          
        if (updateError) {
          throw updateError;
        }
        
        // Update local state
        const updatedEstimates = estimates.map(est => 
          est.id === selectedEstimate.id 
            ? {
                ...est,
                items: [
                  ...est.items,
                  {
                    id: `item-w-${Date.now()}`, // Temporary ID until we refresh
                    name: selectedWarranty.name,
                    description: selectedWarranty.description,
                    price: selectedWarranty.price,
                    quantity: 1,
                    taxable: true,
                    category: selectedWarranty.category,
                    tags: selectedWarranty.tags || [],
                  }
                ],
                amount: est.amount + selectedWarranty.price
              } 
            : est
        );
        
        setEstimates(updatedEstimates);
        toast.success(`${selectedWarranty.name} added to estimate ${selectedEstimate.number}`);
      } catch (error) {
        console.error('Error adding warranty:', error);
        toast.error('Failed to add warranty to estimate');
      }
    }
  };

  return {
    handleWarrantySelection
  };
};
