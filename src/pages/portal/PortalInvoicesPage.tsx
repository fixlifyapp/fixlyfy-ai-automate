
import React, { useState, useEffect } from 'react';
import { PortalLayout } from '@/components/portal/PortalLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Eye, Download, Calendar, DollarSign, Loader2 } from 'lucide-react';
import { UnifiedDocumentPreview } from '@/components/jobs/dialogs/unified/UnifiedDocumentPreview';
import { useClientPortalAuth } from '@/hooks/useClientPortalAuth';
import { toast } from 'sonner';

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  taxable: boolean;
}

interface Invoice {
  id: string;
  invoice_number: string;
  date: string;
  due_date: string;
  status: string;
  total: number;
  amount_paid: number;
  balance: number;
  notes?: string;
  created_at: string;
  jobs: {
    id: string;
    title: string;
    description?: string;
    address?: string;
    clients: {
      id: string;
      name: string;
      email: string;
      phone: string;
      company?: string;
    };
  };
  lineItems: LineItem[];
}

const PortalInvoicesPage = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const { user } = useClientPortalAuth();

  useEffect(() => {
    if (user) {
      fetchInvoices();
    }
  }, [user]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      // TODO: Implement invoice fetching similar to estimates
      // For now, using mock data
      setInvoices([]);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPreviewOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <PortalLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading invoices...</span>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Invoices</h1>
          <p className="text-muted-foreground">
            View and pay your service invoices
          </p>
        </div>

        {invoices.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
                <p className="text-gray-500">You don't have any invoices yet.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {invoices.map((invoice) => (
              <Card key={invoice.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{invoice.invoice_number}</CardTitle>
                      <CardDescription>{invoice.jobs?.title || 'Service Invoice'}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(invoice.status)}>
                      {invoice.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{new Date(invoice.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Due: {new Date(invoice.due_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">${invoice.total?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Balance: ${invoice.balance?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                  
                  {invoice.jobs?.description && (
                    <p className="text-sm text-muted-foreground mb-4">{invoice.jobs.description}</p>
                  )}
                  
                  <div className="flex gap-2">
                    <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => handleViewInvoice(invoice)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
                        <DialogHeader>
                          <DialogTitle>Invoice Preview - {selectedInvoice?.invoice_number}</DialogTitle>
                        </DialogHeader>
                        <div className="overflow-auto max-h-[80vh]">
                          {selectedInvoice && (
                            <UnifiedDocumentPreview
                              documentType="invoice"
                              documentNumber={selectedInvoice.invoice_number}
                              lineItems={selectedInvoice.lineItems?.map(item => ({
                                id: item.id,
                                description: item.description,
                                quantity: item.quantity,
                                unitPrice: item.unit_price,
                                taxable: item.taxable,
                                name: item.description,
                                price: item.unit_price,
                                total: item.quantity * item.unit_price
                              })) || []}
                              taxRate={13}
                              calculateSubtotal={() => selectedInvoice.total - (selectedInvoice.total * 0.13)}
                              calculateTotalTax={() => selectedInvoice.total * 0.13}
                              calculateGrandTotal={() => selectedInvoice.total}
                              notes={selectedInvoice.notes || ''}
                              issueDate={new Date(selectedInvoice.date).toLocaleDateString()}
                              dueDate={new Date(selectedInvoice.due_date).toLocaleDateString()}
                            />
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                    
                    {invoice.status !== 'paid' && (
                      <Button size="sm">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Pay Now
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
};

export default PortalInvoicesPage;
