
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';
import { LineItem } from '../builder/types';
import { formatCurrency } from '@/lib/utils';

interface UnifiedDocumentPreviewProps {
  documentType: 'estimate' | 'invoice';
  documentNumber: string;
  lineItems: LineItem[];
  calculateSubtotal: () => number;
  calculateTotalTax: () => number;
  calculateGrandTotal: () => number;
  notes?: string;
  clientInfo?: any;
  jobId?: string;
  issueDate?: string;
  dueDate?: string;
}

export const UnifiedDocumentPreview = ({
  documentType,
  documentNumber,
  lineItems,
  calculateSubtotal,
  calculateTotalTax,
  calculateGrandTotal,
  notes,
  clientInfo,
  jobId,
  issueDate,
  dueDate
}: UnifiedDocumentPreviewProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Document Preview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-xl">
                {documentType === 'estimate' ? 'ESTIMATE' : 'INVOICE'}
              </h3>
              <p className="text-muted-foreground">#{documentNumber}</p>
            </div>
            <Badge variant={documentType === 'estimate' ? 'secondary' : 'default'}>
              {documentType === 'estimate' ? 'Draft' : 'Pending'}
            </Badge>
          </div>

          {/* Client Info */}
          {clientInfo && (
            <div className="border-b pb-4">
              <h4 className="font-medium mb-2">Bill To:</h4>
              <div className="text-sm">
                <p className="font-medium">{clientInfo.name}</p>
                {clientInfo.email && <p>{clientInfo.email}</p>}
                {clientInfo.phone && <p>{clientInfo.phone}</p>}
              </div>
            </div>
          )}

          {/* Items */}
          <div className="space-y-2">
            <h4 className="font-medium">Items:</h4>
            {lineItems.length === 0 ? (
              <p className="text-muted-foreground">No items selected</p>
            ) : (
              <div className="space-y-2">
                {lineItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <span className="font-medium">{item.name}</span>
                      {item.isWarranty && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          Warranty
                        </Badge>
                      )}
                      <div className="text-muted-foreground text-sm">
                        {item.quantity} × {formatCurrency(item.unitPrice)}
                        {item.description && (
                          <div className="text-xs mt-1">{item.description}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          {notes && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Notes:</h4>
              <p className="text-sm text-muted-foreground">{notes}</p>
            </div>
          )}

          {/* Totals */}
          {lineItems.length > 0 && (
            <div className="space-y-1 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>{formatCurrency(calculateSubtotal())}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax (13%):</span>
                <span>{formatCurrency(calculateTotalTax())}</span>
              </div>
              <div className="flex justify-between font-bold border-t pt-1">
                <span>Total:</span>
                <span>{formatCurrency(calculateGrandTotal())}</span>
              </div>
            </div>
          )}

          {/* Dates */}
          {(issueDate || dueDate) && (
            <div className="text-xs text-muted-foreground border-t pt-4 space-y-1">
              {issueDate && <div>Issue Date: {issueDate}</div>}
              {dueDate && <div>Due Date: {dueDate}</div>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
