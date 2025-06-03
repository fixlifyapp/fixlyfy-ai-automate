
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus, Search } from "lucide-react";
import { LineItem, Product } from "../../builder/types";
import { formatCurrency } from "@/lib/utils";
import { DocumentType } from "../UnifiedDocumentBuilder";
import { ProductSearch } from "../../builder/ProductSearch";

interface LineItemsManagerProps {
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
  documentType: DocumentType;
}

export const LineItemsManager = ({
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
  calculateGrandTotal,
  documentType
}: LineItemsManagerProps) => {
  const [showProductSearch, setShowProductSearch] = useState(false);
  
  const subtotal = calculateSubtotal();
  const tax = calculateTotalTax();
  const total = calculateGrandTotal();

  const handleAddEmptyLineItem = () => {
    setShowProductSearch(true);
  };

  const handleAddCustomLine = () => {
    const customItem: LineItem = {
      id: `custom-${Date.now()}`,
      description: "Custom line item",
      quantity: 1,
      unitPrice: 0,
      taxable: true,
      discount: 0,
      ourPrice: 0,
      name: "Custom Item",
      price: 0,
      total: 0
    };
    onLineItemsChange([...lineItems, customItem]);
  };

  const handleProductSelect = (product: Product) => {
    onAddProduct(product);
    setShowProductSearch(false);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Line Items Header */}
        <div className="flex justify-between items-center">
          <h4 className="text-lg font-semibold">Items</h4>
          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={handleAddEmptyLineItem}
              className="gap-1"
            >
              <Search size={16} />
              Add Product
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={handleAddCustomLine}
              className="gap-1"
            >
              <Plus size={16} />
              Custom Line
            </Button>
          </div>
        </div>

        {/* Line Items Table */}
        {lineItems.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg bg-gray-50">
            <div className="space-y-3">
              <div className="mx-auto w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                <Plus className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-lg">No items added yet</p>
              <p className="text-sm">Add products or custom line items to get started</p>
              <Button onClick={handleAddEmptyLineItem} variant="outline" className="mt-4">
                <Search className="w-4 h-4 mr-2" />
                Browse Products
              </Button>
            </div>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b">
              <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
                <div className="col-span-5">Description</div>
                <div className="col-span-2">Qty</div>
                <div className="col-span-2">Price</div>
                <div className="col-span-2">Total</div>
                <div className="col-span-1"></div>
              </div>
            </div>
            <div className="divide-y">
              {lineItems.map((item) => (
                <div key={item.id} className="px-4 py-3 bg-white hover:bg-gray-50">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-5">
                      <Input
                        value={item.description || item.name || ""}
                        onChange={(e) => onUpdateLineItem(item.id, "description", e.target.value)}
                        placeholder="Item description"
                        className="border-0 shadow-none p-0 focus-visible:ring-0"
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => onUpdateLineItem(item.id, "quantity", parseInt(e.target.value) || 1)}
                        min="1"
                        className="border-0 shadow-none p-0 focus-visible:ring-0"
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <Input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => onUpdateLineItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                        className="border-0 shadow-none p-0 focus-visible:ring-0"
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <div className="font-medium">
                        {formatCurrency(item.quantity * item.unitPrice)}
                      </div>
                    </div>
                    
                    <div className="col-span-1 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveLineItem(item.id)}
                        className="text-red-500 hover:text-red-700 p-1 h-8 w-8"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Totals Section */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Label htmlFor="tax-rate" className="text-sm font-medium min-w-0">Tax Rate (%)</Label>
              <Input
                id="tax-rate"
                type="number"
                value={taxRate}
                onChange={(e) => onTaxRateChange(parseFloat(e.target.value) || 0)}
                min="0"
                max="100"
                step="0.01"
                className="w-24"
              />
            </div>
            
            <div className="space-y-3 pt-4 border-t">
              <div className="flex justify-between text-base">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-base">
                <span className="text-gray-600">Tax ({taxRate}%):</span>
                <span className="font-medium">{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold border-t pt-3">
                <span>Total:</span>
                <span className="text-green-600">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="space-y-3">
          <Label htmlFor="notes" className="text-sm font-medium">Notes & Terms</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder={`Add any notes for this ${documentType}...`}
            rows={4}
            className="resize-none"
          />
        </div>
      </div>

      {/* Product Search Dialog */}
      <ProductSearch
        open={showProductSearch}
        onOpenChange={setShowProductSearch}
        onProductSelect={handleProductSelect}
      />
    </>
  );
};
