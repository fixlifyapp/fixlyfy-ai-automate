
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LineItem } from "@/components/jobs/builder/types";
import { formatCurrency } from "@/lib/utils";

interface InvoicePreviewStepProps {
  formData: {
    invoiceNumber: string;
    items: LineItem[];
    notes: string;
    issueDate: string;
    dueDate: string;
  };
  jobId: string;
}

export const InvoicePreviewStep = ({ formData }: InvoicePreviewStepProps) => {
  const calculateSubtotal = () => {
    return formData.items.reduce((sum: number, item: LineItem) => sum + (item.quantity * item.unitPrice), 0);
  };

  const calculateTax = () => {
    return formData.items.reduce((sum: number, item: LineItem) => {
      if (item.taxable) {
        return sum + (item.quantity * item.unitPrice * 0.10);
      }
      return sum;
    }, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">{formData.invoiceNumber}</h2>
          <p className="text-sm text-muted-foreground">
            Issue Date: {formatDate(formData.issueDate)}
          </p>
          {formData.dueDate && (
            <p className="text-sm text-muted-foreground">
              Due Date: {formatDate(formData.dueDate)}
            </p>
          )}
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">
            {formatCurrency(calculateTotal())}
          </div>
        </div>
      </div>

      <Separator />

      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Items & Services</CardTitle>
        </CardHeader>
        <CardContent>
          {formData.items.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No items added to this invoice
            </div>
          ) : (
            <div className="space-y-2">
              {formData.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <div className="flex-1">
                    <div className="font-medium">{item.description}</div>
                    <div className="text-sm text-muted-foreground">
                      Qty: {item.quantity} × {formatCurrency(item.unitPrice)}
                      {item.taxable && " (Taxable)"}
                    </div>
                  </div>
                  <div className="font-medium">
                    {formatCurrency(item.total)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Totals */}
      {formData.items.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(calculateSubtotal())}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (10%):</span>
                <span>{formatCurrency(calculateTax())}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>{formatCurrency(calculateTotal())}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {formData.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{formData.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
