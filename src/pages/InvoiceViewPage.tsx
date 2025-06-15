
import { useParams, useNavigate } from 'react-router-dom';
import { useInvoiceViewData } from '@/hooks/useInvoiceViewData';
import { InvoiceViewHeader } from '@/components/invoice/InvoiceViewHeader';
import { InvoiceStatusSection } from '@/components/invoice/InvoiceStatusSection';
import { InvoiceDetailsSection } from '@/components/invoice/InvoiceDetailsSection';
import { InvoiceLineItems } from '@/components/invoice/InvoiceLineItems';
import { InvoiceViewLoading } from '@/components/invoice/InvoiceViewLoading';
import { InvoiceNotFound } from '@/components/invoice/InvoiceNotFound';

export default function InvoiceViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { invoice, job, client, isLoading } = useInvoiceViewData(id);

  const handleBack = () => navigate('/invoices');

  if (isLoading) {
    return <InvoiceViewLoading />;
  }

  if (!invoice) {
    return <InvoiceNotFound onBack={handleBack} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <InvoiceViewHeader
          invoiceNumber={invoice.invoice_number}
          createdAt={invoice.created_at}
          onBack={handleBack}
        />

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-8 py-6">
            <InvoiceStatusSection invoice={invoice} />
            
            <InvoiceDetailsSection 
              client={client} 
              job={job} 
              invoice={invoice} 
            />

            <InvoiceLineItems 
              items={invoice.items} 
              total={invoice.total} 
            />

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
