
import React, { createContext, useContext, useState, useEffect } from "react";
import { useEstimateBuilder } from "./hooks/useEstimateBuilder";
import { useJobData } from "../unified/hooks/useJobData";
import { useEstimates } from "@/hooks/useEstimates";
import { Product, LineItem } from "@/components/jobs/builder/types";
import { toast } from "sonner";

interface EstimateBuilderContextType {
  estimateBuilder: ReturnType<typeof useEstimateBuilder>;
  jobData: any;
  clientInfo: any;
  jobAddress: string;
  isLoading: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  handleProductSelect: (product: Product) => void;
  handleCustomLineItemSave: (item: Partial<LineItem>) => void;
  handleEditLineItem: (id: string) => boolean;
  handleProductUpdate: (updatedProduct: Product) => void;
  handleAddWarranty: (warranty: Product | null, note: string) => void;
  handleUpdateLineItemWrapper: (id: string, field: string, value: any) => void;
  handleSaveEstimateWrapper: () => Promise<boolean>;
  calculateTotalMargin: () => number;
  calculateMarginPercentage: () => number;
  hasLineItems: boolean;
}

const EstimateBuilderContext = createContext<EstimateBuilderContextType | undefined>(undefined);

interface EstimateBuilderProviderProps {
  children: React.ReactNode;
  jobId: string;
  estimateId?: string;
  open: boolean;
}

export const EstimateBuilderProvider = ({ 
  children, 
  jobId, 
  estimateId, 
  open 
}: EstimateBuilderProviderProps) => {
  const [activeTab, setActiveTab] = useState("form");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  console.log('=== EstimateBuilderProvider Debug ===');
  console.log('JobId received in provider:', jobId);
  
  // Use the unified job data hook for consistent data fetching
  const { clientInfo, jobAddress, loading: jobDataLoading } = useJobData(jobId);
  
  console.log('Client info from useJobData:', clientInfo);
  console.log('Job address from useJobData:', jobAddress);
  console.log('Job data loading:', jobDataLoading);
  
  // Create a jobData object for compatibility
  const jobData = {
    id: jobId,
    client: clientInfo,
    address: jobAddress
  };
  
  // Fetch estimates data to get the estimate being edited
  const { estimates } = useEstimates(jobId);
  
  const estimateBuilder = useEstimateBuilder(jobId);
  
  // Initialize the estimate builder with existing estimate data when editing
  useEffect(() => {
    if (open && estimateId && estimates.length > 0) {
      const existingEstimate = estimates.find(est => est.id === estimateId);
      if (existingEstimate) {
        console.log("Loading existing estimate for editing:", existingEstimate);
        estimateBuilder.initializeFromEstimate(existingEstimate);
      }
    } else if (open && !estimateId) {
      // Reset form when creating new estimate
      estimateBuilder.resetForm();
    }
  }, [open, estimateId, estimates]);
  
  const handleProductSelect = (product: Product) => {
    estimateBuilder.handleAddProduct(product);
  };
  
  const handleCustomLineItemSave = (item: Partial<LineItem>) => {
    const newLineItem: LineItem = {
      id: `item-${Date.now()}`,
      description: item.description || item.name || "Custom Item",
      quantity: item.quantity || 1,
      unitPrice: item.unitPrice || 0,
      taxable: item.taxable !== undefined ? item.taxable : true,
      discount: item.discount || 0,
      ourPrice: item.ourPrice || 0,
      name: item.name || "Custom Item",
      price: item.unitPrice || 0,
      total: (item.quantity || 1) * (item.unitPrice || 0)
    };
    
    const updatedLineItems = [...estimateBuilder.lineItems, newLineItem];
    estimateBuilder.setLineItems(updatedLineItems);
  };

  const handleEditLineItem = (id: string) => {
    const lineItem = estimateBuilder.lineItems.find(item => item.id === id);
    if (lineItem) {
      const productToEdit: Product = {
        id: lineItem.id,
        name: lineItem.name || lineItem.description,
        description: lineItem.description,
        category: "",
        price: lineItem.unitPrice,
        ourPrice: lineItem.ourPrice || 0,
        cost: lineItem.ourPrice || 0,
        taxable: lineItem.taxable,
        tags: [],
        quantity: lineItem.quantity
      };
      setSelectedProduct(productToEdit);
      return true;
    }
    return false;
  };

  const handleProductUpdate = (updatedProduct: Product) => {
    const updatedLineItems = estimateBuilder.lineItems.map(item => {
      if (item.id === updatedProduct.id) {
        return {
          ...item,
          name: updatedProduct.name,
          description: updatedProduct.description || updatedProduct.name,
          unitPrice: updatedProduct.price,
          price: updatedProduct.price,
          ourPrice: updatedProduct.ourPrice || 0,
          taxable: updatedProduct.taxable,
          quantity: updatedProduct.quantity || item.quantity,
          total: (updatedProduct.quantity || item.quantity) * updatedProduct.price
        };
      }
      return item;
    });
    
    estimateBuilder.setLineItems(updatedLineItems);
  };
  
  // Handle adding a warranty product
  const handleAddWarranty = (warranty: Product | null, note: string) => {
    if (warranty) {
      estimateBuilder.handleAddProduct({
        ...warranty,
        ourPrice: 0
      });
      
      if (note) {
        estimateBuilder.setNotes(note);
      }
    }
  };

  // Wrapper function to match the expected signature for EstimateForm
  const handleUpdateLineItemWrapper = (id: string, field: string, value: any) => {
    const updates: Partial<LineItem> = { [field]: value };
    estimateBuilder.handleUpdateLineItem(id, updates);
  };

  // Wrapper function to match the expected signature for EstimateSendDialog
  const handleSaveEstimateWrapper = async (): Promise<boolean> => {
    const result = await estimateBuilder.saveEstimateChanges();
    return result !== null;
  };

  // Placeholder functions for missing methods
  const calculateTotalMargin = () => {
    return estimateBuilder.lineItems.reduce((total, item) => {
      const margin = (item.unitPrice - (item.ourPrice || 0)) * item.quantity;
      return total + margin;
    }, 0);
  };

  const calculateMarginPercentage = () => {
    const subtotal = estimateBuilder.calculateSubtotal();
    const margin = calculateTotalMargin();
    return subtotal > 0 ? (margin / subtotal) * 100 : 0;
  };
  
  // Check if estimate has any line items
  const hasLineItems = estimateBuilder.lineItems && estimateBuilder.lineItems.length > 0;

  const value = {
    estimateBuilder,
    jobData,
    clientInfo,
    jobAddress,
    isLoading: jobDataLoading,
    activeTab,
    setActiveTab,
    selectedProduct,
    setSelectedProduct,
    handleProductSelect,
    handleCustomLineItemSave,
    handleEditLineItem,
    handleProductUpdate,
    handleAddWarranty,
    handleUpdateLineItemWrapper,
    handleSaveEstimateWrapper,
    calculateTotalMargin,
    calculateMarginPercentage,
    hasLineItems
  };

  return (
    <EstimateBuilderContext.Provider value={value}>
      {children}
    </EstimateBuilderContext.Provider>
  );
};

export const useEstimateBuilderContext = () => {
  const context = useContext(EstimateBuilderContext);
  if (context === undefined) {
    throw new Error('useEstimateBuilderContext must be used within an EstimateBuilderProvider');
  }
  return context;
};
