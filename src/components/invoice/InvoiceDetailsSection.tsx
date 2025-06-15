
import { Calendar, User, MapPin } from 'lucide-react';

interface Client {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  email: string;
  phone: string;
}

interface Job {
  title: string;
}

interface Invoice {
  invoice_number: string;
  issue_date: string;
  due_date: string;
}

interface InvoiceDetailsSectionProps {
  client: Client | null;
  job: Job | null;
  invoice: Invoice;
}

export const InvoiceDetailsSection = ({ 
  client, 
  job, 
  invoice 
}: InvoiceDetailsSectionProps) => {
  return (
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
  );
};
