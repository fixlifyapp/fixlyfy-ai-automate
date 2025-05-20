
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
        const { data: newItem, error: itemError } = await supabase
          .from('estimate_items')
          .insert({
            estimate_id: selectedEstimate.id,
            name: selectedWarranty.name,
            description: selectedWarranty.description,
            price: selectedWarranty.price,
            quantity: 1,
            taxable: false, // Warranties are typically not taxed
            category: selectedWarranty.category,
            tags: selectedWarranty.tags || [],
          })
          .select()
          .single();
          
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
        
        // Save technician's note if provided
        if (customNote.trim()) {
          const { error: noteError } = await supabase
            .from('estimates')
            .update({ technicians_note: customNote })
            .eq('id', selectedEstimate.id);
            
          if (noteError) {
            console.error('Error saving technician note:', noteError);
          }
        }
        
        // Update local state with the newly created item
        const updatedEstimates = estimates.map(est => 
          est.id === selectedEstimate.id 
            ? {
                ...est,
                items: [
                  ...est.items,
                  {
                    id: newItem.id, // Use the actual DB id
                    name: selectedWarranty.name,
                    description: selectedWarranty.description,
                    price: selectedWarranty.price,
                    quantity: 1,
                    taxable: false,
                    category: selectedWarranty.category,
                    tags: selectedWarranty.tags || [],
                  }
                ],
                amount: est.amount + selectedWarranty.price,
                techniciansNote: customNote || est.techniciansNote
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

  // Handle removing a warranty from an estimate
  const removeWarrantyFromEstimate = async (itemId: string) => {
    if (!selectedEstimate) return;
    
    try {
      // Find the item to get its price
      const itemToRemove = selectedEstimate.items.find((item: any) => item.id === itemId);
      
      if (!itemToRemove) {
        toast.error('Item not found');
        return;
      }
      
      // Delete the item from the database
      const { error: deleteError } = await supabase
        .from('estimate_items')
        .delete()
        .eq('id', itemId)
        .eq('estimate_id', selectedEstimate.id);
        
      if (deleteError) throw deleteError;
      
      // Update the estimate amount
      const newAmount = Math.max(0, selectedEstimate.amount - itemToRemove.price);
      
      const { error: updateError } = await supabase
        .from('estimates')
        .update({ amount: newAmount })
        .eq('id', selectedEstimate.id);
        
      if (updateError) throw updateError;
      
      // Update the local state
      const updatedEstimates = estimates.map(est => 
        est.id === selectedEstimate.id
          ? {
              ...est,
              items: est.items.filter((item: any) => item.id !== itemId),
              amount: newAmount
            }
          : est
      );
      
      setEstimates(updatedEstimates);
      toast.success('Item removed from estimate');
    } catch (error) {
      console.error('Error removing warranty:', error);
      toast.error('Failed to remove item from estimate');
    }
  };

  return {
    handleWarrantySelection,
    removeWarrantyFromEstimate
  };
};
