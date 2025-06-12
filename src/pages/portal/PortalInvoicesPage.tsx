
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Download, Calendar, CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/utils';

interface PortalInvoice {
  id: string;
  invoice_number: string;
  total: number;
  amount_paid: number;
  balance: number;
  status: string;
  issue_date: string;
  due_date?: string;
  job: {
    id: string;
    title: string;
  };
}

export const PortalInvoicesPage = () => {
  const [invoices, setInvoices] = useState<PortalInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      // For now, fetch all invoices. In production, this would be filtered by client
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          jobs:job_id(id, title)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to handle the job relationship correctly
      const transformedData = (data || []).map(invoice => ({
        ...invoice,
        amount_paid: invoice.amount_paid || 0,
        balance: (invoice.total || 0) - (invoice.amount_paid || 0),
        job: {
          id: invoice.job_id,
          title: Array.isArray(invoice.jobs) 
            ? invoice.jobs[0]?.title || `Job ${invoice.job_id}`
            : invoice.jobs?.title || `Job ${invoice.job_id}`
        }
      }));

      setInvoices(transformedData);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStatusBadge = (status: string, balance: number) => {
    let config = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      unpaid: 'bg-red-100 text-red-800',
      partial: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };

    // Override status based on balance for better accuracy
    let displayStatus = status;
    if (balance <= 0 && status !== 'cancelled') {
      displayStatus = 'paid';
    } else if (balance > 0 && balance < (invoices.find(i => i.status === status)?.total || 0)) {
      displayStatus = 'partial';
    }

    return (
      <Badge className={config[displayStatus as keyof typeof config] || config.draft}>
        {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
      </Badge>
    );
  };

  const isOverdue = (dueDate: string | undefined, status: string) => {
    if (!dueDate || status === 'paid' || status === 'cancelled') return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Your Invoices</h1>
        <p className="text-muted-foreground mt-2">
          View and pay your service invoices
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : invoices.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <h3 className="text-lg font-medium mb-2">No invoices found</h3>
            <p className="text-muted-foreground">
              You don't have any invoices yet. Check back later or contact us if you expect to see invoices here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {invoices.map((invoice) => (
            <Card key={invoice.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{invoice.invoice_number}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {invoice.job.title}
                    </p>
                    {isOverdue(invoice.due_date, invoice.status) && (
                      <Badge variant="destructive" className="mt-2">
                        Overdue
                      </Badge>
                    )}
                  </div>
                  <div className="text-right">
                    {renderStatusBadge(invoice.status, invoice.balance)}
                    <div className="text-2xl font-bold mt-2">
                      {formatCurrency(invoice.total)}
                    </div>
                    {invoice.amount_paid > 0 && (
                      <p className="text-sm text-green-600">
                        Paid: {formatCurrency(invoice.amount_paid)}
                      </p>
                    )}
                    {invoice.balance > 0 && (
                      <p className="text-sm text-red-600">
                        Balance: {formatCurrency(invoice.balance)}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Issued {new Date(invoice.issue_date).toLocaleDateString()}
                    </div>
                    {invoice.due_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Due {new Date(invoice.due_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                    {invoice.balance > 0 && (
                      <Button size="sm">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Pay Now
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
