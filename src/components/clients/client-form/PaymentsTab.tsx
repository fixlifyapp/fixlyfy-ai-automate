
import { Card } from "@/components/ui/card";
import { useClientPayments } from "./hooks/useClientPayments";
import { EmptyTabContent } from "./EmptyTabContent";
import { Loader } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface PaymentsTabProps {
  clientId?: string;
  onCreateInvoice: () => void;
}

export const PaymentsTab = ({ clientId, onCreateInvoice }: PaymentsTabProps) => {
  const { payments, isLoading } = useClientPayments(clientId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader size={32} className="animate-spin text-fixlyfy mr-2" />
        <span>Loading payment history...</span>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <EmptyTabContent 
        message="No payments found for this client."
        actionLabel="Create First Invoice"
        onAction={onCreateInvoice}
      />
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium mb-4">Payment History</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b">
              <th className="pb-2">Date</th>
              <th className="pb-2">Invoice #</th>
              <th className="pb-2">Amount</th>
              <th className="pb-2">Method</th>
              <th className="pb-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {payments.map((payment) => (
              <tr key={payment.id} className="hover:bg-muted/30">
                <td className="py-3">
                  <div>{new Date(payment.date).toLocaleDateString()}</div>
                  <div className="text-xs text-fixlyfy-text-secondary">
                    {formatDistanceToNow(new Date(payment.date), { addSuffix: true })}
                  </div>
                </td>
                <td className="py-3">{payment.invoices?.invoice_number || 'N/A'}</td>
                <td className="py-3">${payment.amount.toFixed(2)}</td>
                <td className="py-3">
                  {payment.method === 'credit-card' ? 'Credit Card' : 
                   payment.method === 'cash' ? 'Cash' : 
                   payment.method === 'e-transfer' ? 'E-transfer' : payment.method}
                </td>
                <td className="py-3">
                  <Badge 
                    className={
                      payment.status === 'paid' 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                        : payment.status === 'refunded'
                        ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }
                  >
                    {payment.status === 'paid' ? 'Completed' : 
                     payment.status === 'refunded' ? 'Refunded' : payment.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
