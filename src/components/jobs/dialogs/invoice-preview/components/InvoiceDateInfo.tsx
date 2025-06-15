
import { Calendar } from "lucide-react";
import { Invoice } from "@/hooks/useInvoices";

interface InvoiceDateInfoProps {
  invoice: Invoice;
}

export const InvoiceDateInfo = ({ invoice }: InvoiceDateInfoProps) => {
  return (
    <div className="grid grid-cols-2 gap-8 mb-8">
      <div>
        <div className="flex items-center gap-2 text-gray-700">
          <Calendar className="h-4 w-4" />
          <span className="font-medium">Invoice Date:</span>
          {new Date(invoice.date).toLocaleDateString()}
        </div>
      </div>
      <div>
        <div className="flex items-center gap-2 text-gray-700">
          <Calendar className="h-4 w-4" />
          <span className="font-medium">Due Date:</span>
          {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'Not set'}
        </div>
      </div>
    </div>
  );
};
