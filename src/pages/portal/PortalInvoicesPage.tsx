
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PortalLayout } from '@/components/portal/PortalLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useClientPortalAuth } from '@/hooks/useClientPortalAuth';
import { supabase } from '@/integrations/supabase/client';
import { Receipt, Calendar, DollarSign, Eye, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

interface Invoice {
  id: string;
  invoice_number: string;
  status: string;
  total: number;
  amount_paid: number;
  balance: number;
  date: string;
  due_date?: string;
  created_at: string;
  job_id: string;
  job_title: string;
  notes?: string;
}

export default function PortalInvoicesPage() {
  const { user } = useClientPortalAuth();
  const [searchParams] = useSearchParams();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const invoiceId = searchParams.get('id');
  const jobId = searchParams.get('jobId');

  useEffect(() => {
    if (user) {
      fetchInvoices();
    }
  }, [user, invoiceId, jobId]);

  const fetchInvoices = async () => {
    if (!user?.clientId) return;

    try {
      setLoading(true);
      
      let query = supabase
        .from('invoices')
        .select(`
          id,
          invoice_number,
          status,
          total,
          amount_paid,
          date,
          due_date,
          created_at,
          job_id,
          notes,
          jobs!inner(
            id,
            title,
            client_id
          )
        `)
        .eq('jobs.client_id', user.clientId)
        .order('created_at', { ascending: false });

      if (invoiceId) {
        query = query.eq('id', invoiceId);
      }

      if (jobId) {
        query = query.eq('job_id', jobId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching invoices:', error);
        toast.error('Failed to load invoices');
        return;
      }

      const formattedInvoices = (data || []).map(invoice => ({
        ...invoice,
        job_title: Array.isArray(invoice.jobs) ? invoice.jobs[0]?.title : invoice.jobs?.title,
        amount_paid: invoice.amount_paid || 0,
        balance: (invoice.total || 0) - (invoice.amount_paid || 0)
      }));

      setInvoices(formattedInvoices);

      if (invoiceId && formattedInvoices.length > 0) {
        setSelectedInvoice(formattedInvoices[0]);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'sent':
      case 'unpaid':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isOverdue = (invoice: Invoice) => {
    if (!invoice.due_date || invoice.status === 'paid') return false;
    return new Date(invoice.due_date) < new Date() && invoice.balance > 0;
  };

  if (loading) {
    return (
      <PortalLayout>
        <LoadingSkeleton type="card" />
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Invoices</h1>
          <p className="text-gray-600">
            {invoiceId ? 'Invoice details and payment' : 'View all your invoices and payment status'}
          </p>
        </div>

        {invoices.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
                <p className="text-gray-600">
                  {invoiceId || jobId ? 'No invoices found for this criteria.' : "You don't have any invoices yet."}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Invoices List */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">
                {invoices.length} Invoice{invoices.length !== 1 ? 's' : ''}
              </h2>
              
              {invoices.map((invoice) => (
                <Card 
                  key={invoice.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedInvoice?.id === invoice.id ? 'ring-2 ring-blue-500' : ''
                  } ${isOverdue(invoice) ? 'border-red-200' : ''}`}
                  onClick={() => setSelectedInvoice(invoice)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{invoice.invoice_number}</CardTitle>
                        <CardDescription className="mt-1">
                          Project: {invoice.job_title}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status}
                        </Badge>
                        {isOverdue(invoice) && (
                          <Badge className="bg-red-100 text-red-800">
                            Overdue
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(invoice.date)}</span>
                        </div>
                        <div className="flex items-center gap-2 font-semibold">
                          <DollarSign className="h-4 w-4" />
                          <span>${invoice.total.toFixed(2)}</span>
                        </div>
                      </div>
                      {invoice.balance > 0 && (
                        <div className="flex justify-between text-orange-600 font-medium">
                          <span>Balance Due:</span>
                          <span>${invoice.balance.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Invoice Details */}
            <div>
              {selectedInvoice ? (
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {selectedInvoice.invoice_number}
                      <div className="flex gap-2">
                        <Badge className={getStatusColor(selectedInvoice.status)}>
                          {selectedInvoice.status}
                        </Badge>
                        {isOverdue(selectedInvoice) && (
                          <Badge className="bg-red-100 text-red-800">
                            Overdue
                          </Badge>
                        )}
                      </div>
                    </CardTitle>
                    <CardDescription>
                      Project: {selectedInvoice.job_title}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Invoice Details</h4>
                      <div className="text-sm text-gray-600 space-y-2">
                        <div className="flex justify-between">
                          <span>Invoice Date:</span>
                          <span>{formatDate(selectedInvoice.date)}</span>
                        </div>
                        {selectedInvoice.due_date && (
                          <div className="flex justify-between">
                            <span>Due Date:</span>
                            <span className={isOverdue(selectedInvoice) ? 'text-red-600 font-medium' : ''}>
                              {formatDate(selectedInvoice.due_date)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between font-semibold text-lg">
                          <span>Total:</span>
                          <span>${selectedInvoice.total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Amount Paid:</span>
                          <span className="text-green-600">${selectedInvoice.amount_paid.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-semibold">
                          <span>Balance Due:</span>
                          <span className={selectedInvoice.balance > 0 ? 'text-orange-600' : 'text-green-600'}>
                            ${selectedInvoice.balance.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {selectedInvoice.notes && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                        <p className="text-sm text-gray-600">{selectedInvoice.notes}</p>
                      </div>
                    )}

                    <div className="pt-4 space-y-2">
                      <Button className="w-full" disabled>
                        <Eye className="h-4 w-4 mr-2" />
                        View Full Invoice
                      </Button>
                      {selectedInvoice.balance > 0 && (
                        <Button variant="outline" className="w-full" disabled>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Pay Invoice
                        </Button>
                      )}
                      <p className="text-xs text-gray-500 text-center">
                        Payment processing coming soon
                      </p>
                    </div>

                    {isOverdue(selectedInvoice) && (
                      <div className="bg-red-50 p-4 rounded-lg">
                        <h4 className="font-medium text-red-900 mb-2">Payment Overdue</h4>
                        <p className="text-sm text-red-800">
                          This invoice is past due. Please contact us to arrange payment or if you have any questions.
                        </p>
                      </div>
                    )}

                    {selectedInvoice.status === 'sent' && selectedInvoice.balance > 0 && !isOverdue(selectedInvoice) && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Payment Pending</h4>
                        <p className="text-sm text-blue-800">
                          This invoice is ready for payment. You can pay online or contact us for other payment options.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center text-gray-500">
                      <Receipt className="h-12 w-12 mx-auto mb-4" />
                      <p>Select an invoice to view details</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
