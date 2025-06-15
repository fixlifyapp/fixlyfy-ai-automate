
import { formatCurrency } from '@/lib/utils';
import { getStatusColor } from '@/utils/invoiceStatusUtils';

interface Invoice {
  status: string;
  title: string;
  description: string;
  total: number;
  amount_paid: number;
}

interface InvoiceStatusSectionProps {
  invoice: Invoice;
}

export const InvoiceStatusSection = ({ invoice }: InvoiceStatusSectionProps) => {
  return (
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
  );
};
