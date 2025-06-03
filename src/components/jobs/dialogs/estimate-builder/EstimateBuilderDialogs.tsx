import React, { useState } from "react";
import { ProductSearch } from "@/components/jobs/builder/ProductSearch";
import { CustomLineItemDialog } from "./CustomLineItemDialog";
import { ProductEditInEstimateDialog } from "../../dialogs/ProductEditInEstimateDialog";
import { EstimateSendDialog } from "./EstimateSendDialog";
import { useEstimateBuilderContext } from "./EstimateBuilderProvider";
import { toast } from "sonner";

interface EstimateBuilderDialogsProps {
  clientInfo?: {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
  } | null;
  jobId: string;
}

export const EstimateBuilderDialogs = ({ clientInfo, jobId }: EstimateBuilderDialogsProps) => {
  const [isProductSearchOpen, setIsProductSearchOpen] = useState(false);
  const [isCustomLineItemDialogOpen, setIsCustomLineItemDialogOpen] = useState(false);
  const [isProductEditDialogOpen, setIsProductEditDialogOpen] = useState(false);
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);

  const {
    estimateBuilder,
    jobData,
    selectedProduct,
    setSelectedProduct,
    handleProductSelect,
    handleCustomLineItemSave,
    handleEditLineItem,
    handleProductUpdate,
    handleAddWarranty,
    handleSaveEstimateWrapper,
    hasLineItems
  } = useEstimateBuilderContext();

  const openProductSearch = () => setIsProductSearchOpen(true);
  const openCustomLineItemDialog = () => setIsCustomLineItemDialogOpen(true);

  const handleEditLineItemClick = (id: string) => {
    const success = handleEditLineItem(id);
    if (success) {
      setIsProductEditDialogOpen(true);
    }
  };

  const handleProductSelectAndClose = (product: any) => {
    handleProductSelect(product);
    setIsProductSearchOpen(false);
  };

  const handleCustomLineItemSaveAndClose = (item: any) => {
    handleCustomLineItemSave(item);
    setIsCustomLineItemDialogOpen(false);
  };

  const handleProductUpdateAndClose = (updatedProduct: any) => {
    handleProductUpdate(updatedProduct);
    setIsProductEditDialogOpen(false);
  };

  const handleSendEstimate = () => {
    if (!hasLineItems) {
      toast.error("Please add at least one item to the estimate before sending it to the client");
      return;
    }
    setIsSendDialogOpen(true);
  };

  return (
    <>
      {/* Product Search Dialog */}
      <ProductSearch
        open={isProductSearchOpen}
        onOpenChange={setIsProductSearchOpen}
        onProductSelect={handleProductSelectAndClose}
      />
      
      {/* Custom Line Item Dialog */}
      <CustomLineItemDialog
        open={isCustomLineItemDialogOpen}
        onOpenChange={setIsCustomLineItemDialogOpen}
        onSave={handleCustomLineItemSaveAndClose}
      />

      {/* Product Edit Dialog */}
      <ProductEditInEstimateDialog
        open={isProductEditDialogOpen}
        onOpenChange={setIsProductEditDialogOpen}
        product={selectedProduct}
        onSave={handleProductUpdateAndClose}
      />
      
      {/* Estimate Send Dialog with Warranty Selection */}
      <EstimateSendDialog
        open={isSendDialogOpen}
        onOpenChange={setIsSendDialogOpen}
        onSave={handleSaveEstimateWrapper}
        onAddWarranty={handleAddWarranty}
        clientInfo={clientInfo || jobData?.client}
        estimateNumber={estimateBuilder.estimateDetails.estimate_number}
        jobId={jobId}
      />

      {/* Export functions for parent component to use */}
      <div style={{ display: 'none' }}>
        {React.createElement('div', {
          ref: (el: any) => {
            if (el) {
              (el as any).openProductSearch = openProductSearch;
              (el as any).openCustomLineItemDialog = openCustomLineItemDialog;
              (el as any).handleEditLineItem = handleEditLineItemClick;
              (el as any).handleSendEstimate = handleSendEstimate;
            }
          }
        })}
      </div>
    </>
  );
};
