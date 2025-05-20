
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Product } from "../builder/types";
import { supabase } from "@/integrations/supabase/client";

interface EstimateItem {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  taxable: boolean;
  category: string;
  tags: string[];
}

interface Estimate {
  id: string;
  number: string;
  date: string;
  amount: number;
  status: string;
  viewed: boolean;
  items: EstimateItem[];
  recommendedProduct: Product | null;
  techniciansNote: string;
}

interface ClientInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
}

interface CompanyInfo {
  name: string;
  logo: string;
  address: string;
  phone: string;
  email: string;
  legalText: string;
}

export const useEstimates = (jobId: string, onEstimateConverted?: () => void) => {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isUpsellDialogOpen, setIsUpsellDialogOpen] = useState(false);
  const [isEstimateBuilderOpen, setIsEstimateBuilderOpen] = useState(false);
  const [isEstimateDialogOpen, setIsEstimateDialogOpen] = useState(false);
  const [selectedEstimateId, setSelectedEstimateId] = useState<string | null>(null);
  const [recommendedProduct, setRecommendedProduct] = useState<Product | null>(null);
  const [techniciansNote, setTechniciansNote] = useState("");
  const [isConvertToInvoiceDialogOpen, setIsConvertToInvoiceDialogOpen] = useState(false);
  const [selectedEstimate, setSelectedEstimate] = useState<any>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isWarrantyDialogOpen, setIsWarrantyDialogOpen] = useState(false);

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
        const transformedEstimates = data.map((est) => {
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
            number: est.number,
            date: est.date,
            amount: est.amount,
            status: est.status,
            viewed: est.viewed,
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

  const handleCreateEstimate = () => {
    setIsEstimateDialogOpen(true);
  };

  const handleEditEstimate = (estimateId: string) => {
    const estimate = estimates.find(est => est.id === estimateId);
    if (estimate) {
      setSelectedEstimateId(estimateId);
      setIsEstimateBuilderOpen(true);
      toast.info(`Editing estimate ${estimate.number}`);
    }
  };

  const handleViewEstimate = (estimate: any) => {
    if (!estimate.viewed && estimate.recommendedProduct) {
      // Show upsell dialog when estimate is viewed the first time
      setRecommendedProduct(estimate.recommendedProduct);
      setTechniciansNote(estimate.techniciansNote);
      setIsUpsellDialogOpen(true);
      
      // Mark as viewed in the database
      updateEstimateViewed(estimate.id);
    } else {
      // Just view the estimate
      handleEditEstimate(estimate.id);
    }
  };

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

  const handleSendEstimate = async (estimateId: string) => {
    try {
      const { error } = await supabase
        .from('estimates')
        .update({ status: 'sent' })
        .eq('id', estimateId);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setEstimates(estimates.map(e => 
        e.id === estimateId ? {...e, status: 'sent'} : e
      ));
      
      toast.success("Estimate sent to customer");
    } catch (error) {
      console.error('Error sending estimate:', error);
      toast.error('Failed to send estimate');
    }
  };

  const handleUpsellAccept = (product: Product) => {
    toast.success(`${product.name} added to the estimate`);
    // In a real app, this would update the estimate with the added product
  };
  
  const handleConvertToInvoice = (estimate: any) => {
    setSelectedEstimate(estimate);
    setIsConvertToInvoiceDialogOpen(true);
  };
  
  const confirmConvertToInvoice = async () => {
    if (!selectedEstimate) return;
    
    try {
      // In a real app, this would create a new invoice from the estimate
      // For now, we'll just mark the estimate as converted by updating its status
      const { error } = await supabase
        .from('estimates')
        .update({ status: 'converted' })
        .eq('id', selectedEstimate.id);
        
      if (error) {
        throw error;
      }
      
      toast.success(`Estimate ${selectedEstimate.number} converted to invoice`);
      
      // Remove the estimate from the list since it's now an invoice
      setEstimates(estimates.filter(est => est.id !== selectedEstimate.id));
      
      // Switch to the invoices tab if the callback is provided
      if (onEstimateConverted) {
        onEstimateConverted();
      }
    } catch (error) {
      console.error('Error converting estimate to invoice:', error);
      toast.error('Failed to convert estimate to invoice');
    } finally {
      setIsConvertToInvoiceDialogOpen(false);
    }
  };

  const handleDeleteEstimate = (estimateId: string) => {
    const estimate = estimates.find(e => e.id === estimateId);
    if (estimate) {
      setSelectedEstimate(estimate);
      setIsDeleteConfirmOpen(true);
    }
  };
  
  const confirmDeleteEstimate = async () => {
    if (!selectedEstimate) return;
    
    setIsDeleting(true);
    
    try {
      const { error } = await supabase
        .from('estimates')
        .delete()
        .eq('id', selectedEstimate.id);
        
      if (error) {
        throw error;
      }
      
      // Remove estimate from local state
      setEstimates(estimates.filter(est => est.id !== selectedEstimate.id));
      toast.success(`Estimate ${selectedEstimate.number} deleted successfully`);
    } catch (error) {
      console.error("Failed to delete estimate:", error);
      toast.error("Failed to delete estimate");
    } finally {
      setIsDeleting(false);
      setIsDeleteConfirmOpen(false);
    }
  };

  const handleSyncToInvoice = (estimate: any) => {
    toast.success(`Estimate ${estimate.number} synced to invoice`);
    
    // Switch to the invoices tab if the callback is provided
    if (onEstimateConverted) {
      onEstimateConverted();
    }
  };
  
  const handleAddWarranty = (estimate: any) => {
    setSelectedEstimate(estimate);
    setIsWarrantyDialogOpen(true);
  };
  
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
    setIsWarrantyDialogOpen(false);
  };

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
        items: [] as EstimateItem[],
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
  
  const getClientInfo = (): ClientInfo => {
    // In a real app, this would come from job data
    return {
      name: "Client Name",
      address: "123 Client St",
      phone: "(555) 555-5555",
      email: "client@example.com"
    };
  };
  
  const getCompanyInfo = (): CompanyInfo => {
    // In a real app, this would come from company settings
    return {
      name: "Your Company",
      logo: "",
      address: "456 Company Ave",
      phone: "(555) 123-4567",
      email: "company@example.com",
      legalText: "Standard terms and conditions apply."
    };
  };

  return {
    estimates,
    isLoading,
    dialogs: {
      isUpsellDialogOpen,
      setIsUpsellDialogOpen,
      isEstimateBuilderOpen,
      setIsEstimateBuilderOpen,
      isEstimateDialogOpen,
      setIsEstimateDialogOpen,
      isConvertToInvoiceDialogOpen,
      setIsConvertToInvoiceDialogOpen,
      isDeleteConfirmOpen, 
      setIsDeleteConfirmOpen,
      isWarrantyDialogOpen,
      setIsWarrantyDialogOpen
    },
    state: {
      selectedEstimateId,
      recommendedProduct,
      techniciansNote,
      selectedEstimate,
      isDeleting,
    },
    handlers: {
      handleCreateEstimate,
      handleEditEstimate,
      handleViewEstimate,
      handleSendEstimate,
      handleUpsellAccept,
      handleConvertToInvoice,
      confirmConvertToInvoice,
      handleDeleteEstimate,
      confirmDeleteEstimate,
      handleSyncToInvoice,
      handleAddWarranty,
      handleWarrantySelection,
      handleEstimateCreated
    },
    info: {
      getClientInfo,
      getCompanyInfo
    }
  };
};
