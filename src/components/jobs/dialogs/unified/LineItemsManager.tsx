
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Package, ChevronDown, ChevronUp } from "lucide-react";
import { LineItem } from "../../builder/types";
import { ProductCatalog } from "../../builder/ProductCatalog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface LineItemsManagerProps {
  lineItems: LineItem[];
  taxRate: number;
  notes: string;
  onLineItemsChange: (items: LineItem[]) => void;
  onTaxRateChange: (rate: number) => void;
  onNotesChange: (notes: string) => void;
  onAddProduct: (product: any) => void;
  onRemoveLineItem: (id: string) => void;
  onUpdateLineItem: (id: string, field: string, value: any) => void;
  calculateSubtotal: () => number;
  calculateTotalTax: () => number;
  calculateGrandTotal: () => number;
  documentType: "estimate" | "invoice";
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
  const [isProductCatalogOpen, setIsProductCatalogOpen] = useState(false);

  const handleAddCustomItem = () => {
    const newItem: LineItem = {
      id: `custom-${Date.now()}`,
      description: "",
      quantity: 1,
      unitPrice: 0,
      taxable: true,
      discount: 0,
      ourPrice: 0,
      name: "",
      price: 0,
      total: 0
    };
    onLineItemsChange([...lineItems, newItem]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          {documentType === "estimate" ? "Estimate" : "Invoice"} Items
        </h3>
        <Badge variant="outline" className="text-sm">
          {lineItems.length} {lineItems.length === 1 ? "item" : "items"}
        </Badge>
      </div>

      {/* Add Items Section */}
      <Card className="border-blue-200 bg-blue-50/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-blue-900">Add Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Button
              onClick={handleAddCustomItem}
              variant="outline"
              className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              <Plus className="w-4 h-4 mr-2" />
              Custom Item
            </Button>
            
            <Collapsible open={isProductCatalogOpen} onOpenChange={setIsProductCatalogOpen}>
              <CollapsibleTrigger asChild>
                <Button 
                  variant="outline" 
                  className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Product Catalog
                  {isProductCatalogOpen ? (
                    <ChevronUp className="w-4 h-4 ml-2" />
                  ) : (
                    <ChevronDown className="w-4 h-4 ml-2" />
                  )}
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="mt-3">
                <div className="border border-blue-200 rounded-lg bg-white">
                  <ProductCatalog onAddProduct={onAddProduct} />
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      {lineItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Items</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-0">
              {lineItems.map((item, index) => (
                <div key={item.id} className={`p-4 ${index > 0 ? 'border-t' : ''}`}>
                  <div className="grid grid-cols-12 gap-3 items-start">
                    {/* Description */}
                    <div className="col-span-5">
                      <Label className="text-xs text-gray-600 mb-1 block">Description</Label>
                      <Input
                        placeholder="Item description"
                        value={item.description}
                        onChange={(e) => onUpdateLineItem(item.id, "description", e.target.value)}
                        className="text-sm"
                      />
                    </div>

                    {/* Quantity */}
                    <div className="col-span-2">
                      <Label className="text-xs text-gray-600 mb-1 block">Qty</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => onUpdateLineItem(item.id, "quantity", parseInt(e.target.value) || 1)}
                        className="text-sm text-center"
                      />
                    </div>

                    {/* Unit Price */}
                    <div className="col-span-2">
                      <Label className="text-xs text-gray-600 mb-1 block">Price</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => onUpdateLineItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)}
                        className="text-sm text-right"
                      />
                    </div>

                    {/* Total */}
                    <div className="col-span-2">
                      <Label className="text-xs text-gray-600 mb-1 block">Total</Label>
                      <div className="text-sm font-medium text-right py-2 px-3 bg-gray-50 rounded border">
                        ${(item.quantity * item.unitPrice).toFixed(2)}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="col-span-1 flex justify-center pt-6">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveLineItem(item.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label className="text-sm">Tax Rate (%):</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={taxRate}
                  onChange={(e) => onTaxRateChange(parseFloat(e.target.value) || 0)}
                  className="w-20 h-8 text-sm text-center"
                />
              </div>
              <span className="text-sm font-medium">${calculateTotalTax().toFixed(2)}</span>
            </div>
            
            <Separator />
            
            <div className="flex justify-between text-lg font-bold text-blue-900">
              <span>Total:</span>
              <span>${calculateGrandTotal().toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder={`Add any additional notes for this ${documentType}...`}
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            className="min-h-[80px] resize-none"
          />
        </CardContent>
      </Card>
    </div>
  );
};
