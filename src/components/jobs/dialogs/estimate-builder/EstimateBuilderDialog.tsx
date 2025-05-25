import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useEstimateBuilder } from "./hooks/useEstimateBuilder";
import { EstimateForm } from "./EstimateForm";
import { EstimatePreview } from "./EstimatePreview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductSearch } from "@/components/jobs/builder/ProductSearch";
import { CustomLineItemDialog } from "./CustomLineItemDialog";
import { Product, LineItem } from "@/components/jobs/builder/types";
import { ProductEditInEstimateDialog } from "../../dialogs/ProductEditInEstimateDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { ArrowLeft, FileText, ListPlus, Send } from "lucide-react";
import { useEstimates } from "@/hooks/useEstimates";
import { EstimateSendDialog } from "./EstimateSendDialog";
import { useJobs } from "@/hooks/useJobs";
import { toast } from "sonner";

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
  // Find the specific job we're interested in
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
  
  const estimateBuilder = useEstimateBuilder({
    estimateId: estimateId || null,
    open,
    onSyncToInvoice,
    jobId
  });
  
  // Set tax rate to 13% fixed
  if (estimateBuilder.taxRate !== 13) {
    estimateBuilder.setTaxRate(13);
  }
  
  const handleProductSelect = (product: Product) => {
    estimateBuilder.handleAddProduct(product);
    if (!estimateId) {
      // If it's a new estimate, select first product and proceed to editing
      setIsProductSearchOpen(false);
    }
  };
  
  const handleCustomLineItemSave = (item: Partial<LineItem>) => {
    // ... keep existing code (creating a new line item and adding it to the estimate)
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
    
    // Update lineItems by using the state update function from useEstimateBuilder
    const updatedLineItems = [...estimateBuilder.lineItems, newLineItem];
    estimateBuilder.setLineItems(updatedLineItems);
    setIsCustomLineItemDialogOpen(false);
  };

  const handleEditLineItem = (id: string) => {
    // ... keep existing code (finding and editing a line item)
    const lineItem = estimateBuilder.lineItems.find(item => item.id === id);
    if (lineItem) {
      // Create a product object from the line item to edit
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
    // ... keep existing code (updating a product in line items)
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
        ourPrice: 0 // Reset ourPrice for warranty in customer estimate
      });
      
      if (note) {
        estimateBuilder.setNotes(note);
      }
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl p-0 h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="p-6 border-b bg-muted/20">
          <div className="flex items-center gap-2">
            {isMobile && activeTab !== "form" && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setActiveTab("form")} 
                className="mr-1"
              >
                <ArrowLeft size={18} />
              </Button>
            )}
            <DialogTitle className="text-xl">
              {estimateId ? `Edit Estimate ${estimateBuilder.estimateNumber}` : 'Create New Estimate'}
            </DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="flex flex-grow overflow-hidden">
          {!isMobile && (
            <div className="w-20 bg-muted/10 border-r flex flex-col items-center pt-8 gap-8">
              <button 
                onClick={() => setActiveTab("form")}
                className={`p-3 rounded-lg flex flex-col items-center gap-1 text-xs transition-colors ${activeTab === "form" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/70"}`}
              >
                <ListPlus size={20} />
                <span>Form</span>
              </button>
              
              <button 
                onClick={() => setActiveTab("preview")}
                className={`p-3 rounded-lg flex flex-col items-center gap-1 text-xs transition-colors ${activeTab === "preview" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/70"}`}
              >
                <FileText size={20} />
                <span>Preview</span>
              </button>
            </div>
          )}
          
          <div className="flex-grow overflow-hidden flex flex-col">
            {isMobile && (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="border-b">
                <TabsList className="w-full bg-background">
                  <TabsTrigger value="form" className="flex-1">Form</TabsTrigger>
                  <TabsTrigger value="preview" className="flex-1">Preview</TabsTrigger>
                </TabsList>
              </Tabs>
            )}
            
            <div className="flex-grow overflow-auto p-6">
              {activeTab === "form" && (
                <EstimateForm
                  estimateNumber={estimateBuilder.estimateNumber}
                  lineItems={estimateBuilder.lineItems || []}
                  onRemoveLineItem={estimateBuilder.handleRemoveLineItem}
                  onUpdateLineItem={estimateBuilder.handleUpdateLineItem}
                  onEditLineItem={handleEditLineItem}
                  onAddEmptyLineItem={() => setIsProductSearchOpen(true)}
                  onAddCustomLine={() => setIsCustomLineItemDialogOpen(true)}
                  taxRate={estimateBuilder.taxRate}
                  setTaxRate={estimateBuilder.setTaxRate}
                  calculateSubtotal={estimateBuilder.calculateSubtotal}
                  calculateTotalTax={estimateBuilder.calculateTotalTax}
                  calculateGrandTotal={estimateBuilder.calculateGrandTotal}
                  calculateTotalMargin={estimateBuilder.calculateTotalMargin}
                  calculateMarginPercentage={estimateBuilder.calculateMarginPercentage}
                  showMargin={false}
                />
              )}
              
              {activeTab === "preview" && (
                <EstimatePreview 
                  estimateNumber={estimateBuilder.estimateNumber}
                  lineItems={estimateBuilder.lineItems || []}
                  taxRate={estimateBuilder.taxRate}
                  calculateSubtotal={estimateBuilder.calculateSubtotal}
                  calculateTotalTax={estimateBuilder.calculateTotalTax}
                  calculateGrandTotal={estimateBuilder.calculateGrandTotal}
                  notes={estimateBuilder.notes || ""}
                  clientInfo={clientInfo || jobData?.client}
                />
              )}
            </div>
            
            <div className="p-4 border-t bg-muted/20 flex justify-end space-x-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSendEstimate}
                className="flex items-center gap-1"
              >
                <Send size={16} />
                Send to Client
              </Button>
            </div>
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
        onSave={estimateBuilder.saveEstimateChanges}
        onAddWarranty={handleAddWarranty}
        clientInfo={clientInfo || jobData?.client}
        estimateNumber={estimateBuilder.estimateNumber}
        jobId={jobId}
      />
    </Dialog>
  );
};
