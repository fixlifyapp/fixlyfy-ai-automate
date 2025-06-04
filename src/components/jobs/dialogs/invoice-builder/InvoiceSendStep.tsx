
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, FileText, Send } from "lucide-react";
import { LineItem } from "../../builder/types";
import { InvoiceSendDialog } from "../InvoiceSendDialog";

interface InvoiceSendStepProps {
  invoiceNumber: string;
  lineItems: LineItem[];
  notes: string;
  total: number;
  jobId: string;
  onSave: () => Promise<boolean>;
  onClose: () => void;
}

export const InvoiceSendStep = ({
  invoiceNumber,
  lineItems,
  notes,
  total,
  jobId,
  onSave,
  onClose
}: InvoiceSendStepProps) => {
  const [showSendDialog, setShowSendDialog] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleSendInvoice = async () => {
    const success = await onSave();
    if (success) {
      setShowSendDialog(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Invoice Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Invoice Preview
            </CardTitle>
            <Badge variant="secondary">#{invoiceNumber}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Line Items Summary */}
            <div>
              <h4 className="font-medium mb-3">Items ({lineItems.length})</h4>
              <div className="space-y-2">
                {lineItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                    <div>
                      <div className="font-medium">{item.description}</div>
                      <div className="text-sm text-muted-foreground">
                        Qty: {item.quantity} × {formatCurrency(item.unitPrice)}
                      </div>
                    </div>
                    <div className="font-medium">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total Amount:</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Notes */}
            {notes && (
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Notes</h4>
                <p className="text-sm text-muted-foreground">{notes}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Send Options */}
      <Card>
        <CardHeader>
          <CardTitle>Send Invoice to Client</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Ready to send your invoice? Choose how you'd like to deliver it to your client.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleSendInvoice}
                className="flex-1 gap-2"
                size="lg"
              >
                <Send className="h-4 w-4" />
                Send Invoice
              </Button>
              
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 gap-2"
                size="lg"
              >
                <CheckCircle className="h-4 w-4" />
                Save & Close
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>💡 <strong>Pro tip:</strong> Your client will receive the invoice via email or SMS with a secure link to view and pay online through the client portal.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Send Dialog */}
      <InvoiceSendDialog
        open={showSendDialog}
        onOpenChange={setShowSendDialog}
        onSave={onSave}
        onAddWarranty={() => {}} // No warranty step for invoices
        invoiceNumber={invoiceNumber}
        jobId={jobId}
      />
    </div>
  );
};
