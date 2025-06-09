
import { useState } from "react";
import { toast } from "sonner";
import { Product } from "../../builder/types";

// Define simple interfaces since useEstimateData doesn't exist
interface Estimate {
  id: string;
  estimate_number?: string;
  number?: string;
  total: number;
  status: string;
  notes?: string;
  viewed?: boolean;
  techniciansNote?: string;
  items?: any[];
}

export const useEstimateWarranty = (
  estimates: Estimate[],
  setEstimates: (estimates: Estimate[]) => void,
  selectedEstimate: Estimate | null
) => {
  // Handle warranty selection and addition - MOCK IMPLEMENTATION
  const handleWarrantySelection = async (selectedWarranty: Product | null, customNote: string) => {
    if (selectedWarranty && selectedEstimate) {
      try {
        console.log("Mock: Adding warranty to estimate:", selectedWarranty.name);
        
        // Mock warranty addition logic
        const newTotal = selectedEstimate.total + selectedWarranty.price;
        
        // Update the local state with the newly created item
        const updatedEstimates = estimates.map(est => 
          est.id === selectedEstimate.id 
            ? {
                ...est,
                items: [
                  ...(est.items || []),
                  {
                    id: `warranty-${Date.now()}`,
                    description: selectedWarranty.name,
                    quantity: 1,
                    unitPrice: selectedWarranty.price,
                    taxable: false,
                    total: selectedWarranty.price,
                    name: selectedWarranty.name,
                    price: selectedWarranty.price
                  }
                ],
                total: newTotal,
                notes: customNote || est.notes,
                techniciansNote: customNote || est.techniciansNote || ""
              } 
            : est
        );
        
        setEstimates(updatedEstimates);
        toast.success(`${selectedWarranty.name} added to estimate ${selectedEstimate.estimate_number}`);
      } catch (error) {
        console.error('Error adding warranty:', error);
        toast.error('Failed to add warranty to estimate');
      }
    }
  };

  // Handle removing a warranty from an estimate - MOCK IMPLEMENTATION
  const removeWarrantyFromEstimate = async (itemId: string) => {
    if (!selectedEstimate) return;
    
    try {
      // Find the item to get its price
      const itemToRemove = selectedEstimate.items?.find(item => item.id === itemId);
      
      if (!itemToRemove) {
        toast.error('Item not found');
        return;
      }
      
      console.log("Mock: Removing warranty from estimate:", itemId);
      
      // Calculate item price
      const itemPrice = itemToRemove.unitPrice * itemToRemove.quantity;
      
      // Update the estimate total
      const newTotal = Math.max(0, selectedEstimate.total - itemPrice);
      
      // Update the local state
      const updatedEstimates = estimates.map(est => 
        est.id === selectedEstimate.id
          ? {
              ...est,
              items: (est.items || []).filter(item => item.id !== itemId),
              total: newTotal
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
