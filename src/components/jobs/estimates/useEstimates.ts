
import { useState } from "react";
import { toast } from "sonner";
import { Product } from "../builder/types";

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
  // In a real app, this would be fetched from an API
  const [estimates, setEstimates] = useState<Estimate[]>([
    {
      id: "est-001",
      number: "EST-12345",
      date: "2023-05-15",
      amount: 475.99,
      status: "sent",
      viewed: true,
      items: [
        {
          id: "item-1",
          name: "Diagnostic Service",
          description: "Complete system diagnostics",
          price: 120,
          quantity: 1,
          taxable: true,
          category: "Services",
          tags: ["diagnostic", "service"]
        },
        {
          id: "item-2",
          name: "HVAC Annual Maintenance",
          description: "Yearly system tune-up and maintenance",
          price: 250,
          quantity: 1,
          taxable: true,
          category: "Maintenance",
          tags: ["hvac", "maintenance"]
        },
        {
          id: "item-3",
          name: "Air Filter Replacement",
          description: "Premium air filter with installation",
          price: 55,
          quantity: 1,
          taxable: true,
          category: "Products",
          tags: ["filter", "replacement"]
        }
      ],
      recommendedProduct: {
        id: "prod-4",
        name: "1-Year Warranty",
        description: "1-year extended warranty and priority service",
        price: 89,
        category: "Warranties",
        tags: ["warranty"],
      },
      techniciansNote: "Based on the age of your unit, this warranty would provide great value."
    },
    {
      id: "est-002",
      number: "EST-12346",
      date: "2023-05-10",
      amount: 299.50,
      status: "draft",
      viewed: false,
      items: [
        {
          id: "item-4",
          name: "Minor Repair",
          description: "Quick fix and adjustment",
          price: 150,
          quantity: 1,
          taxable: true,
          category: "Services",
          tags: ["repair", "quick"]
        },
        {
          id: "item-5",
          name: "Parts Replacement",
          description: "Standard component replacement",
          price: 115,
          quantity: 1,
          taxable: true,
          category: "Products",
          tags: ["parts", "replacement"]
        }
      ],
      recommendedProduct: null,
      techniciansNote: ""
    }
  ]);
  
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

  const handleCreateEstimate = () => {
    // Open the EstimateDialog
    setIsEstimateDialogOpen(true);
  };

  const handleEditEstimate = (estimateId: string) => {
    // Find the estimate to edit
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
      
      // Mark as viewed
      setEstimates(estimates.map(e => 
        e.id === estimate.id ? {...e, viewed: true} : e
      ));
    } else {
      // Just view the estimate
      handleEditEstimate(estimate.id);
    }
  };

  const handleSendEstimate = (estimateId: string) => {
    // In a real app, this would send the estimate via email or other notification
    setEstimates(estimates.map(e => 
      e.id === estimateId ? {...e, status: "sent"} : e
    ));
    toast.success("Estimate sent to customer");
  };

  const handleUpsellAccept = (product: Product) => {
    toast.success(`${product.name} added to the estimate`);
    // In a real app, this would update the estimate with the added product
  };
  
  const handleConvertToInvoice = (estimate: any) => {
    setSelectedEstimate(estimate);
    setIsConvertToInvoiceDialogOpen(true);
  };
  
  const confirmConvertToInvoice = () => {
    // In a real app, this would create a new invoice from the estimate
    if (!selectedEstimate) return;
    
    toast.success(`Estimate ${selectedEstimate.number} converted to invoice`);
    setIsConvertToInvoiceDialogOpen(false);
    
    // Remove the estimate from the list since it's now an invoice
    setEstimates(estimates.filter(est => est.id !== selectedEstimate.id));
    
    // Switch to the invoices tab if the callback is provided
    if (onEstimateConverted) {
      onEstimateConverted();
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
      // In a real app, this would be an actual API call
      // await fetch(`/api/estimates/${selectedEstimate.id}`, {
      //   method: 'DELETE',
      // });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
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
  
  const handleWarrantySelection = (selectedWarranty: Product | null, customNote: string) => {
    if (selectedWarranty && selectedEstimate) {
      // Add the warranty to the estimate
      const updatedEstimates = estimates.map(est => 
        est.id === selectedEstimate.id 
          ? {
              ...est,
              items: [
                ...est.items,
                {
                  id: `item-w-${Date.now()}`,
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
    }
    setIsWarrantyDialogOpen(false);
  };

  const handleEstimateCreated = (amount: number) => {
    // Generate a new estimate ID and number
    const newEstimateId = `est-${Math.floor(Math.random() * 10000)}`;
    const newEstimateNumber = `EST-${Math.floor(10000 + Math.random() * 90000)}`;
    
    // Create a new estimate
    const newEstimate = {
      id: newEstimateId,
      number: newEstimateNumber,
      date: new Date().toISOString().split('T')[0],
      amount: amount,
      status: "draft",
      viewed: false,
      items: [] as EstimateItem[],
      recommendedProduct: null,
      techniciansNote: ""
    };
    
    // Add the new estimate to the list
    setEstimates([newEstimate, ...estimates]);
    
    toast.success(`Estimate ${newEstimateNumber} created`);
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
