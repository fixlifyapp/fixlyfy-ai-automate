
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, FileText, Send } from "lucide-react";

interface InvoicePaymentStepProps {
  formData: {
    invoiceNumber: string;
    items: any[];
    notes: string;
    issueDate: string;
    dueDate: string;
  };
  onFormDataChange: (updates: any) => void;
  jobId: string;
  invoice?: any;
  onPayment?: () => void;
  onSendInvoice?: () => void;
}

export const InvoicePaymentStep = ({ 
  formData, 
  onFormDataChange, 
  jobId,
  invoice,
  onPayment,
  onSendInvoice 
}: InvoicePaymentStepProps) => {
  const calculateTotal = () => {
    return formData.items.reduce((sum: number, item: any) => {
      const itemTotal = item.quantity * item.unitPrice;
      const tax = item.taxable ? itemTotal * 0.13 : 0;
      return sum + itemTotal + tax;
    }, 0);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText size={20} />
            Invoice Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="font-medium">Invoice Number:</span>
              <span>{formData.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Issue Date:</span>
              <span>{formData.issueDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Due Date:</span>
              <span>{formData.dueDate}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-3">
              <span>Total Amount:</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard size={20} />
            Payment Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={onPayment}
              className="flex items-center gap-2 h-12"
              variant="outline"
            >
              <CreditCard size={16} />
              Record Payment
            </Button>
            
            <Button 
              onClick={onSendInvoice}
              className="flex items-center gap-2 h-12"
            >
              <Send size={16} />
              Send to Client
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Invoice will be sent to client via email</li>
            <li>• Client will receive payment instructions</li>
            <li>• You'll be notified when payment is received</li>
            <li>• Job status will automatically update upon payment</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
