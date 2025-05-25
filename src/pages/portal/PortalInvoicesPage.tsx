
import { useEffect, useState } from "react";
import { useClientPortalAuth } from "@/hooks/useClientPortalAuth";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CreditCard, Download, Eye, DollarSign } from "lucide-react";

interface Invoice {
  id: string;
  invoice_number: string;
  total: number;
  amount_paid: number;
  balance: number;
  status: string;
  notes?: string;
  date: string;
  job_id: string;
}

export default function PortalInvoicesPage() {
  const { user } = useClientPortalAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchInvoices();
    }
  }, [user]);

  const fetchInvoices = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // First get job IDs for this client
      const { data: jobs } = await supabase
        .from('jobs')
        .select('id')
        .eq('client_id', user.clientId);

      if (!jobs || jobs.length === 0) {
        setInvoices([]);
        return;
      }

      const jobIds = jobs.map(job => job.id);

      // Fetch invoices for these jobs
      const { data: invoicesData, error } = await supabase
        .from('invoices')
        .select('*')
        .in('job_id', jobIds)
        .order('date', { ascending: false });

      if (error) {
        throw error;
      }

      setInvoices(invoicesData || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Failed to load invoices');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'unpaid': return 'bg-red-100 text-red-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Paid';
      case 'unpaid': return 'Unpaid';
      case 'partial': return 'Partially Paid';
      case 'overdue': return 'Overdue';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const handleDownloadInvoice = async (invoice: Invoice) => {
    try {
      // This would typically call an edge function to generate and return a PDF
      toast.info('PDF download feature coming soon');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('Failed to download invoice');
    }
  };

  const totalOwed = invoices
    .filter(inv => inv.status === 'unpaid' || inv.status === 'partial')
    .reduce((sum, inv) => sum + (inv.balance || 0), 0);

  const totalPaid = invoices.reduce((sum, inv) => sum + (inv.amount_paid || 0), 0);

  if (isLoading) {
    return (
      <PortalLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Invoices</h1>
          <p className="text-gray-600">View your invoices and payment history</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${totalPaid.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Amount Owed</CardTitle>
              <DollarSign className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">${totalOwed.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{invoices.length}</div>
            </CardContent>
          </Card>
        </div>

        {invoices.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices yet</h3>
              <p className="text-gray-600">Your invoices will appear here once they're created.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {invoices.map((invoice) => (
              <Card key={invoice.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{invoice.invoice_number}</CardTitle>
                      <CardDescription>
                        Invoice date: {new Date(invoice.date).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(invoice.status)}>
                        {getStatusText(invoice.status)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="text-lg font-semibold">${invoice.total?.toFixed(2) || '0.00'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Amount Paid</p>
                      <p className="text-lg font-semibold text-green-600">
                        ${invoice.amount_paid?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Balance Due</p>
                      <p className="text-lg font-semibold text-red-600">
                        ${invoice.balance?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  </div>

                  {invoice.notes && (
                    <p className="text-gray-600 mb-4">{invoice.notes}</p>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleDownloadInvoice(invoice)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                    {(invoice.status === 'unpaid' || invoice.status === 'partial') && (
                      <Button
                        onClick={() => toast.info('Online payment feature coming soon')}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Pay Online
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
