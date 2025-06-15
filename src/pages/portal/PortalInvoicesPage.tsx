
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Receipt, Eye, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PortalInvoice {
  id: string;
  invoice_number: string;
  total: number;
  amount_paid: number;
  balance: number;
  status: string;
  created_at: string;
  due_date?: string;
  job_title?: string;
}

export const PortalInvoicesPage = () => {
  const [invoices, setInvoices] = useState<PortalInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      // Get client session from localStorage or URL params
      const sessionToken = localStorage.getItem('client_session_token') || 
                           new URLSearchParams(window.location.search).get('token');
      
      if (!sessionToken) {
        toast.error('Session not found');
        return;
      }

      // Validate session and get client info
      const { data: sessionData, error: sessionError } = await supabase
        .rpc('validate_client_session', { p_session_token: sessionToken });

      if (sessionError || !sessionData?.[0]) {
        toast.error('Invalid session');
        return;
      }

      const clientId = sessionData[0].client_id;

      // Fetch invoices for client's jobs
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('id, title')
        .eq('client_id', clientId);

      if (jobsError) throw jobsError;

      if (!jobsData || jobsData.length === 0) {
        setInvoices([]);
        return;
      }

      const jobIds = jobsData.map(job => job.id);

      // Fetch invoices for these jobs
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select('*')
        .in('job_id', jobIds)
        .order('created_at', { ascending: false });

      if (invoicesError) throw invoicesError;

      // Map invoices with job titles and calculate balance
      const invoicesWithJobTitles: PortalInvoice[] = (invoicesData || []).map(invoice => {
        const job = jobsData.find(j => j.id === invoice.job_id);
        const balance = (invoice.total || 0) - (invoice.amount_paid || 0);
        
        return {
          id: invoice.id,
          invoice_number: invoice.invoice_number,
          total: invoice.total,
          amount_paid: invoice.amount_paid || 0,
          balance: balance,
          status: invoice.status,
          created_at: invoice.created_at,
          due_date: invoice.due_date,
          job_title: job?.title || 'Unknown Job'
        };
      });

      setInvoices(invoicesWithJobTitles);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleViewInvoice = (invoiceId: string) => {
    window.open(`/invoices/${invoiceId}`, '_blank');
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      unpaid: 'bg-red-100 text-red-800',
      partial: 'bg-yellow-100 text-yellow-800'
    };

    return (
      <Badge className={colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Receipt className="h-6 w-6" />
        <h1 className="text-2xl font-bold">My Invoices</h1>
      </div>

      {invoices.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Receipt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium">No invoices found</p>
            <p className="text-muted-foreground">You don't have any invoices at this time.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {invoices.map((invoice) => (
            <Card key={invoice.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Receipt className="h-5 w-5" />
                    <span>Invoice {invoice.invoice_number}</span>
                    {getStatusBadge(invoice.status)}
                  </div>
                  <span className="text-xl font-bold">
                    {formatCurrency(invoice.total)}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Job: {invoice.job_title}
                    </p>
                    <p className="text-sm text-muted-foreground mb-1">
                      Created: {new Date(invoice.created_at).toLocaleDateString()}
                    </p>
                    {invoice.due_date && (
                      <p className="text-sm text-muted-foreground mb-1">
                        Due: {new Date(invoice.due_date).toLocaleDateString()}
                      </p>
                    )}
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
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewInvoice(invoice.id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    {invoice.balance > 0 && (
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
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
