
import { LineItem } from "@/components/jobs/builder/types";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface EstimatePreviewProps {
  estimateNumber: string;
  lineItems: LineItem[];
  notes: string;
  taxRate: number;
  calculateSubtotal: () => number;
  calculateTotalTax: () => number;
  calculateGrandTotal: () => number;
  clientInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  companyInfo?: {
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
  };
}

export const EstimatePreview = ({
  estimateNumber,
  lineItems,
  notes,
  taxRate,
  calculateSubtotal,
  calculateTotalTax,
  calculateGrandTotal,
  clientInfo,
  companyInfo,
}: EstimatePreviewProps) => {
  
  const calculateLineTotal = (item: LineItem): number => {
    const subtotal = item.quantity * item.unitPrice;
    const discountAmount = subtotal * (item.discount / 100);
    return subtotal - discountAmount;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const validUntilDate = new Date();
  validUntilDate.setDate(validUntilDate.getDate() + 30);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">ESTIMATE</h1>
            <p className="text-xl font-medium text-blue-100">{estimateNumber}</p>
          </div>
          <div className="text-right">
            <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center mb-3">
              <span className="text-2xl font-bold">F</span>
            </div>
            <h2 className="text-lg font-semibold">{companyInfo?.name || 'Fixlyfy Services'}</h2>
            <p className="text-sm text-blue-100 mt-1">
              {companyInfo?.address || '456 Business Ave, Suite 789'}
            </p>
            <p className="text-sm text-blue-100">
              {companyInfo?.phone || '(555) 987-6543'}
            </p>
            <p className="text-sm text-blue-100">
              {companyInfo?.email || 'info@fixlyfy.com'}
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-8">
        {/* Client & Date Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Bill To:</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-semibold text-lg text-gray-900 mb-1">
                  {clientInfo?.name || 'Client Name'}
                </p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {clientInfo?.address || '123 Main St, Apt 45'}
                </p>
                <p className="text-gray-600 text-sm">
                  {clientInfo?.phone || '(555) 123-4567'}
                </p>
                <p className="text-gray-600 text-sm">
                  {clientInfo?.email || 'client@example.com'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Estimate Details:</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Estimate Date:</span>
                  <span className="text-sm text-gray-900">{formatDate(new Date())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Valid Until:</span>
                  <span className="text-sm text-gray-900">{formatDate(validUntilDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Estimate #:</span>
                  <span className="text-sm font-mono text-gray-900">{estimateNumber}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Line Items Table */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Services & Products</h3>
          <div className="overflow-hidden border border-gray-200 rounded-lg">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Description
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Qty
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Unit Price
                  </th>
                  {lineItems.some(item => item.discount > 0) && (
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Discount
                    </th>
                  )}
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {lineItems.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{item.name || item.description}</p>
                        {item.description && item.name !== item.description && (
                          <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-900">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-900">
                      ${item.unitPrice.toFixed(2)}
                    </td>
                    {lineItems.some(item => item.discount > 0) && (
                      <td className="px-6 py-4 text-center">
                        {item.discount > 0 ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            {item.discount}% off
                          </Badge>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    )}
                    <td className="px-6 py-4 text-right font-medium text-gray-900">
                      ${calculateLineTotal(item).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals Section */}
        <div className="flex justify-end mb-8">
          <div className="w-full max-w-sm">
            <div className="bg-gray-50 rounded-lg p-6 space-y-3">
              <div className="flex justify-between text-gray-600">
                <span className="font-medium">Subtotal:</span>
                <span>${calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span className="font-medium">Tax ({taxRate}%):</span>
                <span>${calculateTotalTax().toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>Total:</span>
                <span className="text-blue-600">${calculateGrandTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        {notes && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Notes</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">{notes}</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <Separator className="my-6" />
        <div className="text-center text-sm text-gray-500 space-y-2">
          <p className="font-medium">Thank you for choosing {companyInfo?.name || 'Fixlyfy Services'}!</p>
          <p>This estimate is valid for 30 days from the date of issue.</p>
          <p>All services are subject to our terms and conditions.</p>
        </div>
      </div>
    </div>
  );
};
