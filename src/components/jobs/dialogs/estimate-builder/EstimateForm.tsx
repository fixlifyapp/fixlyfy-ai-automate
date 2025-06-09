
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LineItemsTable } from './LineItemsTable';
import { LineItem } from '@/components/jobs/builder/types';
import { formatCurrency } from '@/lib/utils';

export interface EstimateFormProps {
  estimateNumber: string;
  lineItems: LineItem[];
  taxRate: number;
  setTaxRate: (rate: number) => void;
  onRemoveLineItem: (id: string) => void;
  onUpdateLineItem: (id: string, field: string, value: any) => void;
  onEditLineItem: (id: string) => boolean;
  onAddEmptyLineItem: () => void;
  onAddCustomLine: () => void;
  calculateSubtotal: () => number;
  calculateTotalTax: () => number;
  calculateGrandTotal: () => number;
  calculateTotalMargin: () => number;
  calculateMarginPercentage: () => number;
}

export const EstimateForm = ({
  estimateNumber,
  lineItems,
  taxRate,
  setTaxRate,
  onRemoveLineItem,
  onUpdateLineItem,
  onEditLineItem,
  onAddEmptyLineItem,
  onAddCustomLine,
  calculateSubtotal,
  calculateTotalTax,
  calculateGrandTotal,
  calculateTotalMargin,
  calculateMarginPercentage
}: EstimateFormProps) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>Estimate #{estimateNumber}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="estimate-number">Estimate Number</Label>
              <Input id="estimate-number" value={estimateNumber} readOnly />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input id="date" value={new Date().toLocaleDateString()} readOnly />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
          <LineItemsTable
            lineItems={lineItems}
            onUpdateLineItem={onUpdateLineItem}
            onEditLineItem={onEditLineItem}
            onRemoveLineItem={onRemoveLineItem}
          />
          
          <div className="mt-4 flex gap-2">
            <Button variant="outline" onClick={onAddEmptyLineItem}>
              Add Item
            </Button>
            <Button variant="outline" onClick={onAddCustomLine}>
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
              onChange={(e) => setTaxRate(parseFloat(e.target.value) / 100 || 0)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Totals */}
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(calculateSubtotal())}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>{formatCurrency(calculateTotalTax())}</span>
            </div>
            <div className="flex justify-between font-bold border-t pt-2">
              <span>Total:</span>
              <span>{formatCurrency(calculateGrandTotal())}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
