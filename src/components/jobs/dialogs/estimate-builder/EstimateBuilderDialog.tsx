
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { useEstimateBuilder } from "./hooks/useEstimateBuilder";
import { ProductSearch } from "@/components/jobs/builder/ProductSearch";
import { CustomLineItemDialog } from "./CustomLineItemDialog";
import { Product, LineItem } from "@/components/jobs/builder/types";
import { ProductEditInEstimateDialog } from "../../dialogs/ProductEditInEstimateDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { EstimateSendDialog } from "./EstimateSendDialog";
import { useJobs } from "@/hooks/useJobs";
import { toast } from "sonner";
import { EstimateBuilderHeader } from "./EstimateBuilderHeader";
import { EstimateBuilderTabs } from "./EstimateBuilderTabs";
import { EstimateBuilderContent } from "./EstimateBuilderContent";
import { EstimateBuilderActions } from "./EstimateBuilderActions";

interface EstimateBuilderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estimateId?: string;
  jobId: string;
  clientInfo?: {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
  } | null;
  onSyncToInvoice?: () => void;
}

export const EstimateBuilderDialog = ({
  open,
  onOpenChange,
  estimateId,
  jobId,
  clientInfo,
  onSyncToInvoice
}: EstimateBuilderDialogProps) => {
  const [activeTab, setActiveTab] = useState("form");
  const [isProductSearchOpen, setIsProductSearchOpen] = useState(false);
  const [isCustomLineItemDialogOpen, setIsCustomLineItemDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductEditDialogOpen, setIsProductEditDialogOpen] = useState(false);
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const isMobile = useIsMobile();
  
  // Fetch job data
  const { jobs, isLoading } = useJobs(jobId);
  const [jobData, setJobData] = useState<any>(null);
  
  // Get the job data when jobs are loaded
  useEffect(() => {
    if (!isLoading && jobs.length > 0) {
      const foundJob = jobs.find(job => job.id === jobId);
      if (foundJob) {
        setJobData(foundJob);
      }
    }
  }, [jobs, isLoading, jobId]);
  
  const estimateBuilder = useEstimateBuilder(jobId);
  
  const handleProductSelect = (product: Product) => {
    estimateBuilder.handleAddProduct(product);
    setIsProductSearchOpen(false);
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
    setIsCustomLineItemDialogOpen(false);
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
      setIsProductEditDialogOpen(true);
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
    setIsProductEditDialogOpen(false);
  };
  
  // Check if estimate has any line items
  const hasLineItems = estimateBuilder.lineItems && estimateBuilder.lineItems.length > 0;
  
  // Handle send estimate with validation
  const handleSendEstimate = () => {
    if (!hasLineItems) {
      toast.error("Please add at least one item to the estimate before sending it to the client");
      return;
    }
    setIsSendDialogOpen(true);
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
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl p-0 h-[90vh] overflow-hidden flex flex-col">
        <EstimateBuilderHeader
          estimateId={estimateId}
          estimateNumber={estimateBuilder.estimateNumber}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        
        <div className="flex flex-grow overflow-hidden">
          {!isMobile && (
            <EstimateBuilderTabs activeTab={activeTab} setActiveTab={setActiveTab} />
          )}
          
          <div className="flex-grow overflow-hidden flex flex-col">
            {isMobile && (
              <EstimateBuilderTabs activeTab={activeTab} setActiveTab={setActiveTab} />
            )}
            
            <EstimateBuilderContent
              activeTab={activeTab}
              estimateNumber={estimateBuilder.estimateNumber}
              lineItems={estimateBuilder.lineItems}
              onRemoveLineItem={estimateBuilder.handleRemoveLineItem}
              onUpdateLineItem={handleUpdateLineItemWrapper}
              onEditLineItem={handleEditLineItem}
              onAddEmptyLineItem={() => setIsProductSearchOpen(true)}
              onAddCustomLine={() => setIsCustomLineItemDialogOpen(true)}
              taxRate={estimateBuilder.taxRate}
              setTaxRate={estimateBuilder.setTaxRate}
              calculateSubtotal={estimateBuilder.calculateSubtotal}
              calculateTotalTax={estimateBuilder.calculateTotalTax}
              calculateGrandTotal={estimateBuilder.calculateGrandTotal}
              calculateTotalMargin={calculateTotalMargin}
              calculateMarginPercentage={calculateMarginPercentage}
              notes={estimateBuilder.notes || ""}
              clientInfo={clientInfo}
              jobData={jobData}
            />
            
            <EstimateBuilderActions
              hasLineItems={hasLineItems}
              onCancel={() => onOpenChange(false)}
              onSendEstimate={handleSendEstimate}
            />
          </div>
        </div>
      </DialogContent>
      
      {/* Product Search Dialog */}
      <ProductSearch
        open={isProductSearchOpen}
        onOpenChange={setIsProductSearchOpen}
        onProductSelect={handleProductSelect}
      />
      
      {/* Custom Line Item Dialog */}
      <CustomLineItemDialog
        open={isCustomLineItemDialogOpen}
        onOpenChange={setIsCustomLineItemDialogOpen}
        onSave={handleCustomLineItemSave}
      />

      {/* Product Edit Dialog */}
      <ProductEditInEstimateDialog
        open={isProductEditDialogOpen}
        onOpenChange={setIsProductEditDialogOpen}
        product={selectedProduct}
        onSave={handleProductUpdate}
      />
      
      {/* Estimate Send Dialog with Warranty Selection */}
      <EstimateSendDialog
        open={isSendDialogOpen}
        onOpenChange={setIsSendDialogOpen}
        onSave={handleSaveEstimateWrapper}
        onAddWarranty={handleAddWarranty}
        clientInfo={clientInfo || jobData?.client}
        estimateNumber={estimateBuilder.estimateNumber}
        jobId={jobId}
      />
    </Dialog>
  );
};
