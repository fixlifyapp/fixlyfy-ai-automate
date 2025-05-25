
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InvoiceFormValues } from "./schema";

interface InvoicePreviewProps {
  formData: InvoiceFormValues;
  type: "invoice" | "estimate";
  onCancel: () => void;
  onSubmit: () => void;
  companyInfo?: any;
  clientInfo?: any;
  calculateTotal: () => number;
}

export const InvoicePreview = ({
  formData,
  type,
  onCancel,
  onSubmit,
  companyInfo,
  clientInfo,
  calculateTotal
}: InvoicePreviewProps) => {
  return (
    <div className="space-y-6">
      {/* Preview Header */}
      <div className="text-center py-8 border-b">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {type === "invoice" ? "INVOICE" : "ESTIMATE"}
        </h1>
        <p className="text-lg text-gray-600">#{formData.invoiceNumber}</p>
      </div>

      {/* Company and Client Info */}
      <div className="grid grid-cols-2 gap-8">
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">From:</h3>
          <div className="text-gray-600">
            <p className="font-medium">{companyInfo?.name || "Your Company"}</p>
            <p>{companyInfo?.address || "123 Business St"}</p>
            <p>{companyInfo?.city || "City"}, {companyInfo?.state || "State"} {companyInfo?.zip || "12345"}</p>
            <p>{companyInfo?.phone || "(555) 123-4567"}</p>
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">To:</h3>
          <div className="text-gray-600">
            <p className="font-medium">{clientInfo?.name || "Client Name"}</p>
            <p>{clientInfo?.address || "456 Client Ave"}</p>
            <p>{clientInfo?.city || "City"}, {clientInfo?.state || "State"} {clientInfo?.zip || "12345"}</p>
            <p>{clientInfo?.phone || "(555) 987-6543"}</p>
          </div>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="grid grid-cols-2 gap-8">
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">{type === "invoice" ? "Invoice" : "Estimate"} Details:</h3>
          <div className="text-gray-600 space-y-1">
            <p><span className="font-medium">Issue Date:</span> {new Date(formData.issueDate).toLocaleDateString()}</p>
            <p><span className="font-medium">Due Date:</span> {new Date(formData.dueDate).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">Items:</h3>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Description</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">Qty</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">Price</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {formData.items.map((item, index) => (
                <tr key={index}>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {item.description}
                    {item.taxable && <Badge variant="secondary" className="ml-2 text-xs">Taxable</Badge>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.quantity}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">${item.unitPrice?.toFixed(2) || '0.00'}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">
                    ${((item.quantity || 0) * (item.unitPrice || 0)).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Total */}
      <div className="flex justify-end">
        <div className="w-64 space-y-2">
          <div className="flex justify-between py-2 border-t border-gray-200">
            <span className="font-semibold text-lg">Total:</span>
            <span className="font-semibold text-lg">${calculateTotal().toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {formData.notes && (
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900">Notes:</h3>
          <p className="text-gray-600 text-sm whitespace-pre-wrap">{formData.notes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Back to Edit
        </Button>
        <Button type="button" onClick={onSubmit}>
          Create {type === "invoice" ? "Invoice" : "Estimate"}
        </Button>
      </div>
    </div>
  );
};
