
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, FileText } from "lucide-react";

interface InvoicePreviewStepProps {
  formData: any;
  jobId: string;
}

export const InvoicePreviewStep = ({ formData, jobId }: InvoicePreviewStepProps) => {
  const calculateSubtotal = () => {
    return formData.items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);
  };

  const calculateTax = () => {
    return formData.items.reduce((sum: number, item: any) => {
      if (item.taxable) {
        return sum + (item.quantity * item.unitPrice * 0.13);
      }
      return sum;
    }, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <Eye className="h-5 w-5" />
        Invoice Preview
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">INVOICE</CardTitle>
              <p className="text-muted-foreground">#{formData.invoiceNumber}</p>
            </div>
            <div className="text-right">
              <div className="font-semibold">Fixlyfy Inc.</div>
              <div className="text-sm text-muted-foreground">
                123 Business St<br />
                Business City, BC V1V 1V1<br />
                (555) 123-4567
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Bill To:</h4>
              <div className="text-sm text-muted-foreground">
                [Client Name]<br />
                [Client Address]<br />
                [Client Phone]
              </div>
            </div>
            
            <div className="text-right">
              <div className="space-y-1 text-sm">
                <div><strong>Issue Date:</strong> {formData.issueDate}</div>
                <div><strong>Due Date:</strong> {formData.dueDate}</div>
                <div><strong>Job:</strong> {jobId}</div>
              </div>
            </div>
          </div>

          <div>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Description</th>
                  <th className="text-right py-2">Qty</th>
                  <th className="text-right py-2">Price</th>
                  <th className="text-center py-2">Tax</th>
                  <th className="text-right py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {formData.items.map((item: any, index: number) => (
                  <tr key={index} className="border-b">
                    <td className="py-2">{item.description}</td>
                    <td className="text-right py-2">{item.quantity}</td>
                    <td className="text-right py-2">${item.unitPrice.toFixed(2)}</td>
                    <td className="text-center py-2">{item.taxable ? "✓" : "—"}</td>
                    <td className="text-right py-2">${(item.quantity * item.unitPrice).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (13%):</span>
                <span>${calculateTax().toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>

          {formData.notes && (
            <div>
              <h4 className="font-semibold mb-2">Notes:</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {formData.notes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
