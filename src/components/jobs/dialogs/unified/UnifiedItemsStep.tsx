
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const [showProductCatalog, setShowProductCatalog] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="space-y-4">
      {/* Document Header */}
      <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-center justify-between'}`}>
        <div>
          <h3 className={`font-semibold ${isMobile ? 'text-base' : 'text-lg'}`}>
            {documentType === "estimate" ? "Estimate" : "Invoice"} Items
          </h3>
          <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
            Add line items and configure pricing for this {documentType}
          </p>
        </div>
        <Button 
          onClick={() => setShowProductCatalog(true)}
          className={`gap-2 ${isMobile ? 'w-full h-12 text-base' : ''}`}
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Line Items Table */}
      <Card>
        <CardHeader className={isMobile ? 'px-3 py-3' : 'px-6 py-4'}>
          <CardTitle className={isMobile ? 'text-base' : 'text-lg'}>Line Items</CardTitle>
        </CardHeader>
        <CardContent className={isMobile ? 'px-0 py-0' : 'px-6 pb-6'}>
          <div className={isMobile ? 'overflow-x-auto' : ''}>
            <DocumentLineItemsTable
              documentType={documentType}
              lineItems={lineItems}
              onRemoveLineItem={onRemoveLineItem}
              onUpdateLineItem={onUpdateLineItem}
            />
          </div>
          
          {lineItems.length === 0 && (
            <div className={`text-center text-muted-foreground ${isMobile ? 'py-6 px-3' : 'py-8'}`}>
              <Plus className={`mx-auto text-gray-400 mb-3 ${isMobile ? 'h-8 w-8' : 'h-12 w-12'}`} />
              <p className={`font-medium ${isMobile ? 'text-base' : 'text-lg'}`}>No items added yet</p>
              <p className={isMobile ? 'text-xs' : 'text-sm'}>Add products to get started</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Totals Section */}
      <DocumentTotalsSection
        documentType={documentType}
        taxRate={taxRate}
        onTaxRateChange={onTaxRateChange}
        subtotal={calculateSubtotal()}
        tax={calculateTotalTax()}
        total={calculateGrandTotal()}
      />

      {/* Notes Section */}
      <NotesSection
        notes={notes}
        onNotesChange={onNotesChange}
      />

      {/* Product Catalog - Mobile Responsive */}
      {showProductCatalog && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-2">
          <div className={`bg-white rounded-lg overflow-hidden ${
            isMobile 
              ? 'w-full h-full max-w-none max-h-none' 
              : 'max-w-4xl w-full max-h-[80vh]'
          }`}>
            <div className={`border-b flex items-center justify-between ${isMobile ? 'p-3' : 'p-4'}`}>
              <h3 className={`font-semibold ${isMobile ? 'text-base' : 'text-lg'}`}>Product Catalog</h3>
              <Button 
                variant="ghost" 
                onClick={() => setShowProductCatalog(false)}
                className={isMobile ? 'h-10 w-10' : ''}
              >
                ×
              </Button>
            </div>
            <div className={`overflow-y-auto ${isMobile ? 'h-[calc(100%-60px)] p-3' : 'p-4 max-h-[calc(80vh-60px)]'}`}>
              <ProductCatalog
                onAddProduct={(product) => {
                  onAddProduct(product);
                  setShowProductCatalog(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
