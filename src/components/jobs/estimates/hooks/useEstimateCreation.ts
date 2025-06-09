
import { useState } from "react";
import { toast } from "sonner";
import { Product, LineItem } from "@/components/jobs/builder/types";
import { generateNextId } from "@/utils/idGeneration";

export const useEstimateCreation = (
  jobId: string,
  estimates: any[],
  setEstimates: (estimates: any[]) => void
) => {
  const [selectedEstimateId, setSelectedEstimateId] = useState<string | null>(null);
  const [estimateItems, setEstimateItems] = useState<Product[]>([]);

  // Handle creating a new estimate
  const handleCreateEstimate = () => {
    // This function just signals the dialog should open
    // The actual creation happens in handleEstimateCreated
    setEstimateItems([]);
    setSelectedEstimateId(null);
  };

  // Handle editing an existing estimate
  const handleEditEstimate = (estimateId: string) => {
    console.log("useEstimateCreation.handleEditEstimate called with ID:", estimateId);
    const estimate = estimates.find(est => est.id === estimateId);
    if (estimate) {
      setSelectedEstimateId(estimateId);
      loadEstimateItems(estimateId);
      toast.info(`Editing estimate ${estimate.estimate_number || estimate.number}`);
    } else {
      console.error("Estimate not found with ID:", estimateId);
      toast.error("Estimate not found");
    }
  };

  // Load existing items for an estimate - MOCK IMPLEMENTATION
  const loadEstimateItems = async (estimateId: string) => {
    try {
      console.log("Loading estimate items for ID (MOCK):", estimateId);
      
      // Mock estimate items data
      const mockItems: Product[] = [
        {
          id: 'item-1',
          name: 'HVAC Filter',
          description: 'High-efficiency air filter',
          category: 'Parts',
          price: 25.00,
          quantity: 1,
          taxable: true,
          tags: [],
          cost: 15.00,
          ourPrice: 0,
          sku: 'HF-001'
        },
        {
          id: 'item-2',
          name: 'Labor - HVAC Service',
          description: 'Professional HVAC service labor',
          category: 'Labor',
          price: 85.00,
          quantity: 2,
          taxable: true,
          tags: [],
          cost: 50.00,
          ourPrice: 0,
          sku: 'LB-001'
        }
      ];
      
      console.log("Mock estimate items loaded:", mockItems);
      setEstimateItems(mockItems);
    } catch (error) {
      console.error('Error loading estimate items:', error);
      toast.error('Failed to load estimate items');
    }
  };

  // Add a product to the estimate
  const addProductToEstimate = (product: Product) => {
    // Ensure ourPrice is set to 0 for any product added to estimates
    const productWithDefaults = {
      ...product,
      ourPrice: product.ourPrice || 0,
      quantity: product.quantity || 1
    };
    setEstimateItems(prev => [...prev, productWithDefaults]);
  };

  // Remove a product from the estimate - MOCK IMPLEMENTATION
  const removeProductFromEstimate = async (productId: string) => {
    try {
      console.log("Removing product from estimate (MOCK):", productId);
      
      // Mock removal logic
      const itemToRemove = estimateItems.find(item => item.id === productId);
      
      if (selectedEstimateId && itemToRemove) {
        // Mock update estimate total
        const estimate = estimates.find(est => est.id === selectedEstimateId);
        if (estimate) {
          const itemTotal = (itemToRemove.price || 0) * (itemToRemove.quantity || 1);
          const newTotal = Math.max(0, estimate.total - itemTotal);
          
          // Update the local estimates array
          setEstimates(estimates.map(est => 
            est.id === selectedEstimateId ? { ...est, total: newTotal } : est
          ));
        }
        
        toast.success('Product removed from estimate');
      }
    } catch (error) {
      console.error('Error in removeProductFromEstimate:', error);
      toast.error('Failed to remove product');
    }
    
    // Always update the local state
    setEstimateItems(prev => prev.filter(item => item.id !== productId));
  };

  // Calculate total amount based on products
  const calculateEstimateTotal = () => {
    return estimateItems.reduce((total, item) => {
      const itemPrice = item.price || 0;
      const itemQuantity = item.quantity || 1;
      return total + (itemPrice * itemQuantity);
    }, 0);
  };

  // Handle estimate creation from the dialog - MOCK IMPLEMENTATION
  const handleEstimateCreated = async (amount: number) => {
    try {
      // Generate a new estimate number using the simplified numbering system
      const newEstimateNumber = await generateNextId('estimate');
      
      console.log('Creating estimate for job (MOCK):', jobId, 'with amount:', amount);
      console.log('Generated estimate number:', newEstimateNumber);
      
      // Mock estimate creation
      const mockEstimate = {
        id: `mock-estimate-${Date.now()}`,
        job_id: jobId,
        estimate_number: newEstimateNumber,
        total: amount,
        status: 'draft',
        date: new Date().toISOString(),
        viewed: false,
        items: estimateItems.map(product => ({
          id: `temp-${Date.now()}-${Math.random()}`,
          description: product.description || '',
          quantity: product.quantity || 1,
          unitPrice: product.price,
          taxable: product.taxable,
          total: product.price * (product.quantity || 1)
        })),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('Mock estimate created:', mockEstimate);
      
      // Add the new estimate to the list
      setEstimates([mockEstimate, ...estimates]);
      
      toast.success(`Estimate ${newEstimateNumber} created`);
      return mockEstimate;
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
