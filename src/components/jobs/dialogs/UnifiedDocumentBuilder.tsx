
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductSearch } from "@/components/jobs/builder/ProductSearch";
import { CustomLineItemDialog } from "./estimate-builder/CustomLineItemDialog";
import { Product, LineItem } from "@/components/jobs/builder/types";
import { ProductEditInEstimateDialog } from "./ProductEditInEstimateDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { ArrowLeft, FileText, ListPlus, Send } from "lucide-react";
import { useJobs } from "@/hooks/useJobs";
import { toast } from "sonner";
import { Estimate } from "@/hooks/useEstimates";
import { Invoice } from "@/hooks/useInvoices";
import { UnifiedDocumentForm } from "./unified/UnifiedDocumentForm";
import { UnifiedDocumentPreview } from "./unified/UnifiedDocumentPreview";
import { EstimateSendDialog } from "./estimate-builder/EstimateSendDialog";
import { useUnifiedDocumentBuilder } from "./unified/useUnifiedDocumentBuilder";

export type DocumentType = "estimate" | "invoice";

interface UnifiedDocumentBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentType: DocumentType;
  existingDocument?: Estimate | Invoice;
  jobId: string;
  clientInfo?: {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
  } | null;
  onDocumentCreated?: (document: Estimate | Invoice) => void;
  onSyncToInvoice?: () => void;
}

export const UnifiedDocumentBuilder = ({
  open,
  onOpenChange,
  documentType,
  existingDocument,
  jobId,
  clientInfo,
  onDocumentCreated,
  onSyncToInvoice
}: UnifiedDocumentBuilderProps) => {
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
  
  const documentBuilder = useUnifiedDocumentBuilder({
    documentType,
    existingDocument,
    jobId,
    open,
    onSyncToInvoice
  });
  
  const handleProductSelect = (product: Product) => {
    documentBuilder.handleAddProduct(product);
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
    
    const updatedLineItems = [...documentBuilder.lineItems, newLineItem];
    documentBuilder.setLineItems(updatedLineItems);
    setIsCustomLineItemDialogOpen(false);
  };

  const handleEditLineItem = (id: string) => {
    const lineItem = documentBuilder.lineItems.find(item => item.id === id);
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
    const updatedLineItems = documentBuilder.lineItems.map(item => {
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
    
    documentBuilder.setLineItems(updatedLineItems);
    setIsProductEditDialogOpen(false);
  };
  
  // Check if document has any line items
  const hasLineItems = documentBuilder.lineItems && documentBuilder.lineItems.length > 0;
  
  // Handle send document with validation
  const handleSendDocument = () => {
    if (!hasLineItems) {
      toast.error(`Please add at least one item to the ${documentType} before sending it to the client`);
      return;
    }
    setIsSendDialogOpen(true);
  };

  // Handle save and send document
  const handleSaveAndSend = async () => {
    if (!hasLineItems) {
      toast.error(`Please add at least one item to the ${documentType} before saving`);
      return;
    }
    
    const result = await documentBuilder.saveDocumentChanges();
    if (result && onDocumentCreated) {
      onDocumentCreated(result);
    }
    
    if (result) {
      toast.success(`${documentType === 'estimate' ? 'Estimate' : 'Invoice'} saved successfully`);
      onOpenChange(false);
    }
  };
  
  // Handle adding a warranty product
  const handleAddWarranty = (warranty: Product | null, note: string) => {
    if (warranty) {
      documentBuilder.handleAddProduct({
        ...warranty,
        ourPrice: 0
      });
      
      if (note) {
        documentBuilder.setNotes(note);
      }
    }
  };

  // Wrapper function to match the expected signature for forms
  const handleUpdateLineItemWrapper = (id: string, field: string, value: any) => {
    const updates: Partial<LineItem> = { [field]: value };
    documentBuilder.handleUpdateLineItem(id, updates);
  };

  // Wrapper function for save that returns boolean for EstimateSendDialog
  const handleSaveDocumentWrapper = async (): Promise<boolean> => {
    const result = await documentBuilder.saveDocumentChanges();
    return result !== null;
  };

  const documentTitle = documentType === 'estimate' 
    ? (existingDocument ? `Edit Estimate ${documentBuilder.documentNumber}` : 'Create New Estimate')
    : (existingDocument ? `Edit Invoice ${documentBuilder.documentNumber}` : 'Create New Invoice');
  
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
              {documentTitle}
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
                <UnifiedDocumentForm
                  documentType={documentType}
                  documentNumber={documentBuilder.documentNumber}
                  lineItems={documentBuilder.lineItems || []}
                  onRemoveLineItem={documentBuilder.handleRemoveLineItem}
                  onUpdateLineItem={handleUpdateLineItemWrapper}
                  onEditLineItem={handleEditLineItem}
                  onAddEmptyLineItem={() => setIsProductSearchOpen(true)}
                  onAddCustomLine={() => setIsCustomLineItemDialogOpen(true)}
                  taxRate={documentBuilder.taxRate}
                  setTaxRate={documentBuilder.setTaxRate}
                  calculateSubtotal={documentBuilder.calculateSubtotal}
                  calculateTotalTax={documentBuilder.calculateTotalTax}
                  calculateGrandTotal={documentBuilder.calculateGrandTotal}
                  calculateTotalMargin={documentBuilder.calculateTotalMargin}
                  calculateMarginPercentage={documentBuilder.calculateMarginPercentage}
                  notes={documentBuilder.notes || ""}
                  setNotes={documentBuilder.setNotes}
                  showMargin={documentType === 'estimate'}
                />
              )}
              
              {activeTab === "preview" && (
                <UnifiedDocumentPreview 
                  documentType={documentType}
                  documentNumber={documentBuilder.documentNumber}
                  lineItems={documentBuilder.lineItems || []}
                  taxRate={documentBuilder.taxRate}
                  calculateSubtotal={documentBuilder.calculateSubtotal}
                  calculateTotalTax={documentBuilder.calculateTotalTax}
                  calculateGrandTotal={documentBuilder.calculateGrandTotal}
                  notes={documentBuilder.notes || ""}
                  clientInfo={clientInfo || jobData?.client}
                  issueDate={new Date().toLocaleDateString()}
                  dueDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                />
              )}
            </div>
            
            <div className="p-4 border-t bg-muted/20 flex justify-end space-x-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={documentType === 'estimate' ? handleSendDocument : handleSaveAndSend}
                className="flex items-center gap-1"
                disabled={!hasLineItems || documentBuilder.isSubmitting}
              >
                <Send size={16} />
                {documentBuilder.isSubmitting 
                  ? 'Saving...' 
                  : documentType === 'estimate' 
                    ? 'Send to Client' 
                    : 'Save & Send'
                }
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
      
      {/* Send Dialog with Warranty Selection (for estimates) */}
      {documentType === 'estimate' && (
        <EstimateSendDialog
          open={isSendDialogOpen}
          onOpenChange={setIsSendDialogOpen}
          onSave={handleSaveDocumentWrapper}
          onAddWarranty={handleAddWarranty}
          clientInfo={clientInfo || jobData?.client}
          estimateNumber={documentBuilder.documentNumber}
          jobId={jobId}
        />
      )}
    </Dialog>
  );
};
