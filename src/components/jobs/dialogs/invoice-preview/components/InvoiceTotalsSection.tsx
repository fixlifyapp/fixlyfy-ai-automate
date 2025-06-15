
import { formatCurrency } from "@/lib/utils";
import { Invoice } from "@/hooks/useInvoices";

interface InvoiceTotalsSectionProps {
  invoice: Invoice;
  subtotal: number;
  tax: number;
}

export const InvoiceTotalsSection = ({ invoice, subtotal, tax }: InvoiceTotalsSectionProps) => {
  return (
    <div className="flex justify-end mb-8">
      <div className="w-64">
        <div className="space-y-2">
          <div className="flex justify-between text-gray-700">
            <span>Subtotal:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Tax (13%):</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-between font-semibold text-lg border-t pt-2">
            <span>Total:</span>
            <span>{formatCurrency(invoice.total || 0)}</span>
          </div>
          {invoice.amount_paid > 0 && (
            <>
              <div className="flex justify-between text-gray-700">
                <span>Amount Paid:</span>
                <span>{formatCurrency(invoice.amount_paid)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span>Balance Due:</span>
                <span>{formatCurrency(invoice.balance || 0)}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
