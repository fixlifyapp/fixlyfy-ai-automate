
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Send, Save } from "lucide-react";
import { toast } from "sonner";
import { WarrantySelectionDialog } from "../WarrantySelectionDialog";
import { ProductEditDialog } from "../ProductEditDialog";
import { ProductSearch } from "@/components/jobs/builder/ProductSearch";
import { Product } from "@/components/jobs/builder/types";
import { EstimateEditor } from "./EstimateEditor";
import { EstimatePreview } from "./EstimatePreview";
import { useEstimateBuilder } from "./hooks/useEstimateBuilder";

interface EstimateBuilderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estimateId: string | null;
  jobId: string;
  onSyncToInvoice?: (estimate: any) => void;
}

export const EstimateBuilderDialog = ({
  open,
  onOpenChange,
  estimateId,
  jobId,
  onSyncToInvoice
}: EstimateBuilderDialogProps) => {
  const [activeTab, setActiveTab] = useState("editor");
  const [isWarrantyDialogOpen, setIsWarrantyDialogOpen] = useState(false);
  const [isProductEditDialogOpen, setIsProductEditDialogOpen] = useState(false);
  const [isProductSearchOpen, setIsProductSearchOpen] = useState(false);
  
  // Use the refactored hook for state management
  const {
    estimateNumber,
    lineItems,
    notes,
    selectedProduct,
    selectedLineItemId,
    recommendedWarranty,
    techniciansNote,
    taxRate,
    isLoading,
    setTechniciansNote,
    setRecommendedWarranty,
    handleAddProduct,
    handleRemoveLineItem,
    handleUpdateLineItem,
    handleEditLineItem: originalHandleEditLineItem,
    handleAddEmptyLineItem: openProductSearch,
    handleAddCustomLine,
    calculateSubtotal,
    calculateTotalTax,
    calculateGrandTotal,
    calculateTotalMargin,
    calculateMarginPercentage,
    handleProductSaved,
    handleProductSelected,
    handleSyncToInvoice,
    saveEstimateChanges
  } = useEstimateBuilder({
    estimateId, 
    open, 
    onSyncToInvoice, 
    jobId
  });
  
  // Wrap the original handleEditLineItem to adapt the return type
  const handleEditLineItem = (id: string): boolean => {
    originalHandleEditLineItem(id);
    return true; // Return boolean as required by the interface
  };

  // Log the state to help with debugging
  useEffect(() => {
    if (open) {
      console.log("EstimateBuilderDialog opened with ID:", estimateId);
      console.log("Current estimate items:", lineItems);
    }
  }, [open, estimateId, lineItems]);

  // Handle saving draft
  const handleSaveDraft = async () => {
    if (estimateId) {
      // If we're editing an existing estimate, save changes
      const result = await saveEstimateChanges();
      if (result) {
        toast.success(`Estimate ${estimateNumber} updated`);
        onOpenChange(false);
      }
    } else {
      // In a real app, this would save a new estimate
      toast.success(`Estimate ${estimateNumber} saved as draft`);
      onOpenChange(false);
    }
  };

  // Handle send estimate
  const handleSendEstimate = () => {
    // Validate estimate before sending
    if (lineItems.length === 0) {
      toast.error("Please add at least one item to the estimate");
      return;
    }
    
    setIsWarrantyDialogOpen(true);
  };

  // Handle warranty confirmation
  const handleWarrantyConfirmed = async (selectedWarranty: Product | null, note: string) => {
    setIsWarrantyDialogOpen(false);
    
    // If a warranty was selected, store it for the customer upsell
    if (selectedWarranty) {
      setRecommendedWarranty(selectedWarranty);
      setTechniciansNote(note);
    }
    
    // If editing, save changes first
    if (estimateId) {
      await saveEstimateChanges();
    }
    
    // In a real app, this would send the estimate to the API with warranty settings
    toast.success(`Estimate ${estimateNumber} sent to customer${selectedWarranty ? ' with warranty recommendation' : ''}`);
    onOpenChange(false);
  };

  // Check if estimate can be sent
  const canSendEstimate = lineItems.length > 0 && calculateGrandTotal() > 0;

  // Get the action text based on whether we're creating or editing
  const actionText = estimateId ? "Save Changes" : "Save Draft";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0">
        {/* Sticky Header */}
        <div className="bg-background sticky top-0 z-10 border-b p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <DialogHeader className="mb-0">
              <DialogTitle className="text-xl font-semibold">{estimateId ? "Edit Estimate" : "Create Estimate"}</DialogTitle>
            </DialogHeader>
            
            <Badge variant="outline" className="bg-fixlyfy-warning/10 text-fixlyfy-warning border-fixlyfy-warning/20">
              {isLoading ? "Loading..." : "Draft"}
            </Badge>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* Show loading indicator if data is still loading */}
        {isLoading && (
          <div className="flex items-center justify-center p-12">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fixlyfy mb-4"></div>
              <p className="text-fixlyfy-text-secondary">Loading estimate data...</p>
            </div>
          </div>
        )}
          
        {!isLoading && (
          <div className="px-6 pt-2 pb-6">
            <TabsContent value="editor" className="mt-2">
              <EstimateEditor 
                estimateNumber={estimateNumber}
                lineItems={lineItems}
                notes={notes}
                taxRate={taxRate}
                onNotesChange={(value) => handleUpdateLineItem(null, "notes", value)}
                onTaxRateChange={(value) => handleUpdateLineItem(null, "taxRate", value)}
                onAddProduct={handleAddProduct}
                onRemoveLineItem={handleRemoveLineItem}
                onUpdateLineItem={handleUpdateLineItem}
                onEditLineItem={handleEditLineItem}
                onAddEmptyLineItem={openProductSearch}
                onAddCustomLine={handleAddCustomLine}
                onSyncToInvoice={handleSyncToInvoice}
                calculateSubtotal={calculateSubtotal}
                calculateTotalTax={calculateTotalTax}
                calculateGrandTotal={calculateGrandTotal}
                calculateTotalMargin={calculateTotalMargin}
                calculateMarginPercentage={calculateMarginPercentage}
              />
            </TabsContent>
            
            <TabsContent value="preview" className="mt-2">
              <EstimatePreview 
                estimateNumber={estimateNumber} 
                lineItems={lineItems}
                notes={notes}
                taxRate={taxRate}
                calculateSubtotal={calculateSubtotal}
                calculateTotalTax={calculateTotalTax}
                calculateGrandTotal={calculateGrandTotal}
              />
            </TabsContent>
          </div>
        )}
        
        {/* Sticky Footer */}
        <DialogFooter className="sticky bottom-0 border-t bg-background px-6 py-4 mt-0">
          <div className="w-full flex flex-col sm:flex-row justify-between gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSaveDraft} className="gap-2">
                <Save size={16} />
                {actionText}
              </Button>
              <Button 
                onClick={handleSendEstimate} 
                className="gap-2 bg-indigo-600 hover:bg-indigo-700"
                disabled={!canSendEstimate}
              >
                <Send size={16} />
                Send to Customer
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
      
      <WarrantySelectionDialog
        open={isWarrantyDialogOpen}
        onOpenChange={setIsWarrantyDialogOpen}
        onConfirm={handleWarrantyConfirmed}
      />

      <ProductEditDialog
        open={isProductEditDialogOpen}
        onOpenChange={setIsProductEditDialogOpen}
        product={selectedProduct}
        onSave={handleProductSaved}
        categories={["Custom"]}
      />
      
      <ProductSearch
        open={isProductSearchOpen}
        onOpenChange={setIsProductSearchOpen}
        onProductSelect={handleProductSelected}
      />
    </Dialog>
  );
};
