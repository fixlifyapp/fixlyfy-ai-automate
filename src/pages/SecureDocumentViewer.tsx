
import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, FileText, Shield, Calendar, MapPin, Phone, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DocumentData {
  id: string;
  document_type: 'estimate' | 'invoice';
  estimate_number?: string;
  invoice_number?: string;
  total: number;
  subtotal: number;
  tax_amount: number;
  status: string;
  created_at: string;
  valid_until?: string;
  due_date?: string;
  amount_paid?: number;
  line_items: Array<{
    id: string;
    description: string;
    quantity: number;
    unit_price: number;
    taxable: boolean;
  }>;
}

interface JobData {
  id: string;
  title: string;
  description?: string;
  address?: string;
  created_at: string;
}

interface ClientData {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
}

interface CompanyData {
  company_name: string;
  company_address?: string;
  company_city?: string;
  company_state?: string;
  company_zip?: string;
  company_phone?: string;
  company_email?: string;
}

export default function SecureDocumentViewer() {
  const { token } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [documentData, setDocumentData] = useState<DocumentData | null>(null);
  const [jobData, setJobData] = useState<JobData | null>(null);
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);

  useEffect(() => {
    if (token) {
      fetchDocumentData();
    }
  }, [token]);

  const fetchDocumentData = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('secure-document-viewer', {
        body: { token }
      });

      if (error) {
        throw new Error(error.message || 'Failed to load document');
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to load document');
      }

      setDocumentData(data.document);
      setJobData(data.job);
      setClientData(data.client);
      setCompanyData(data.company);
    } catch (err: any) {
      console.error('Error fetching document:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error || !documentData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">
              {error || 'This document link is invalid or has expired.'}
            </p>
            <p className="text-sm text-gray-500">
              Please contact the company for a new link if needed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isEstimate = documentData.document_type === 'estimate';
  const documentNumber = isEstimate ? documentData.estimate_number : documentData.invoice_number;
  const documentTitle = isEstimate ? 'Estimate' : 'Invoice';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-6 w-6 text-green-600" />
            <span className="text-sm text-green-600 font-medium">Secure Document View</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{documentTitle} #{documentNumber}</h1>
          {companyData?.company_name && (
            <p className="text-lg text-gray-600 mt-2">From {companyData.company_name}</p>
          )}
        </div>

        {/* Document Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {documentTitle} Details
              </CardTitle>
              <Badge variant={documentData.status === 'approved' ? 'default' : 'secondary'}>
                {documentData.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Document Info */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Document Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{documentTitle} Number:</span>
                    <span className="font-medium">{documentNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date Created:</span>
                    <span>{new Date(documentData.created_at).toLocaleDateString()}</span>
                  </div>
                  {isEstimate && documentData.valid_until && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Valid Until:</span>
                      <span>{new Date(documentData.valid_until).toLocaleDateString()}</span>
                    </div>
                  )}
                  {!isEstimate && documentData.due_date && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Due Date:</span>
                      <span>{new Date(documentData.due_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Company Info */}
              {companyData && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Company Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="font-medium">{companyData.company_name}</div>
                    {companyData.company_address && (
                      <div className="flex items-start gap-1">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div>{companyData.company_address}</div>
                          {companyData.company_city && (
                            <div>
                              {companyData.company_city}, {companyData.company_state} {companyData.company_zip}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {companyData.company_phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{companyData.company_phone}</span>
                      </div>
                    )}
                    {companyData.company_email && (
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>{companyData.company_email}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Job Information */}
            {jobData && (
              <div className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-3">Job Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="font-medium mb-1">{jobData.title}</div>
                  {jobData.description && (
                    <div className="text-gray-600 text-sm mb-2">{jobData.description}</div>
                  )}
                  {jobData.address && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      {jobData.address}
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Description</th>
                    <th className="text-right py-2">Qty</th>
                    <th className="text-right py-2">Unit Price</th>
                    <th className="text-right py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {documentData.line_items.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="py-2">{item.description}</td>
                      <td className="text-right py-2">{item.quantity}</td>
                      <td className="text-right py-2">${item.unit_price.toFixed(2)}</td>
                      <td className="text-right py-2">
                        ${(item.quantity * item.unit_price).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Totals */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>${documentData.subtotal.toFixed(2)}</span>
              </div>
              {documentData.tax_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Tax:</span>
                  <span>${documentData.tax_amount.toFixed(2)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total:</span>
                <span>${documentData.total.toFixed(2)}</span>
              </div>
              {!isEstimate && documentData.amount_paid && documentData.amount_paid > 0 && (
                <>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Amount Paid:</span>
                    <span>-${documentData.amount_paid.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold text-red-600">
                    <span>Amount Due:</span>
                    <span>${(documentData.total - documentData.amount_paid).toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>This is a secure view of your {documentTitle.toLowerCase()}.</p>
          <p>If you have questions, please contact {companyData?.company_name || 'the company'} directly.</p>
        </div>
      </div>
    </div>
  );
}
