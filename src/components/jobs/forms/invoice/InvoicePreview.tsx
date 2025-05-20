
import { Button } from "@/components/ui/button";
import { InvoiceFormValues } from "./schema";

interface InvoicePreviewProps {
  data: InvoiceFormValues;
  type: "invoice" | "estimate";
  onCancel: () => void;
  onSubmit: () => void;
  companyInfo: {
    name: string;
    logo: string;
    address: string;
    phone: string;
    email: string;
    legalText: string;
  };
  clientInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
  calculateTotal: () => number;
}

export const InvoicePreview = ({
  data,
  type,
  onCancel,
  onSubmit,
  companyInfo,
  clientInfo,
  calculateTotal,
}: InvoicePreviewProps) => {
  const total = calculateTotal();
  
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="w-full bg-white p-8 rounded-lg border shadow-sm">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-2xl font-bold">{type === "invoice" ? "INVOICE" : "ESTIMATE"}</h2>
            <p className="text-fixlyfy-text-secondary">#{data.invoiceNumber}</p>
          </div>
          <div className="text-right">
            <img src={companyInfo.logo} alt={companyInfo.name} className="h-12 mb-2" />
            <h3 className="font-bold">{companyInfo.name}</h3>
            <p className="text-sm text-fixlyfy-text-secondary whitespace-pre-line">
              {companyInfo.address}<br />
              {companyInfo.phone}<br />
              {companyInfo.email}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h4 className="font-semibold mb-2 text-fixlyfy-text-secondary">Bill To:</h4>
            <p className="font-medium">{clientInfo.name}</p>
            <p className="text-sm text-fixlyfy-text-secondary whitespace-pre-line">
              {clientInfo.address}<br />
              {clientInfo.phone}<br />
              {clientInfo.email}
            </p>
          </div>
          <div className="text-right">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="font-medium text-fixlyfy-text-secondary">Date Issued:</span>
                <span>{data.issueDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-fixlyfy-text-secondary">Due Date:</span>
                <span>{data.dueDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-fixlyfy-text-secondary">{type === "invoice" ? "Invoice" : "Estimate"} #:</span>
                <span>{data.invoiceNumber}</span>
              </div>
            </div>
          </div>
        </div>
        
        <table className="w-full mb-8">
          <thead>
            <tr className="border-b border-fixlyfy-border">
              <th className="py-3 text-left">Description</th>
              <th className="py-3 text-right">Qty</th>
              <th className="py-3 text-right">Unit Price</th>
              <th className="py-3 text-right">Amount</th>
              {data.items.some(item => item.taxable) && (
                <th className="py-3 text-center">Tax</th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, index) => (
              <tr key={index} className="border-b border-fixlyfy-border">
                <td className="py-3">{item.description}</td>
                <td className="py-3 text-right">{item.quantity}</td>
                <td className="py-3 text-right">${item.unitPrice.toFixed(2)}</td>
                <td className="py-3 text-right">${(item.quantity * item.unitPrice).toFixed(2)}</td>
                {data.items.some(item => item.taxable) && (
                  <td className="py-3 text-center">{item.taxable ? "✓" : ""}</td>
                )}
              </tr>
            ))}
            <tr>
              <td colSpan={data.items.some(item => item.taxable) ? 4 : 3} className="py-4 text-right font-semibold">Total:</td>
              <td className="py-4 text-right font-bold">${total.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        
        {data.notes && (
          <div className="mb-8">
            <h4 className="font-semibold mb-2">Notes</h4>
            <p className="text-sm text-fixlyfy-text-secondary">{data.notes}</p>
          </div>
        )}
        
        <div className="mt-12 pt-8 border-t border-fixlyfy-border text-sm text-fixlyfy-text-secondary">
          <p>{companyInfo.legalText}</p>
        </div>
      </div>
      <div className="mt-6 flex justify-end space-x-3">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="outline" onClick={() => {
          window.open(
            `/preview/${type}/${data.invoiceNumber}`, 
            '_blank'
          );
        }}>
          Check {type === "invoice" ? "Invoice" : "Estimate"}
        </Button>
        <Button onClick={onSubmit}>
          Send {type === "invoice" ? "Invoice" : "Estimate"}
        </Button>
      </div>
    </div>
  );
};
