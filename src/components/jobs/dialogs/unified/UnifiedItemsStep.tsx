
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ModernCard } from "@/components/ui/modern-card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Search, Package } from "lucide-react";
import { LineItem } from "../../builder/types";

interface UnifiedItemsStepProps {
  documentType: "estimate" | "invoice";
  documentNumber: string;
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
  const [searchTerm, setSearchTerm] = useState("");

  // Mock products for demo
  const mockProducts = [
    { id: "1", name: "HVAC Service Call", price: 150, cost: 75, category: "Service" },
    { id: "2", name: "Furnace Filter", price: 25, cost: 12, category: "Parts" },
    { id: "3", name: "Thermostat Installation", price: 200, cost: 100, category: "Installation" },
    { id: "4", name: "Duct Cleaning", price: 300, cost: 150, category: "Service" },
  ];

  const filteredProducts = mockProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addNewLineItem = () => {
    const newItem: LineItem = {
      id: `item-${Date.now()}`,
      description: "",
      quantity: 1,
      unitPrice: 0,
      total: 0,
      taxable: true,
      discount: 0
    };
    onLineItemsChange([...lineItems, newItem]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Items & Details</h2>
          <p className="text-muted-foreground">Add products and services to your {documentType}</p>
        </div>
        <Badge variant="outline" className="font-mono">
          {documentNumber}
        </Badge>
      </div>

      {/* Product Search */}
      <ModernCard className="p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-medium">Add Products & Services</h3>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products and services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {searchTerm && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => onAddProduct(product)}
                  className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.category}</p>
                  </div>
                  <p className="font-semibold">${product.price}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </ModernCard>

      {/* Line Items */}
      <ModernCard className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Line Items</h3>
            <Button onClick={addNewLineItem} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </div>

          {lineItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No items added yet</p>
              <p className="text-sm">Search for products above or add custom items</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lineItems.map((item, index) => (
                <div key={item.id} className="grid grid-cols-12 gap-3 p-3 border rounded-lg">
                  <div className="col-span-4">
                    <Input
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => onUpdateLineItem(item.id, "description", e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => onUpdateLineItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="Price"
                      value={item.unitPrice}
                      onChange={(e) => onUpdateLineItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      value={`$${(item.quantity * item.unitPrice).toFixed(2)}`}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  <div className="col-span-2 flex items-center justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRemoveLineItem(item.id)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ModernCard>

      {/* Totals */}
      <ModernCard className="p-4">
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>${calculateSubtotal().toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Tax Rate (%):</span>
            <Input
              type="number"
              value={taxRate * 100}
              onChange={(e) => onTaxRateChange(parseFloat(e.target.value) / 100 || 0)}
              className="w-20 text-right"
              step="0.1"
            />
          </div>
          <div className="flex justify-between">
            <span>Tax:</span>
            <span>${calculateTotalTax().toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>Total:</span>
            <span>${calculateGrandTotal().toFixed(2)}</span>
          </div>
        </div>
      </ModernCard>

      {/* Notes */}
      <ModernCard className="p-4">
        <div className="space-y-3">
          <h3 className="font-medium">Notes</h3>
          <Textarea
            placeholder="Add any additional notes or terms..."
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            rows={3}
          />
        </div>
      </ModernCard>
    </div>
  );
};
