
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { EstimateBuilderProvider, useEstimateBuilderContext } from "./EstimateBuilderProvider";
import { EstimateBuilderDialogs } from "./EstimateBuilderDialogs";
import { EstimateBuilderHeader } from "./EstimateBuilderHeader";
import { EstimateBuilderTabs } from "./EstimateBuilderTabs";
import { EstimateBuilderContent } from "./EstimateBuilderContent";
import { EstimateBuilderActions } from "./EstimateBuilderActions";
import { useEstimateBuilderActions } from "./hooks/useEstimateBuilderActions";
import { ProductSearch } from "@/components/jobs/builder/ProductSearch";
import { CustomLineItemDialog } from "./CustomLineItemDialog";
import { ProductEditInEstimateDialog } from "../../dialogs/ProductEditInEstimateDialog";
import { EstimateSendDialog } from "./EstimateSendDialog";
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

const EstimateBuilderDialogContent = ({
  onOpenChange,
  estimateId,
  clientInfo,
  jobId
}: Omit<EstimateBuilderDialogProps, 'open'>) => {
  const isMobile = useIsMobile();
  
  console.log('=== EstimateBuilderDialogContent Debug ===');
  console.log('JobId prop received in dialog:', jobId);
  console.log('ClientInfo prop received in dialog:', clientInfo);
  
  const {
    estimateBuilder,
    jobData,
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
  } = useEstimateBuilderContext();

  console.log('JobData from context:', jobData);
  console.log('JobData ID from context:', jobData?.id);

  const {
    isProductSearchOpen,
    setIsProductSearchOpen,
    isCustomLineItemDialogOpen,
    setIsCustomLineItemDialogOpen,
    isProductEditDialogOpen,
    setIsProductEditDialogOpen,
    isSendDialogOpen,
    setIsSendDialogOpen,
    openProductSearch,
    openCustomLineItemDialog,
    handleSendEstimate
  } = useEstimateBuilderActions(hasLineItems);

  const handleProductSelectAndClose = (product: any) => {
    handleProductSelect(product);
    setIsProductSearchOpen(false);
  };

  const handleCustomLineItemSaveAndClose = (item: any) => {
    handleCustomLineItemSave(item);
    setIsCustomLineItemDialogOpen(false);
  };

  const handleEditLineItemClick = (id: string) => {
    const success = handleEditLineItem(id);
    if (success) {
      setIsProductEditDialogOpen(true);
    }
    return success;
  };

  const handleProductUpdateAndClose = (updatedProduct: any) => {
    handleProductUpdate(updatedProduct);
    setIsProductEditDialogOpen(false);
  };

  return (
    <>
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
              onEditLineItem={handleEditLineItemClick}
              onAddEmptyLineItem={openProductSearch}
              onAddCustomLine={openCustomLineItemDialog}
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
        estimateNumber={estimateBuilder.estimateNumber}
        jobId={jobId}
      />
    </>
  );
};

export const EstimateBuilderDialog = (props: EstimateBuilderDialogProps) => {
  const { open, jobId, estimateId, ...restProps } = props;

  console.log('=== EstimateBuilderDialog Main Debug ===');
  console.log('JobId prop in main dialog:', jobId);

  return (
    <Dialog open={open} onOpenChange={props.onOpenChange}>
      <EstimateBuilderProvider jobId={jobId} estimateId={estimateId} open={open}>
        <EstimateBuilderDialogContent {...restProps} jobId={jobId} estimateId={estimateId} />
      </EstimateBuilderProvider>
    </Dialog>
  );
};
