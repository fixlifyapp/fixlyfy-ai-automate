import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Send } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';

interface Invoice {
  id: string;
  invoice_number: string;
  job_id: string;
  client_id: string;
  title: string;
  description: string;
  status: string;
  total: number;
  amount_paid: number;
  issue_date: string;
  due_date: string;
  notes: string;
  items: any[];
  created_at: string;
}

interface Job {
  id: string;
  title: string;
  client_id: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

export default function InvoiceViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchInvoiceData();
    }
  }, [id]);

  const fetchInvoiceData = async () => {
    try {
      setIsLoading(true);

      // Fetch invoice
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', id)
        .single();

      if (invoiceError) throw invoiceError;

      // Parse items field properly - handle both string and array cases
      let parsedItems: any[] = [];
      if (invoiceData.items) {
        if (typeof invoiceData.items === 'string') {
          try {
            parsedItems = JSON.parse(invoiceData.items);
          } catch (e) {
            console.warn('Failed to parse invoice items JSON:', e);
            parsedItems = [];
          }
        } else if (Array.isArray(invoiceData.items)) {
          parsedItems = invoiceData.items;
        }
      }

      const formattedInvoice: Invoice = {
        ...invoiceData,
        items: parsedItems
      };

      setInvoice(formattedInvoice);

      // Fetch job details
      if (invoiceData.job_id) {
        const { data: jobData, error: jobError } = await supabase
          .from('jobs')
          .select('*')
          .eq('id', invoiceData.job_id)
          .single();

        if (!jobError) {
          setJob(jobData);

          // Fetch client details
          if (jobData.client_id) {
            const { data: clientData, error: clientError } = await supabase
              .from('clients')
              .select('*')
              .eq('id', jobData.client_id)
              .single();

            if (!clientError) {
              setClient(clientData);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching invoice data:', error);
      toast.error('Failed to load invoice');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'text-green-600 bg-green-100';
      case 'partial':
        return 'text-yellow-600 bg-yellow-100';
      case 'unpaid':
        return 'text-red-600 bg-red-100';
      case 'draft':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invoice Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              The invoice you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button onClick={() => navigate('/invoices')} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Invoices
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/invoices')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Invoices
          </Button>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Invoice {invoice.invoice_number}
              </h1>
              <p className="text-gray-600 mt-2">
                Created on {new Date(invoice.created_at).toLocaleDateString()}
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button>
                <Send className="h-4 w-4 mr-2" />
                Send Invoice
              </Button>
            </div>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-8 py-6">
            {/* Status and Basic Info */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invoice.status)}`}>
                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                </div>
                <h2 className="text-2xl font-bold mt-4">{invoice.title}</h2>
                {invoice.description && (
                  <p className="text-gray-600 mt-2">{invoice.description}</p>
                )}
              </div>
              
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">
                  {formatCurrency(invoice.total)}
                </div>
                {invoice.amount_paid > 0 && (
                  <div className="text-sm text-green-600 mt-1">
                    Paid: {formatCurrency(invoice.amount_paid)}
                  </div>
                )}
                {invoice.total - invoice.amount_paid > 0 && (
                  <div className="text-sm text-red-600">
                    Due: {formatCurrency(invoice.total - invoice.amount_paid)}
                  </div>
                )}
              </div>
            </div>

            {/* Client and Job Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {client && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Bill To</h3>
                  <div className="text-gray-600">
                    <p className="font-medium text-gray-900">{client.name}</p>
                    {client.address && <p>{client.address}</p>}
                    {client.city && client.state && (
                      <p>{client.city}, {client.state} {client.zip}</p>
                    )}
                    {client.email && <p>{client.email}</p>}
                    {client.phone && <p>{client.phone}</p>}
                  </div>
                </div>
              )}
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Invoice Details</h3>
                <div className="text-gray-600 space-y-1">
                  <p><span className="font-medium">Invoice #:</span> {invoice.invoice_number}</p>
                  <p><span className="font-medium">Issue Date:</span> {new Date(invoice.issue_date).toLocaleDateString()}</p>
                  {invoice.due_date && (
                    <p><span className="font-medium">Due Date:</span> {new Date(invoice.due_date).toLocaleDateString()}</p>
                  )}
                  {job && (
                    <p><span className="font-medium">Job:</span> {job.title}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Line Items */}
            {invoice.items && invoice.items.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Items</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Description</th>
                        <th className="text-right py-2">Qty</th>
                        <th className="text-right py-2">Rate</th>
                        <th className="text-right py-2">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.items.map((item: any, index: number) => (
                        <tr key={index} className="border-b">
                          <td className="py-3">{item.description}</td>
                          <td className="text-right py-3">{item.quantity}</td>
                          <td className="text-right py-3">{formatCurrency(item.unitPrice || item.price || 0)}</td>
                          <td className="text-right py-3">{formatCurrency((item.quantity || 1) * (item.unitPrice || item.price || 0))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="flex justify-end mt-4">
                  <div className="w-64">
                    <div className="flex justify-between py-2">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(invoice.total)}</span>
                    </div>
                    <div className="flex justify-between py-2 font-bold text-lg border-t">
                      <span>Total:</span>
                      <span>{formatCurrency(invoice.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            {invoice.notes && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Notes</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{invoice.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
