
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ProductForm } from "@/components/jobs/builder/ProductForm";
import { ProductsList } from "@/components/jobs/builder/ProductsList";
import { LineItems } from "@/components/jobs/builder/LineItems";
import { useProducts } from "@/hooks/useProducts";
import { useEstimateBuilder } from "./hooks/useEstimateBuilder";
import { EstimateSummary } from "@/components/jobs/builder/EstimateSummary";
import { EstimateSendDialog } from "./EstimateSendDialog";
import { useEstimateInfo } from "@/components/jobs/estimates/hooks/useEstimateInfo";

interface EstimateBuilderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estimateId: string | null;
  jobId: string;
  onSyncToInvoice?: (estimate?: any) => void;
}

export const EstimateBuilderDialog = ({
  open,
  onOpenChange,
  estimateId,
  jobId,
  onSyncToInvoice
}: EstimateBuilderDialogProps) => {
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("products");
  const { products, isLoading: isProductsLoading } = useProducts();
  const { clientInfo, companyInfo, jobInfo } = useEstimateInfo(jobId);
  
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
    setLineItems,
    handleAddProduct,
    handleRemoveLineItem,
    handleUpdateLineItem,
    handleEditLineItem,
    calculateSubtotal,
    calculateTotalTax,
    calculateGrandTotal,
    calculateTotalMargin,
    calculateMarginPercentage,
    handleSyncToInvoice,
    saveEstimateChanges,
    setNotes,
    setTaxRate
  } = useEstimateBuilder({ estimateId, open, onSyncToInvoice, jobId });

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Estimate Builder - {estimateNumber}</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="products" className="space-y-4">
            <TabsList>
              <TabsTrigger value="products" onClick={() => setActiveTab("products")}>Products</TabsTrigger>
              <TabsTrigger value="line-items" onClick={() => setActiveTab("line-items")}>Line Items</TabsTrigger>
              <TabsTrigger value="summary" onClick={() => setActiveTab("summary")}>Summary</TabsTrigger>
            </TabsList>
            
            <div className="flex h-full">
              <div className="w-1/2 pr-4">
                <TabsContent value="products" className="outline-none">
                  <ProductForm 
                    selectedProduct={selectedProduct} 
                    onAddProduct={handleAddProduct} 
                    isLoading={isProductsLoading}
                  />
                  <ProductsList 
                    products={products} 
                    onProductSelect={handleAddProduct} 
                    isLoading={isProductsLoading}
                  />
                </TabsContent>
                
                <TabsContent value="line-items" className="outline-none">
                  <LineItems
                    lineItems={lineItems}
                    onRemove={handleRemoveLineItem}
                    onUpdate={handleUpdateLineItem}
                    onEdit={handleEditLineItem}
                  />
                </TabsContent>
              </div>

              <div className="w-1/2 pl-4">
                <TabsContent value="summary" className="outline-none">
                  <EstimateSummary
                    estimateNumber={estimateNumber}
                    lineItems={lineItems}
                    notes={notes}
                    taxRate={taxRate}
                    onNotesChange={setNotes}
                    onTaxRateChange={setTaxRate}
                    subtotal={calculateSubtotal()}
                    totalTax={calculateTotalTax()}
                    grandTotal={calculateGrandTotal()}
                    totalMargin={calculateTotalMargin()}
                    marginPercentage={calculateMarginPercentage()}
                    companyInfo={companyInfo}
                    clientInfo={clientInfo}
                    jobInfo={jobInfo}
                  />
                </TabsContent>
              </div>
            </div>
          </Tabs>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => setIsSendDialogOpen(true)} 
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Send Estimate"}
            </Button>
            {estimateId && (
              <Button variant="secondary" onClick={handleSyncToInvoice}>
                Sync to Invoice
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <EstimateSendDialog
        open={isSendDialogOpen}
        onOpenChange={setIsSendDialogOpen}
        onSave={saveEstimateChanges}
        onAddWarranty={(warranty, note) => {
          if (warranty) {
            setRecommendedWarranty(warranty);
            setTechniciansNote(note);
          }
        }}
        clientInfo={clientInfo}
        estimateNumber={estimateNumber}
        estimateId={estimateId}
        estimateTotal={calculateGrandTotal()}
      />
    </>
  );
};
