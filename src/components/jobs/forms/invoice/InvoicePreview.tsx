
import { LineItem } from "@/components/jobs/builder/types";

interface InvoicePreviewProps {
  invoiceNumber: string;
  lineItems: LineItem[];
  notes: string;
  taxRate: number;
  calculateSubtotal: () => number;
  calculateTotalTax: () => number;
  calculateGrandTotal: () => number;
  clientInfo?: {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
  } | null;
  issueDate: string;
  dueDate: string;
}

export const InvoicePreview = ({
  invoiceNumber,
  lineItems,
  notes,
  taxRate,
  calculateSubtotal,
  calculateTotalTax,
  calculateGrandTotal,
  clientInfo,
  issueDate,
  dueDate,
}: InvoicePreviewProps) => {
  
  // Helper function to calculate the total for a line item
  const calculateLineTotal = (item: LineItem): number => {
    const subtotal = item.quantity * item.unitPrice;
    const discountAmount = subtotal * ((item.discount || 0) / 100);
    return subtotal - discountAmount;
  };

  return (
    <div className="border rounded-md p-6 bg-white">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl font-bold mb-1">INVOICE</h2>
          <p className="text-lg font-medium">{invoiceNumber}</p>
        </div>
        <div className="text-right">
          <img src="/placeholder.svg" alt="Company Logo" className="h-12 mb-2" />
          <p className="font-medium">Fixlyfy Services</p>
          <p className="text-sm text-muted-foreground">456 Business Ave, Suite 789</p>
          <p className="text-sm text-muted-foreground">(555) 987-6543</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-sm font-medium uppercase text-muted-foreground mb-2">Bill To:</h3>
          <p className="font-medium">{clientInfo?.name || "Client Name"}</p>
          <p className="text-sm text-muted-foreground">123 Main St, Apt 45</p>
          <p className="text-sm text-muted-foreground">{clientInfo?.phone || "(555) 123-4567"}</p>
          <p className="text-sm text-muted-foreground">{clientInfo?.email || "client@example.com"}</p>
        </div>
        <div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium uppercase text-muted-foreground mb-2">Invoice Date:</h3>
              <p>{new Date(issueDate).toLocaleDateString()}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium uppercase text-muted-foreground mb-2">Due Date:</h3>
              <p>{new Date(dueDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
      
      <table className="w-full mb-8">
        <thead className="border-b">
          <tr>
            <th className="text-left py-2">Description</th>
            <th className="text-right py-2">Qty</th>
            <th className="text-right py-2">Unit Price</th>
            <th className="text-right py-2">Discount</th>
            <th className="text-right py-2">Amount</th>
          </tr>
        </thead>
        <tbody>
          {lineItems.map((item) => (
            <tr key={item.id} className="border-b">
              <td className="py-2">{item.description}</td>
              <td className="text-right py-2">{item.quantity}</td>
              <td className="text-right py-2">${item.unitPrice.toFixed(2)}</td>
              <td className="text-right py-2">{(item.discount || 0) > 0 ? `${item.discount}%` : '-'}</td>
              <td className="text-right py-2">${calculateLineTotal(item).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3}></td>
            <td className="text-right py-2 font-medium">Subtotal:</td>
            <td className="text-right py-2">${calculateSubtotal().toFixed(2)}</td>
          </tr>
          <tr>
            <td colSpan={3}></td>
            <td className="text-right py-2 font-medium">Tax ({taxRate}%):</td>
            <td className="text-right py-2">${calculateTotalTax().toFixed(2)}</td>
          </tr>
          <tr>
            <td colSpan={3}></td>
            <td className="text-right py-2 font-medium">Total:</td>
            <td className="text-right py-2 font-bold">${calculateGrandTotal().toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
      
      {notes && (
        <div className="mb-8">
          <h3 className="text-sm font-medium uppercase text-muted-foreground mb-2">Notes:</h3>
          <p className="text-sm whitespace-pre-line">{notes}</p>
        </div>
      )}
      
      <div className="text-sm text-muted-foreground border-t pt-4">
        <p>Payment is due within 30 days. Thank you for your business!</p>
      </div>
    </div>
  );
};
