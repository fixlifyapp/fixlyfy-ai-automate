
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useEstimateBuilder } from "./hooks/useEstimateBuilder";
import { EstimateForm } from "./EstimateForm";
import { EstimatePreview } from "./EstimatePreview";
import { EstimateSyncOptions } from "./EstimateSyncOptions";
import { EstimateUpsellOptions } from "./EstimateUpsellOptions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  
  const estimateBuilder = useEstimateBuilder({
    estimateId: estimateId || null,
    open,
    onSyncToInvoice,
    jobId
  });
  
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
              onAddEmptyLineItem={estimateBuilder.handleAddEmptyLineItem}
              onAddCustomLine={estimateBuilder.handleAddCustomLine}
              taxRate={estimateBuilder.taxRate}
              setTaxRate={estimateBuilder.setTaxRate}
              calculateSubtotal={estimateBuilder.calculateSubtotal}
              calculateTotalTax={estimateBuilder.calculateTotalTax}
              calculateGrandTotal={estimateBuilder.calculateGrandTotal}
              calculateTotalMargin={estimateBuilder.calculateTotalMargin}
              calculateMarginPercentage={estimateBuilder.calculateMarginPercentage}
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
            />
          </TabsContent>
          
          <TabsContent value="options" className="py-4">
            <div className="space-y-8">
              <EstimateUpsellOptions
                recommendedWarranty={estimateBuilder.recommendedWarranty}
                techniciansNote={estimateBuilder.techniciansNote}
                setRecommendedWarranty={estimateBuilder.setRecommendedWarranty}
                setTechniciansNote={estimateBuilder.setTechniciansNote}
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
          <Button onClick={() => estimateBuilder.saveEstimateChanges()}>
            Save Estimate
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
