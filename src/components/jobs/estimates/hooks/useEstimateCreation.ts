
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useEstimateInfo } from "./useEstimateInfo";
import { Product } from "@/hooks/useProducts";

export const useEstimateCreation = (
  jobId: string,
  estimates: any[],
  setEstimates: (estimates: any[]) => void
) => {
  const [selectedEstimateId, setSelectedEstimateId] = useState<string | null>(null);
  const [estimateItems, setEstimateItems] = useState<Product[]>([]);
  const { generateUniqueNumber } = useEstimateInfo();

  // Handle creating a new estimate
  const handleCreateEstimate = () => {
    // This function just signals the dialog should open
    // The actual creation happens in handleEstimateCreated
    setEstimateItems([]);
  };

  // Handle editing an existing estimate
  const handleEditEstimate = (estimateId: string) => {
    const estimate = estimates.find(est => est.id === estimateId);
    if (estimate) {
      setSelectedEstimateId(estimateId);
      loadEstimateItems(estimateId);
      toast.info(`Editing estimate ${estimate.number}`);
    }
  };

  // Load existing items for an estimate
  const loadEstimateItems = async (estimateId: string) => {
    try {
      const { data, error } = await supabase
        .from('estimate_items')
        .select('*')
        .eq('estimate_id', estimateId);
      
      if (error) throw error;

      // Fix: Map the database items to Product type with required fields
      if (data) {
        const mappedItems: Product[] = data.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description || "",
          category: item.category || "",
          price: Number(item.price),
          quantity: item.quantity,
          taxable: item.taxable,
          tags: item.tags || [],
          cost: 0, // Add required field
          ourPrice: 0, // Add required field
          sku: ""
        }));
        setEstimateItems(mappedItems);
      } else {
        setEstimateItems([]);
      }
    } catch (error) {
      console.error('Error loading estimate items:', error);
      toast.error('Failed to load estimate items');
    }
  };

  // Add a product to the estimate
  const addProductToEstimate = (product: Product) => {
    setEstimateItems(prev => [...prev, product]);
  };

  // Remove a product from the estimate
  const removeProductFromEstimate = (productId: string) => {
    setEstimateItems(prev => prev.filter(item => item.id !== productId));
  };

  // Calculate total amount based on products
  const calculateEstimateTotal = () => {
    return estimateItems.reduce((total, item) => total + item.price, 0);
  };

  // Handle estimate creation from the dialog
  const handleEstimateCreated = async (amount: number) => {
    try {
      // Generate a new estimate number using the utility function
      const newEstimateNumber = generateUniqueNumber('EST');
      
      console.log('Creating estimate for job:', jobId, 'with amount:', amount);
      
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
        console.error('Supabase error:', error);
        throw error;
      }
      
      // Save estimate items if there are any
      if (estimateItems.length > 0) {
        const itemsToInsert = estimateItems.map(product => ({
          estimate_id: data.id,
          name: product.name,
          description: product.description || '',
          category: product.category,
          price: product.price,
          quantity: 1,
          taxable: product.taxable || true,
          tags: product.tags || []
        }));

        const { error: itemsError } = await supabase
          .from('estimate_items')
          .insert(itemsToInsert);

        if (itemsError) {
          console.error('Error saving estimate items:', itemsError);
          toast.error('Warning: Some items may not have been saved');
        }
      }
      
      // Create a new estimate object
      const newEstimate = {
        id: data.id,
        number: data.number,
        date: data.date,
        amount: data.amount,
        status: data.status,
        viewed: false,
        items: estimateItems.map(product => ({
          name: product.name,
          description: product.description || '',
          price: product.price,
          quantity: 1,
          category: product.category
        })),
        recommendedProduct: null,
        techniciansNote: ""
      };
      
      console.log('Created estimate:', newEstimate);
      
      // Add the new estimate to the list
      setEstimates([newEstimate, ...estimates]);
      
      toast.success(`Estimate ${newEstimateNumber} created`);
      return newEstimate;
    } catch (error) {
      console.error('Error creating estimate:', error);
      toast.error('Failed to create estimate');
      return null;
    }
  };

  return {
    state: {
      selectedEstimateId,
      estimateItems
    },
    actions: {
      handleCreateEstimate,
      handleEditEstimate,
      handleEstimateCreated,
      setSelectedEstimateId,
      addProductToEstimate,
      removeProductFromEstimate,
      calculateEstimateTotal,
      setEstimateItems
    }
  };
};
