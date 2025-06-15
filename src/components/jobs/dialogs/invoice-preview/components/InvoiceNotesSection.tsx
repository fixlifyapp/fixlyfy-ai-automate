
import { Invoice } from "@/hooks/useInvoices";

interface InvoiceNotesSectionProps {
  invoice: Invoice;
}

export const InvoiceNotesSection = ({ invoice }: InvoiceNotesSectionProps) => {
  if (!invoice.notes) return null;

  return (
    <div className="mb-8">
      <h3 className="font-semibold text-gray-900 mb-3">Notes:</h3>
      <div className="text-gray-700 bg-gray-50 p-4 rounded-lg">
        {invoice.notes}
      </div>
    </div>
  );
};
