
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Trash2, Plus } from 'lucide-react';
import { LineItem, Product } from './useUnifiedDocumentBuilder';
import { formatCurrency } from '@/lib/utils';

interface LineItemsManagerProps {
  lineItems: LineItem[];
  onLineItemsChange: (items: LineItem[]) => void;
  onAddProduct: (product: Product) => void;
  onRemoveLineItem: (id: string) => void;
  onUpdateLineItem: (id: string, field: string, value: any) => void;
  calculateSubtotal: () => number;
  calculateTotalTax: () => number;
  calculateGrandTotal: () => number;
}

export const LineItemsManager = ({
  lineItems,
  onLineItemsChange,
  onAddProduct,
  onRemoveLineItem,
  onUpdateLineItem,
  calculateSubtotal,
  calculateTotalTax,
  calculateGrandTotal
}: LineItemsManagerProps) => {
  const handleAddCustomItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      name: 'Custom Item',
      description: '',
      quantity: 1,
      unitPrice: 0,
      taxable: true
    };
    onLineItemsChange([...lineItems, newItem]);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Line Items
            <Button onClick={handleAddCustomItem} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lineItems.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No items added yet. Click "Add Item" to get started.
            </p>
          ) : (
            <div className="space-y-4">
              {lineItems.map((item) => (
                <div key={item.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-2">
                      <Input
                        placeholder="Item name"
                        value={item.name}
                        onChange={(e) => onUpdateLineItem(item.id, 'name', e.target.value)}
                      />
                      <Input
                        placeholder="Description (optional)"
                        value={item.description}
                        onChange={(e) => onUpdateLineItem(item.id, 'description', e.target.value)}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveLineItem(item.id)}
                      className="ml-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => onUpdateLineItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div>
                      <Label>Unit Price</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => onUpdateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label>Total</Label>
                      <div className="flex items-center h-10 px-3 bg-muted rounded-md">
                        {formatCurrency(item.quantity * item.unitPrice)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`taxable-${item.id}`}
                      checked={item.taxable}
                      onCheckedChange={(checked) => onUpdateLineItem(item.id, 'taxable', checked)}
                    />
                    <Label htmlFor={`taxable-${item.id}`}>Taxable (13%)</Label>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Totals */}
      {lineItems.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(calculateSubtotal())}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (13%):</span>
                <span>{formatCurrency(calculateTotalTax())}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span>{formatCurrency(calculateGrandTotal())}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
