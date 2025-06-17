
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, Eye, Check, X } from 'lucide-react';
import { useClientPortal } from './ClientPortalProvider';

interface EstimateViewProps {
  estimateId: string;
  onBack: () => void;
}

export function ClientPortalEstimateView({ estimateId, onBack }: EstimateViewProps) {
  const { data, session } = useClientPortal();
  const [estimate, setEstimate] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (data?.estimates) {
      const foundEstimate = data.estimates.find((est: any) => est.id === estimateId);
      setEstimate(foundEstimate);
      setLoading(false);
    }
  }, [data, estimateId]);

  const handleApprove = async () => {
    console.log('Approving estimate:', estimateId);
    // TODO: Implement estimate approval
  };

  const handleReject = async () => {
    console.log('Rejecting estimate:', estimateId);
    // TODO: Implement estimate rejection
  };

  const handleDownload = () => {
    console.log('Downloading estimate:', estimateId);
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

  if (!estimate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Estimate Not Found</h1>
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
    'approved': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800',
  }[estimate.status] || 'bg-gray-100 text-gray-800';

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
            {estimate.status === 'sent' && (
              <>
                <Button variant="outline" onClick={handleReject} className="text-red-600 border-red-600">
                  <X className="h-4 w-4 mr-2" />
                  Decline
                </Button>
                <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
                  <Check className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Estimate Details */}
        <Card className="backdrop-blur-md bg-white/80 border-0 shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl font-bold">{estimate.estimate_number}</CardTitle>
                <p className="text-gray-600 mt-1">{estimate.title || 'Service Estimate'}</p>
              </div>
              <Badge className={statusColor}>
                {estimate.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
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
                <h3 className="font-semibold text-gray-900 mb-2">To:</h3>
                <div className="text-sm text-gray-600">
                  <p className="font-medium">{session?.name}</p>
                  <p>{session?.email}</p>
                </div>
              </div>
            </div>

            {/* Estimate Details */}
            <div className="border-t pt-6">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Estimate Date</p>
                  <p className="font-medium">{new Date(estimate.created_at).toLocaleDateString()}</p>
                </div>
                {estimate.valid_until && (
                  <div>
                    <p className="text-sm text-gray-600">Valid Until</p>
                    <p className="font-medium">{new Date(estimate.valid_until).toLocaleDateString()}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="font-bold text-lg text-blue-600">${estimate.total?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
            </div>

            {/* Line Items */}
            {estimate.items && estimate.items.length > 0 && (
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
                      {estimate.items.map((item: any, index: number) => (
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
                        <span>${estimate.subtotal?.toFixed(2) || '0.00'}</span>
                      </div>
                      {estimate.tax_amount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tax ({estimate.tax_rate}%):</span>
                          <span>${estimate.tax_amount?.toFixed(2) || '0.00'}</span>
                        </div>
                      )}
                      <div className="flex justify-between border-t pt-2 font-bold text-lg">
                        <span>Total:</span>
                        <span className="text-blue-600">${estimate.total?.toFixed(2) || '0.00'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            {estimate.notes && (
              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{estimate.notes}</p>
              </div>
            )}

            {/* Terms */}
            {estimate.terms && (
              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-900 mb-2">Terms & Conditions</h3>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{estimate.terms}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
