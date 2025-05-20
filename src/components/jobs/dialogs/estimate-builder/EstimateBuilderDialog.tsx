
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useEstimateBuilder } from "./hooks/useEstimateBuilder";
import { EstimateForm } from "./EstimateForm";
import { EstimatePreview } from "./EstimatePreview";
import { EstimateSyncOptions } from "./EstimateSyncOptions";
import { EstimateUpsellOptions } from "./EstimateUpsellOptions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductSearch } from "@/components/jobs/builder/ProductSearch";
import { CustomLineItemDialog } from "./CustomLineItemDialog";
import { Product, LineItem } from "@/components/jobs/builder/types";

interface EstimateBuilderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estimateId?: string;
  jobId: string;
  onSyncToInvoice?: () => void;
}

export const EstimateBuilderDialog = ({
  open,
  onOpenChange,
  estimateId,
  jobId,
  onSyncToInvoice
}: EstimateBuilderDialogProps) => {
  const [activeTab, setActiveTab] = useState("form");
  const [isProductSearchOpen, setIsProductSearchOpen] = useState(false);
  const [isCustomLineItemDialogOpen, setIsCustomLineItemDialogOpen] = useState(false);
  
  const estimateBuilder = useEstimateBuilder({
    estimateId: estimateId || null,
    open,
    onSyncToInvoice,
    jobId
  });
  
  const handleProductSelect = (product: Product) => {
    estimateBuilder.handleAddProduct(product);
    if (!estimateId) {
      // If it's a new estimate, select first product and proceed to editing
      setIsProductSearchOpen(false);
    }
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
    
    // Update lineItems by using the state update function from useEstimateBuilder
    const updatedLineItems = [...estimateBuilder.lineItems, newLineItem];
    estimateBuilder.setLineItems(updatedLineItems);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{estimateId ? `Edit Estimate ${estimateBuilder.estimateNumber}` : 'Create New Estimate'}</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="w-full bg-background">
            <TabsTrigger value="form" className="flex-1">Form</TabsTrigger>
            <TabsTrigger value="preview" className="flex-1">Preview</TabsTrigger>
            <TabsTrigger value="options" className="flex-1">Options</TabsTrigger>
          </TabsList>
          
          <TabsContent value="form" className="py-4">
            <EstimateForm
              estimateNumber={estimateBuilder.estimateNumber}
              lineItems={estimateBuilder.lineItems || []}
              onRemoveLineItem={estimateBuilder.handleRemoveLineItem}
              onUpdateLineItem={estimateBuilder.handleUpdateLineItem}
              onEditLineItem={estimateBuilder.handleEditLineItem}
              onAddEmptyLineItem={() => setIsProductSearchOpen(true)}
              onAddCustomLine={() => setIsCustomLineItemDialogOpen(true)}
              taxRate={estimateBuilder.taxRate}
              setTaxRate={estimateBuilder.setTaxRate}
              calculateSubtotal={estimateBuilder.calculateSubtotal}
              calculateTotalTax={estimateBuilder.calculateTotalTax}
              calculateGrandTotal={estimateBuilder.calculateGrandTotal}
              calculateTotalMargin={estimateBuilder.calculateTotalMargin}
              calculateMarginPercentage={estimateBuilder.calculateMarginPercentage}
              showMargin={true}
            />
          </TabsContent>
          
          <TabsContent value="preview" className="py-4">
            <EstimatePreview 
              estimateNumber={estimateBuilder.estimateNumber}
              lineItems={estimateBuilder.lineItems || []}
              taxRate={estimateBuilder.taxRate}
              calculateSubtotal={estimateBuilder.calculateSubtotal}
              calculateTotalTax={estimateBuilder.calculateTotalTax}
              calculateGrandTotal={estimateBuilder.calculateGrandTotal}
              notes={estimateBuilder.notes || ""}
            />
          </TabsContent>
          
          <TabsContent value="options" className="py-4">
            <div className="space-y-8">
              <EstimateUpsellOptions
                warranty={estimateBuilder.recommendedWarranty}
                techniciansNote={estimateBuilder.techniciansNote}
                onWarrantyChange={estimateBuilder.setRecommendedWarranty}
                onNotesChange={estimateBuilder.setTechniciansNote}
              />
              
              <EstimateSyncOptions
                onSyncToInvoice={estimateBuilder.handleSyncToInvoice}
              />
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={estimateBuilder.saveEstimateChanges}>
            Save Estimate
          </Button>
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
    </Dialog>
  );
};
