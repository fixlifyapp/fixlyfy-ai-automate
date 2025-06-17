
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, CreditCard, Calendar } from 'lucide-react';
import { useClientPortal } from './ClientPortalProvider';

interface InvoiceViewProps {
  invoiceId: string;
  onBack: () => void;
}

export function ClientPortalInvoiceView({ invoiceId, onBack }: InvoiceViewProps) {
  const { data, session } = useClientPortal();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (data?.invoices) {
      const foundInvoice = data.invoices.find((inv: any) => inv.id === invoiceId);
      setInvoice(foundInvoice);
      setLoading(false);
    }
  }, [data, invoiceId]);

  const handlePayNow = () => {
    console.log('Processing payment for invoice:', invoiceId);
    // TODO: Integrate with payment processor
  };

  const handleDownload = () => {
    console.log('Downloading invoice:', invoiceId);
    // TODO: Implement PDF download
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invoice Not Found</h1>
          <Button onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Portal
          </Button>
        </div>
      </div>
    );
  }

  const statusColor = {
    'draft': 'bg-gray-100 text-gray-800',
    'sent': 'bg-blue-100 text-blue-800',
    'paid': 'bg-green-100 text-green-800',
    'unpaid': 'bg-yellow-100 text-yellow-800',
    'overdue': 'bg-red-100 text-red-800',
  }[invoice.status] || 'bg-gray-100 text-gray-800';

  const balanceDue = (invoice.total || 0) - (invoice.amount_paid || 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Portal
          </Button>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            {balanceDue > 0 && invoice.status !== 'paid' && (
              <Button onClick={handlePayNow} className="bg-green-600 hover:bg-green-700">
                <CreditCard className="h-4 w-4 mr-2" />
                Pay Now - ${balanceDue.toFixed(2)}
              </Button>
            )}
          </div>
        </div>

        {/* Invoice Details */}
        <Card className="backdrop-blur-md bg-white/80 border-0 shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl font-bold">{invoice.invoice_number}</CardTitle>
                <p className="text-gray-600 mt-1">{invoice.title || 'Service Invoice'}</p>
              </div>
              <Badge className={statusColor}>
                {invoice.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Payment Status */}
            {balanceDue > 0 && invoice.status !== 'paid' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-yellow-800">Payment Required</h3>
                    <p className="text-sm text-yellow-700">
                      Balance due: ${balanceDue.toFixed(2)}
                      {invoice.due_date && (
                        <span className="ml-2">
                          • Due: {new Date(invoice.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </p>
                  </div>
                  <Button size="sm" onClick={handlePayNow} className="bg-green-600 hover:bg-green-700">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay Now
                  </Button>
                </div>
              </div>
            )}

            {/* Client & Company Info */}
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">From:</h3>
                <div className="text-sm text-gray-600">
                  <p className="font-medium">Your Service Company</p>
                  <p>123 Business St</p>
                  <p>San Francisco, CA 94103</p>
                  <p>(555) 123-4567</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Bill To:</h3>
                <div className="text-sm text-gray-600">
                  <p className="font-medium">{session?.name}</p>
                  <p>{session?.email}</p>
                </div>
              </div>
            </div>

            {/* Invoice Details */}
            <div className="border-t pt-6">
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Invoice Date</p>
                  <p className="font-medium">{new Date(invoice.created_at).toLocaleDateString()}</p>
                </div>
                {invoice.due_date && (
                  <div>
                    <p className="text-sm text-gray-600">Due Date</p>
                    <p className="font-medium">{new Date(invoice.due_date).toLocaleDateString()}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Amount Paid</p>
                  <p className="font-medium text-green-600">${(invoice.amount_paid || 0).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Balance Due</p>
                  <p className="font-bold text-lg text-red-600">${balanceDue.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Line Items */}
            {invoice.items && invoice.items.length > 0 && (
              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Services & Items</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="py-2 text-sm font-medium text-gray-600">Description</th>
                        <th className="py-2 text-sm font-medium text-gray-600 text-right">Qty</th>
                        <th className="py-2 text-sm font-medium text-gray-600 text-right">Rate</th>
                        <th className="py-2 text-sm font-medium text-gray-600 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.items.map((item: any, index: number) => (
                        <tr key={index} className="border-b">
                          <td className="py-3">
                            <p className="font-medium">{item.description || item.name}</p>
                          </td>
                          <td className="py-3 text-right">{item.quantity}</td>
                          <td className="py-3 text-right">${(item.unitPrice || item.price || 0).toFixed(2)}</td>
                          <td className="py-3 text-right font-medium">${(item.total || (item.quantity * (item.unitPrice || item.price || 0))).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="mt-6 border-t pt-4">
                  <div className="flex justify-end">
                    <div className="w-64 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span>${invoice.subtotal?.toFixed(2) || '0.00'}</span>
                      </div>
                      {invoice.tax_amount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tax ({invoice.tax_rate}%):</span>
                          <span>${invoice.tax_amount?.toFixed(2) || '0.00'}</span>
                        </div>
                      )}
                      <div className="flex justify-between border-t pt-2 font-bold">
                        <span>Total:</span>
                        <span>${invoice.total?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex justify-between text-green-600">
                        <span>Paid:</span>
                        <span>-${(invoice.amount_paid || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2 font-bold text-lg">
                        <span>Balance Due:</span>
                        <span className="text-red-600">${balanceDue.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            {invoice.notes && (
              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{invoice.notes}</p>
              </div>
            )}

            {/* Terms */}
            {invoice.terms && (
              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-900 mb-2">Terms & Conditions</h3>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{invoice.terms}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
