
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { PaymentsTable } from "@/components/finance/PaymentsTable";
import { PaymentsFilters } from "@/components/finance/PaymentsFilters";
import { RefundDialog } from "@/components/finance/dialogs/RefundDialog";
import { DeleteConfirmDialog } from "@/components/jobs/dialogs/DeleteConfirmDialog";
import { useRBAC } from "@/components/auth/RBACProvider";
import { Payment, PaymentMethod } from "@/types/payment";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { toast } from "sonner";
import { usePayments } from "@/hooks/usePayments";
import { FinanceAiInsights } from "@/components/finance/FinanceAiInsights";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";
import { mapPaymentFromHook } from "@/utils/payment-mapper";
import { DollarSign, TrendingUp, Shield, CreditCard, Target, BarChart3 } from "lucide-react";

export default function FinancePage() {
  // Get all payments from the usePayments hook
  const { payments: allPaymentsFromHook, isLoading, fetchPayments, refundPayment, deletePayment } = usePayments();
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAiInsights, setShowAiInsights] = useState(() => {
    const savedPreference = localStorage.getItem("finance_show_ai_insights");
    return savedPreference !== null ? savedPreference === "true" : true;
  });
  const { hasPermission } = useRBAC();

  // Set up realtime sync for payments
  useRealtimeSync({
    tables: ["payments"],
    onUpdate: fetchPayments,
    enabled: true
  });

  useEffect(() => {
    // Fetch payments when component mounts
    fetchPayments();
  }, [fetchPayments]);

  useEffect(() => {
    // Map the payments from the hook to our expected Payment type
    const mappedPayments: Payment[] = allPaymentsFromHook.map(payment => {
      const mappedPayment = mapPaymentFromHook(payment);
      
      // If we have additional data from the mock payments, use it
      if (payment.technician_name) {
        mappedPayment.technicianName = payment.technician_name;
      }
      
      return mappedPayment;
    });
    
    // Update filtered payments with the mapped payments
    setFilteredPayments(mappedPayments);
  }, [allPaymentsFromHook]);

  const handleRefund = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsRefundDialogOpen(true);
  };

  const handleDelete = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsDeleteDialogOpen(true);
  };

  const processRefund = async (paymentId: string, notes?: string) => {
    try {
      const success = await refundPayment(paymentId);
      if (success) {
        toast.success("Payment successfully refunded");
      }
    } catch (error) {
      console.error("Failed to refund payment:", error);
      toast.error("Failed to refund payment");
    } finally {
      setIsRefundDialogOpen(false);
    }
  };

  const processDelete = async () => {
    if (!selectedPayment) return;
    
    setIsDeleting(true);
    
    try {
      await deletePayment(selectedPayment.id);
      toast.success("Payment successfully deleted");
    } catch (error) {
      console.error("Failed to delete payment:", error);
      toast.error("Failed to delete payment");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
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
    let filtered = [...filteredPayments];

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

  const toggleAiInsights = () => {
    const newValue = !showAiInsights;
    setShowAiInsights(newValue);
    localStorage.setItem("finance_show_ai_insights", newValue.toString());
  };

  const canRefund = hasPermission("payments.refund");
  const canDelete = hasPermission("payments.delete");

  return (
    <PageLayout>
      <PageHeader
        title="Finance"
        subtitle="Manage payments, refunds and financial transactions"
        icon={DollarSign}
        badges={[
          { text: "Payment Tracking", icon: CreditCard, variant: "fixlyfy" },
          { text: "Financial Analytics", icon: BarChart3, variant: "success" },
          { text: "Secure Processing", icon: Shield, variant: "info" }
        ]}
        actionButton={{
          text: "Export CSV",
          icon: TrendingUp,
          onClick: handleExportCSV
        }}
      />

      {showAiInsights && (
        <FinanceAiInsights onClose={toggleAiInsights} />
      )}

      <PaymentsFilters onFilterChange={applyFilters} />

      <div className="mt-6">
        <PaymentsTable 
          payments={filteredPayments} 
          onRefund={handleRefund}
          onDelete={handleDelete}
          canRefund={canRefund}
          canDelete={canDelete}
          isLoading={isLoading}
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

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DeleteConfirmDialog
          title="Delete Payment"
          description={`Are you sure you want to delete this payment of ${selectedPayment ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(selectedPayment.amount) : '$0.00'} for ${selectedPayment?.clientName || 'customer'}? This action cannot be undone.`}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={processDelete}
          isDeleting={isDeleting}
        />
      </Dialog>
    </PageLayout>
  );
}
