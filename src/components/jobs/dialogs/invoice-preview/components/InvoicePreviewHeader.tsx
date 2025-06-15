
import { Calendar } from "lucide-react";
import { Invoice } from "@/hooks/useInvoices";

interface InvoicePreviewHeaderProps {
  invoice: Invoice;
}

export const InvoicePreviewHeader = ({ invoice }: InvoicePreviewHeaderProps) => {
  return (
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h1>
      <div className="text-lg text-gray-600">
        #{invoice.invoice_number}
      </div>
    </div>
  );
};
