
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { LineItem, Product } from "../../builder/types";
import { ProductCatalog } from "../../builder/ProductCatalog";
import { DocumentTotalsSection } from "./components/DocumentTotalsSection";
import { DocumentLineItemsTable } from "./components/DocumentLineItemsTable";
import { NotesSection } from "./components/NotesSection";

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
  const [showProductCatalog, setShowProductCatalog] = useState(false);

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
          onClick={() => setShowProductCatalog(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Line Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentLineItemsTable
            lineItems={lineItems}
          />
          
          {lineItems.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Plus className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium">No items added yet</p>
              <p className="text-sm">Add products to get started</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Totals Section */}
      <DocumentTotalsSection
        taxRate={taxRate}
        subtotal={calculateSubtotal()}
        totalTax={calculateTotalTax()}
        grandTotal={calculateGrandTotal()}
      />

      {/* Notes Section */}
      <NotesSection
        notes={notes}
        onNotesChange={onNotesChange}
      />

      {/* Product Catalog Dialog */}
      {showProductCatalog && (
        <ProductCatalog
          isOpen={showProductCatalog}
          onClose={() => setShowProductCatalog(false)}
          onSelectProduct={onAddProduct}
        />
      )}
    </div>
  );
};
