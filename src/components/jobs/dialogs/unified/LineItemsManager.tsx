
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { DocumentLineItemsTable } from './components/DocumentLineItemsTable';
import { LineItem, Product } from '@/components/jobs/builder/types';

interface LineItemsManagerProps {
  lineItems: LineItem[];
  onLineItemsChange: (items: LineItem[]) => void;
  onAddProduct: (product: Product) => void;
  onRemoveLineItem: (id: string) => void;
  onUpdateLineItem: (id: string, field: string, value: any) => void;
  taxRate: number;
  onTaxRateChange: (rate: number) => void;
  notes: string;
  onNotesChange: (notes: string) => void;
  calculateSubtotal?: () => number;
  calculateTotalTax?: () => number;
  calculateGrandTotal?: () => number;
  documentType?: string;
}

export const LineItemsManager = ({
  lineItems,
  onLineItemsChange,
  onAddProduct,
  onRemoveLineItem,
  onUpdateLineItem,
  taxRate,
  onTaxRateChange,
  notes,
  onNotesChange,
  calculateSubtotal,
  calculateTotalTax,
  calculateGrandTotal,
  documentType
}: LineItemsManagerProps) => {
  const [showAddItem, setShowAddItem] = useState(false);

  const handleAddCustomLine = () => {
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

  const handleAddEmptyLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      name: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      taxable: true
    };
    onLineItemsChange([...lineItems, newItem]);
  };

  return (
    <div className="space-y-6">
      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentLineItemsTable
            lineItems={lineItems}
            onUpdateLineItem={onUpdateLineItem}
            onRemoveLineItem={onRemoveLineItem}
          />
          
          <div className="mt-4 flex gap-2">
            <Button variant="outline" onClick={handleAddEmptyLineItem}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
            <Button variant="outline" onClick={handleAddCustomLine}>
              Add Custom Line
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tax Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Tax Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="tax-rate">Tax Rate (%)</Label>
            <Input
              id="tax-rate"
              type="number"
              min={0}
              max={100}
              step={0.01}
              value={taxRate * 100}
              onChange={(e) => onTaxRateChange(parseFloat(e.target.value) / 100 || 0)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Add any notes or special instructions..."
            rows={3}
          />
        </CardContent>
      </Card>
    </div>
  );
};
