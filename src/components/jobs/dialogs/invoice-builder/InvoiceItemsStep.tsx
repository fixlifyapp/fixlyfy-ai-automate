
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus } from "lucide-react";
import { LineItem, Product } from "../../builder/types";
import { ProductSearchDialog } from "../../builder/ProductSearchDialog";
import { useState } from "react";

interface InvoiceItemsStepProps {
  lineItems: LineItem[];
  taxRate: number;
  notes: string;
  onAddProduct: (product: Product) => void;
  onRemoveLineItem: (id: string) => void;
  onUpdateLineItem: (id: string, field: string, value: any) => void;
  onTaxRateChange: (rate: number) => void;
  onNotesChange: (notes: string) => void;
  calculateSubtotal: () => number;
  calculateTotalTax: () => number;
  calculateGrandTotal: () => number;
}

export const InvoiceItemsStep = ({
  lineItems,
  taxRate,
  notes,
  onAddProduct,
  onRemoveLineItem,
  onUpdateLineItem,
  onTaxRateChange,
  onNotesChange,
  calculateSubtotal,
  calculateTotalTax,
  calculateGrandTotal
}: InvoiceItemsStepProps) => {
  const [showProductSearch, setShowProductSearch] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleAddManualItem = () => {
    const newItem: Product = {
      id: `manual-${Date.now()}`,
      name: "New Item",
      description: "Description",
      price: 0,
      cost: 0,
      quantity: 1,
      taxable: true
    };
    onAddProduct(newItem);
  };

  return (
    <div className="space-y-6">
      {/* Line Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Invoice Items</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowProductSearch(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddManualItem}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {lineItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No items added yet</p>
              <p className="text-sm">Add products or manual items to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {lineItems.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-4 items-center p-4 border rounded-lg">
                  <div className="col-span-4">
                    <Input
                      value={item.description}
                      onChange={(e) => onUpdateLineItem(item.id, 'description', e.target.value)}
                      placeholder="Item description"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => onUpdateLineItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                      placeholder="Qty"
                      min="0"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => onUpdateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      placeholder="Unit Price"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      value={formatCurrency(item.quantity * item.unitPrice)}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={item.taxable}
                        onChange={(e) => onUpdateLineItem(item.id, 'taxable', e.target.checked)}
                        className="rounded"
                      />
                      <span>Tax</span>
                    </label>
                  </div>
                  <div className="col-span-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRemoveLineItem(item.id)}
                      className="p-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Totals and Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="tax-rate">Tax Rate (%)</Label>
              <Input
                id="tax-rate"
                type="number"
                value={taxRate}
                onChange={(e) => onTaxRateChange(parseFloat(e.target.value) || 0)}
                min="0"
                max="100"
                step="0.01"
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => onNotesChange(e.target.value)}
                placeholder="Add any notes for this invoice..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invoice Total</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(calculateSubtotal())}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax ({taxRate}%):</span>
              <span>{formatCurrency(calculateTotalTax())}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg border-t pt-3">
              <span>Total:</span>
              <span>{formatCurrency(calculateGrandTotal())}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <ProductSearchDialog
        open={showProductSearch}
        onOpenChange={setShowProductSearch}
        onSelectProduct={(product) => {
          onAddProduct(product);
          setShowProductSearch(false);
        }}
      />
    </div>
  );
};
