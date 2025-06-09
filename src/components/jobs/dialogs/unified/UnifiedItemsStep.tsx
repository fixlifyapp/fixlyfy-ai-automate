
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineItemsManager } from './LineItemsManager';
import { DocumentTotalsSection } from './components/DocumentTotalsSection';
import { LineItem, Product } from '@/components/jobs/builder/types';

interface UnifiedItemsStepProps {
  documentType: 'estimate' | 'invoice';
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
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>
            {documentType === 'estimate' ? 'Estimate' : 'Invoice'} #{documentNumber}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">
                {documentType === 'estimate' ? 'Estimate' : 'Invoice'} Number
              </label>
              <div className="text-sm text-muted-foreground">{documentNumber}</div>
            </div>
            <div>
              <label className="text-sm font-medium">Date</label>
              <div className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Line Items Manager */}
      <LineItemsManager
        lineItems={lineItems}
        onLineItemsChange={onLineItemsChange}
        onAddProduct={onAddProduct}
        onRemoveLineItem={onRemoveLineItem}
        onUpdateLineItem={onUpdateLineItem}
        taxRate={taxRate}
        onTaxRateChange={onTaxRateChange}
        notes={notes}
        onNotesChange={onNotesChange}
      />

      {/* Totals */}
      <DocumentTotalsSection
        subtotal={calculateSubtotal()}
        tax={calculateTotalTax()}
        total={calculateGrandTotal()}
      />
    </div>
  );
};
