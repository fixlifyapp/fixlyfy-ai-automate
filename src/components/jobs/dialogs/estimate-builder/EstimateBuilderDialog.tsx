import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

  // Wrap the original handleEditLineItem to return a boolean
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
  return <Dialog open={open} onOpenChange={onOpenChange}>
      
      
      <WarrantySelectionDialog open={isWarrantyDialogOpen} onOpenChange={setIsWarrantyDialogOpen} onConfirm={handleWarrantyConfirmed} />

      <ProductEditDialog open={isProductEditDialogOpen} onOpenChange={setIsProductEditDialogOpen} product={selectedProduct} onSave={handleProductSaved} categories={["Custom"]} />
      
      <ProductSearch open={isProductSearchOpen} onOpenChange={setIsProductSearchOpen} onProductSelect={handleProductSelected} />
    </Dialog>;
};