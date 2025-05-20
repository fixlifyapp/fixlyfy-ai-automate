
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useEstimateCreation = (
  jobId: string,
  estimates: any[],
  setEstimates: (estimates: any[]) => void
) => {
  const [selectedEstimateId, setSelectedEstimateId] = useState<string | null>(null);

  // Handle creating a new estimate
  const handleCreateEstimate = () => {
    // This function just signals the dialog should open
    // The actual creation happens in handleEstimateCreated
  };

  // Handle editing an existing estimate
  const handleEditEstimate = (estimateId: string) => {
    const estimate = estimates.find(est => est.id === estimateId);
    if (estimate) {
      setSelectedEstimateId(estimateId);
      toast.info(`Editing estimate ${estimate.number}`);
    }
  };

  // Handle estimate creation from the dialog
  const handleEstimateCreated = async (amount: number) => {
    try {
      // Generate a new estimate number
      const newEstimateNumber = `EST-${Math.floor(10000 + Math.random() * 90000)}`;
      
      // Create a new estimate in Supabase
      const { data, error } = await supabase
        .from('estimates')
        .insert({
          job_id: jobId,
          number: newEstimateNumber,
          amount: amount,
          status: 'draft'
        })
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      // Create a new estimate object
      const newEstimate = {
        id: data.id,
        number: data.number,
        date: data.date,
        amount: data.amount,
        status: data.status,
        viewed: false,
        items: [],
        recommendedProduct: null,
        techniciansNote: ""
      };
      
      // Add the new estimate to the list
      setEstimates([newEstimate, ...estimates]);
      
      toast.success(`Estimate ${newEstimateNumber} created`);
    } catch (error) {
      console.error('Error creating estimate:', error);
      toast.error('Failed to create estimate');
    }
  };

  return {
    state: {
      selectedEstimateId,
    },
    actions: {
      handleCreateEstimate,
      handleEditEstimate,
      handleEstimateCreated,
      setSelectedEstimateId,
    }
  };
};
