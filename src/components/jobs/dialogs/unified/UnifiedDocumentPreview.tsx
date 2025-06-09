
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

interface LineItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  taxable: boolean;
  isWarranty?: boolean;
}

interface UnifiedDocumentPreviewProps {
  documentType: 'estimate' | 'invoice';
  documentNumber: string;
  lineItems: LineItem[];
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
}

export const UnifiedDocumentPreview = ({
  documentType,
  documentNumber,
  lineItems,
  subtotal,
  tax,
  total,
  notes
}: UnifiedDocumentPreviewProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">
            {documentType === 'estimate' ? 'Estimate' : 'Invoice'} Preview
          </CardTitle>
          <Badge variant={documentType === 'estimate' ? 'secondary' : 'default'}>
            {documentNumber}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Line Items */}
        <div>
          <h3 className="font-semibold mb-3">Items</h3>
          {lineItems.length === 0 ? (
            <p className="text-muted-foreground">No items added</p>
          ) : (
            <div className="space-y-2">
              {lineItems.map((item) => (
                <div key={item.id} className="flex justify-between items-start py-2 border-b">
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    {item.description && (
                      <div className="text-sm text-muted-foreground">{item.description}</div>
                    )}
                    <div className="text-sm text-muted-foreground">
                      {item.quantity} × {formatCurrency(item.unitPrice)}
                      {item.taxable && ' (Taxable)'}
                    </div>
                  </div>
                  <div className="font-medium">
                    {formatCurrency(item.quantity * item.unitPrice)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totals */}
        {lineItems.length > 0 && (
          <div className="space-y-2 pt-4 border-t">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (13%):</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        )}

        {/* Notes */}
        {notes && (
          <div className="pt-4 border-t">
            <h3 className="font-semibold mb-2">Notes</h3>
            <p className="text-sm text-muted-foreground">{notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
