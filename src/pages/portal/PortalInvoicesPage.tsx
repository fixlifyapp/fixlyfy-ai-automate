
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
  balance: number;
  status: string;
  created_at: string;
  due_date?: string;
  job_id: string;
  job?: {
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
      // Fetch invoices with job data separately to avoid relation issues
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (invoicesError) throw invoicesError;

      if (invoicesData && invoicesData.length > 0) {
        // Get unique job IDs
        const jobIds = [...new Set(invoicesData.map(inv => inv.job_id))];
        
        // Fetch job data separately
        const { data: jobsData, error: jobsError } = await supabase
          .from('jobs')
          .select('id, title')
          .in('id', jobIds);

        if (jobsError) {
          console.warn('Could not fetch job data:', jobsError);
        }

        // Combine invoices with job data
        const invoicesWithJobs = invoicesData.map(invoice => ({
          ...invoice,
          job: jobsData?.find(job => job.id === invoice.job_id) || {
            id: invoice.job_id,
            title: `Job ${invoice.job_id}`
          }
        }));

        setInvoices(invoicesWithJobs);
      } else {
        setInvoices([]);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setInvoices([]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStatusBadge = (status: string) => {
    const config = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      partial: 'bg-yellow-100 text-yellow-800'
    };

    return (
      <Badge className={config[status as keyof typeof config] || config.draft}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Your Invoices</h1>
        <p className="text-muted-foreground mt-2">
          View and manage your service invoices
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
              You don't have any invoices yet. Completed work will appear here.
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
                      {invoice.job?.title || `Job ${invoice.job_id}`}
                    </p>
                  </div>
                  <div className="text-right">
                    {renderStatusBadge(invoice.status)}
                    <div className="text-2xl font-bold mt-2">
                      {formatCurrency(invoice.total)}
                    </div>
                    {invoice.balance > 0 && (
                      <div className="text-sm text-muted-foreground">
                        Balance: {formatCurrency(invoice.balance)}
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Created {new Date(invoice.created_at).toLocaleDateString()}
                    </div>
                    {invoice.due_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Due {new Date(invoice.due_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {invoice.balance > 0 && (
                      <Button size="sm">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Pay Now
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
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

export default PortalInvoicesPage;
