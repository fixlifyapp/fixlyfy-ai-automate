
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Payment } from "@/hooks/payments";
import { PaymentRow } from "./PaymentRow";

interface PaymentsTableProps {
  payments: Payment[];
  isLoading: boolean;
  onRefund: (payment: Payment) => void;
  onDelete: (payment: Payment) => void;
}

export const PaymentsTable = ({ payments, isLoading, onRefund, onDelete }: PaymentsTableProps) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map(i => (
          <Skeleton key={i} className="w-full h-16" />
        ))}
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No payments recorded yet. Add your first payment.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Method</TableHead>
          <TableHead>Reference</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((payment) => (
          <PaymentRow 
            key={payment.id}
            payment={payment}
            onRefund={onRefund}
            onDelete={onDelete}
          />
        ))}
      </TableBody>
    </Table>
  );
};
