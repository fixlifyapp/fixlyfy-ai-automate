
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { LineItem, Product } from "../../builder/types";
import { ProductCatalog } from "../../builder/ProductCatalog";
import { DocumentTotalsSection } from "./components/DocumentTotalsSection";
import { DocumentLineItemsTable } from "./components/DocumentLineItemsTable";
import { NotesSection } from "./components/NotesSection";
import { useIsMobile } from "@/hooks/use-mobile";

interface UnifiedItemsStepProps {
  documentType: "estimate" | "invoice";
  documentNumber: string;
  lineItems: LineItem[];
  taxRate: number;
  notes: string;
  onLineItemsChange: (items: LineItem[]) => void;
  onTaxRateChange: (rate: number) => void;
  onNotesChange: (notes: string) => void;
  onAddProduct: (product: Product) => void;
  onRemoveLineItem: (id: string) => void;
  onUpdateLineItem: (id: string, field: string, value: any) => void;
  calculateSubtotal: () => number;
  calculateTotalTax: () => number;
  calculateGrandTotal: () => number;
}

export const UnifiedItemsStep = ({
  documentType,
  documentNumber,
  lineItems,
  taxRate,
  notes,
  onLineItemsChange,
  onTaxRateChange,
  onNotesChange,
  onAddProduct,
  onRemoveLineItem,
  onUpdateLineItem,
  calculateSubtotal,
  calculateTotalTax,
  calculateGrandTotal
}: UnifiedItemsStepProps) => {
  const [showProductDialog, setShowProductDialog] = useState(false);
  const isMobile = useIsMobile();

  const handleProductSelect = (product: Product) => {
    onAddProduct(product);
    setShowProductDialog(false);
  };

  return (
    <div className="space-y-6">
      {/* Document Header */}
      <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-center justify-between'}`}>
        <div>
          <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold`}>
            {documentType === "estimate" ? "Estimate" : "Invoice"} Items
          </h3>
          <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
            Add line items and configure pricing for this {documentType}
          </p>
        </div>
        <Button 
          onClick={() => setShowProductDialog(true)}
          className={`gap-2 ${isMobile ? 'w-full h-12 text-sm' : ''}`}
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Line Items Table */}
      <Card>
        <CardHeader className={isMobile ? "p-4 pb-2" : ""}>
          <CardTitle className={isMobile ? "text-base" : ""}>Line Items</CardTitle>
        </CardHeader>
        <CardContent className={isMobile ? "p-4 pt-2" : ""}>
          <DocumentLineItemsTable
            documentType={documentType}
            lineItems={lineItems}
          />
          
          {lineItems.length === 0 && (
            <div className={`text-center ${isMobile ? 'py-6' : 'py-8'} text-muted-foreground`}>
              <Plus className={`mx-auto ${isMobile ? 'h-8 w-8' : 'h-12 w-12'} text-gray-400 mb-4`} />
              <p className={`${isMobile ? 'text-base' : 'text-lg'} font-medium`}>No items added yet</p>
              <p className={`${isMobile ? 'text-xs' : 'text-sm'}`}>Add products to get started</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Totals Section */}
      <DocumentTotalsSection
        documentType={documentType}
        taxRate={taxRate}
        subtotal={calculateSubtotal()}
        tax={calculateTotalTax()}
        total={calculateGrandTotal()}
      />

      {/* Notes Section */}
      <NotesSection
        notes={notes}
        onNotesChange={onNotesChange}
      />

      {/* Product Selection Dialog */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className={`${isMobile ? 'w-[95vw] h-[90vh] max-w-none p-4' : 'max-w-4xl max-h-[80vh]'} overflow-hidden`}>
          <DialogHeader className={isMobile ? "pb-2" : ""}>
            <DialogTitle className={isMobile ? "text-base" : ""}>Select Products</DialogTitle>
          </DialogHeader>
          <div className={`overflow-auto ${isMobile ? 'max-h-[75vh]' : 'max-h-[70vh] p-4'}`}>
            <ProductCatalog
              onAddProduct={handleProductSelect}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
