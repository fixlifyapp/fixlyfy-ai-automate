
import { useState } from "react";
import { format } from "date-fns";
import { PageLayout } from "@/components/layout/PageLayout";
import { PaymentsTable } from "@/components/finance/PaymentsTable";
import { PaymentsFilters } from "@/components/finance/PaymentsFilters";
import { RefundDialog } from "@/components/finance/dialogs/RefundDialog";
import { useRBAC } from "@/components/auth/RBACProvider";
import { payments as initialPayments } from "@/data/payments";
import { Payment, PaymentMethod } from "@/types/payment";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function FinancePage() {
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>(initialPayments);
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const { hasPermission } = useRBAC();

  const handleRefund = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsRefundDialogOpen(true);
  };

  const processRefund = (paymentId: string, notes?: string) => {
    setPayments(prevPayments =>
      prevPayments.map(payment =>
        payment.id === paymentId
          ? { ...payment, status: "refunded", notes: notes || payment.notes }
          : payment
      )
    );
    setFilteredPayments(prevPayments =>
      prevPayments.map(payment =>
        payment.id === paymentId
          ? { ...payment, status: "refunded", notes: notes || payment.notes }
          : payment
      )
    );
    toast.success("Payment successfully refunded");
  };

  const handleExportCSV = () => {
    // In a real app, this would generate and download a CSV file
    toast.success("Exporting payments data to CSV");
    console.log("Exporting payments:", filteredPayments);
  };

  const applyFilters = (
    startDate: Date | undefined,
    endDate: Date | undefined,
    method: PaymentMethod | "all",
    technician: string | "all",
    client: string | "all"
  ) => {
    let filtered = [...payments];

    if (startDate) {
      // Fix: Use setHours to set the time to the start of the day
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter(payment => new Date(payment.date) >= start);
    }

    if (endDate) {
      // Fix: Use setHours to set the time to the end of the day
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(payment => new Date(payment.date) <= end);
    }

    if (method !== "all") {
      filtered = filtered.filter(payment => payment.method === method);
    }

    if (technician !== "all") {
      filtered = filtered.filter(payment => payment.technicianId === technician);
    }

    if (client !== "all") {
      filtered = filtered.filter(payment => payment.clientId === client);
    }

    setFilteredPayments(filtered);
  };

  const canRefund = hasPermission("payments.refund");

  return (
    <PageLayout>
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Finance</h1>
          <Button
            onClick={handleExportCSV}
            variant="outline"
          >
            Export CSV
          </Button>
        </div>
        <p className="text-muted-foreground">Manage payments, refunds and financial transactions</p>
      </div>

      <PaymentsFilters onFilterChange={applyFilters} />

      <div className="mt-6">
        <PaymentsTable 
          payments={filteredPayments} 
          onRefund={handleRefund}
          canRefund={canRefund}
        />
      </div>

      {selectedPayment && (
        <RefundDialog
          open={isRefundDialogOpen}
          onOpenChange={setIsRefundDialogOpen}
          payment={selectedPayment}
          onRefund={processRefund}
        />
      )}
    </PageLayout>
  );
}
