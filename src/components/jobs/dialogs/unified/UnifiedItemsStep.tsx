import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { LineItem, Product } from "../../builder/types";
import { ProductCatalog } from "../../builder/ProductCatalog";
import { DocumentTotalsSection } from "./components/DocumentTotalsSection";
import { NotesSection } from "./components/NotesSection";
import { LineItemsTable } from "./components/LineItemsTable";

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

  const handleProductSelect = (product: Product) => {
    onAddProduct(product);
    setShowProductDialog(false);
  };

  return (
    <div className="space-y-6">
      {/* Document Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            {documentType === "estimate" ? "Estimate" : "Invoice"} Items
          </h3>
          <p className="text-sm text-muted-foreground">
            Add line items and configure pricing for this {documentType}
          </p>
        </div>
        <Button 
          onClick={() => setShowProductDialog(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Line Items Table */}
      <LineItemsTable
        lineItems={lineItems}
        onRemoveLineItem={onRemoveLineItem}
        onUpdateLineItem={onUpdateLineItem}
      />

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
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Select Products</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto max-h-[70vh] p-4">
            <ProductCatalog
              onAddProduct={handleProductSelect}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
