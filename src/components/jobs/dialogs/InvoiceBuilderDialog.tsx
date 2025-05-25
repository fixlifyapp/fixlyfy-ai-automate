
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useInvoiceBuilder } from "../hooks/useInvoiceBuilder";
import { InvoiceForm } from "../forms/invoice/InvoiceForm";
import { InvoicePreview } from "../forms/invoice/InvoicePreview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductSearch } from "@/components/jobs/builder/ProductSearch";
import { CustomLineItemDialog } from "./estimate-builder/CustomLineItemDialog";
import { Product, LineItem } from "@/components/jobs/builder/types";
import { ProductEditInEstimateDialog } from "./ProductEditInEstimateDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { ArrowLeft, FileText, ListPlus, Send } from "lucide-react";
import { InvoiceSendDialog } from "./InvoiceSendDialog";
import { useJobs } from "@/hooks/useJobs";
import { toast } from "sonner";
import { Estimate } from "@/hooks/useEstimates";
import { Invoice } from "@/hooks/useInvoices";

interface InvoiceBuilderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  estimate?: Estimate;
  invoice?: Invoice;
  onInvoiceCreated?: (invoice: Invoice) => void;
}

export const InvoiceBuilderDialog = ({
  open,
  onOpenChange,
  jobId,
  estimate,
  invoice,
  onInvoiceCreated
}: InvoiceBuilderDialogProps) => {
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
  
  const invoiceBuilder = useInvoiceBuilder(jobId);
  
  // Initialize from estimate or invoice when dialog opens
  useEffect(() => {
    if (open) {
      if (estimate) {
        invoiceBuilder.initializeFromEstimate(estimate);
      } else if (invoice) {
        invoiceBuilder.initializeFromInvoice(invoice);
      } else {
        invoiceBuilder.resetForm();
      }
      setActiveTab("form");
    }
  }, [open, estimate, invoice]);
  
  const handleProductSelect = (product: Product) => {
    invoiceBuilder.handleAddProduct(product);
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
    
    const updatedLineItems = [...invoiceBuilder.lineItems, newLineItem];
    invoiceBuilder.setLineItems(updatedLineItems);
    setIsCustomLineItemDialogOpen(false);
  };

  const handleEditLineItem = (id: string) => {
    const lineItem = invoiceBuilder.lineItems.find(item => item.id === id);
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
    const updatedLineItems = invoiceBuilder.lineItems.map(item => {
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
    
    invoiceBuilder.setLineItems(updatedLineItems);
    setIsProductEditDialogOpen(false);
  };
  
  // Check if invoice has any line items
  const hasLineItems = invoiceBuilder.lineItems && invoiceBuilder.lineItems.length > 0;
  
  // Handle send invoice with validation
  const handleSendInvoice = async () => {
    if (!hasLineItems) {
      toast.error("Please add at least one item to the invoice before sending it to the client");
      return;
    }
    
    // Save invoice first if it's new
    if (!invoiceBuilder.formData.invoiceId) {
      const newInvoice = await invoiceBuilder.saveInvoiceChanges();
      if (newInvoice && onInvoiceCreated) {
        onInvoiceCreated(newInvoice);
      }
    }
    
    setIsSendDialogOpen(true);
  };

  // Wrapper function to match the expected signature for InvoiceForm
  const handleUpdateLineItemWrapper = (id: string, field: string, value: any) => {
    const updates: Partial<LineItem> = { [field]: value };
    invoiceBuilder.handleUpdateLineItem(id, updates);
  };

  // Wrapper function to save invoice and add warranty
  const handleSaveInvoiceWrapper = async (): Promise<boolean> => {
    const result = await invoiceBuilder.saveInvoiceChanges();
    if (result && onInvoiceCreated) {
      onInvoiceCreated(result);
    }
    return result !== null;
  };

  const handleAddWarranty = (warranty: Product | null, note: string) => {
    if (warranty) {
      // Add warranty to the line items
      const warrantyLineItem: LineItem = {
        id: `warranty-${Date.now()}`,
        description: `${warranty.name}: ${warranty.description}`,
        name: warranty.name,
        quantity: 1,
        unitPrice: warranty.price,
        price: warranty.price,
        ourPrice: warranty.ourPrice || 0,
        taxable: false,
        discount: 0,
        total: warranty.price
      };
      
      const updatedLineItems = [...invoiceBuilder.lineItems, warrantyLineItem];
      invoiceBuilder.setLineItems(updatedLineItems);
      
      // Update notes with warranty recommendation
      const currentNotes = invoiceBuilder.notes || "";
      const warrantyNote = note ? `\n\nWarranty Recommendation: ${note}` : "";
      invoiceBuilder.setNotes(currentNotes + warrantyNote);
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
              {invoice ? `Edit Invoice ${invoiceBuilder.invoiceNumber}` : 'Create New Invoice'}
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
                <InvoiceForm
                  invoiceNumber={invoiceBuilder.invoiceNumber}
                  lineItems={invoiceBuilder.lineItems || []}
                  onRemoveLineItem={invoiceBuilder.handleRemoveLineItem}
                  onUpdateLineItem={handleUpdateLineItemWrapper}
                  onEditLineItem={handleEditLineItem}
                  onAddEmptyLineItem={() => setIsProductSearchOpen(true)}
                  onAddCustomLine={() => setIsCustomLineItemDialogOpen(true)}
                  taxRate={invoiceBuilder.taxRate}
                  setTaxRate={invoiceBuilder.setTaxRate}
                  calculateSubtotal={invoiceBuilder.calculateSubtotal}
                  calculateTotalTax={invoiceBuilder.calculateTotalTax}
                  calculateGrandTotal={invoiceBuilder.calculateGrandTotal}
                  calculateTotalMargin={invoiceBuilder.calculateTotalMargin}
                  calculateMarginPercentage={invoiceBuilder.calculateMarginPercentage}
                  showMargin={false}
                />
              )}
              
              {activeTab === "preview" && (
                <InvoicePreview 
                  invoiceNumber={invoiceBuilder.invoiceNumber}
                  lineItems={invoiceBuilder.lineItems || []}
                  taxRate={invoiceBuilder.taxRate}
                  calculateSubtotal={invoiceBuilder.calculateSubtotal}
                  calculateTotalTax={invoiceBuilder.calculateTotalTax}
                  calculateGrandTotal={invoiceBuilder.calculateGrandTotal}
                  notes={invoiceBuilder.notes || ""}
                  clientInfo={jobData?.client}
                  issueDate={invoiceBuilder.issueDate}
                  dueDate={invoiceBuilder.dueDate}
                />
              )}
            </div>
            
            <div className="p-4 border-t bg-muted/20 flex justify-end space-x-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSendInvoice}
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
      
      {/* Invoice Send Dialog */}
      <InvoiceSendDialog
        open={isSendDialogOpen}
        onOpenChange={setIsSendDialogOpen}
        onSave={handleSaveInvoiceWrapper}
        onAddWarranty={handleAddWarranty}
        clientInfo={jobData?.client}
        invoiceNumber={invoiceBuilder.invoiceNumber}
        jobId={jobId}
      />
    </Dialog>
  );
};
