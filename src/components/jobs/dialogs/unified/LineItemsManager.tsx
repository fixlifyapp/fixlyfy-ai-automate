
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export interface LineItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  taxable: boolean;
  isWarranty?: boolean;
}

interface LineItemsManagerProps {
  lineItems: LineItem[];
  onUpdateLineItem: (id: string, field: string, value: any) => void;
  onRemoveLineItem: (id: string) => void;
}

export const LineItemsManager = ({
  lineItems,
  onUpdateLineItem,
  onRemoveLineItem
}: LineItemsManagerProps) => {
  if (lineItems.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <p>No items added yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Line Items</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {lineItems.map((item) => (
            <div key={item.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Input
                    value={item.name}
                    onChange={(e) => onUpdateLineItem(item.id, 'name', e.target.value)}
                    placeholder="Item name"
                    className="font-medium"
                  />
                  {item.description && (
                    <Input
                      value={item.description}
                      onChange={(e) => onUpdateLineItem(item.id, 'description', e.target.value)}
                      placeholder="Description"
                      className="mt-2 text-sm"
                    />
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveLineItem(item.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-sm font-medium">Quantity</label>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => onUpdateLineItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                    min="0"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Unit Price</label>
                  <Input
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => onUpdateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="flex items-end">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Total</label>
                    <div className="font-medium text-lg">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`taxable-${item.id}`}
                  checked={item.taxable}
                  onCheckedChange={(checked) => onUpdateLineItem(item.id, 'taxable', checked)}
                />
                <label htmlFor={`taxable-${item.id}`} className="text-sm">
                  Taxable (13%)
                </label>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
