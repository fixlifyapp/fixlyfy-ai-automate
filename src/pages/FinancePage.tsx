
import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { FinanceHeader } from "@/components/finance/FinanceHeader";
import { FinanceMetrics } from "@/components/finance/FinanceMetrics";
import { PaymentsTable } from "@/components/finance/PaymentsTable";
import { InvoicesTable } from "@/components/finance/InvoicesTable";
import { EstimatesTable } from "@/components/finance/EstimatesTable";
import { PaymentDialog } from "@/components/jobs/dialogs/PaymentDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function FinancePage() {
  const [searchParams] = useSearchParams();
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  // Get active tab from URL params, default to "payments"
  const activeTab = searchParams.get("tab") || "payments";

  // Mock data for now - in a real app, this would come from your data hooks
  const mockPayments = useMemo(() => [], []);
  const mockInvoices = useMemo(() => [], []);
  const mockEstimates = useMemo(() => [], []);

  // Calculate metrics from the data
  const metrics = useMemo(() => {
    const totalRevenue = mockInvoices.reduce((sum: number, inv: any) => sum + (inv.total || 0), 0);
    const totalPaid = mockPayments.reduce((sum: number, payment: any) => sum + payment.amount, 0);
    const pendingPayments = totalRevenue - totalPaid;
    const totalEstimates = mockEstimates.reduce((sum: number, est: any) => sum + (est.total || 0), 0);

    return {
      totalRevenue,
      totalPaid,
      pendingPayments,
      totalEstimates
    };
  }, [mockPayments, mockInvoices, mockEstimates]);

  const handlePaymentProcessed = (amount: number, method: string, reference?: string, notes?: string) => {
    // Handle payment processing
    console.log('Payment processed:', { amount, method, reference, notes });
    setIsPaymentDialogOpen(false);
  };

  const handleRefund = (payment: any) => {
    console.log('Refund payment:', payment);
  };

  return (
    <div className="space-y-6">
      <FinanceHeader />
      
      <FinanceMetrics 
        totalRevenue={metrics.totalRevenue}
        totalPaid={metrics.totalPaid}
        pendingPayments={metrics.pendingPayments}
        totalEstimates={metrics.totalEstimates}
      />
      
      <Tabs value={activeTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="estimates">Estimates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="payments" className="space-y-4">
          <PaymentsTable 
            payments={mockPayments} 
            onRefund={handleRefund}
            canRefund={true}
          />
        </TabsContent>
        
        <TabsContent value="invoices" className="space-y-4">
          <InvoicesTable invoices={mockInvoices} />
        </TabsContent>
        
        <TabsContent value="estimates" className="space-y-4">
          <EstimatesTable estimates={mockEstimates} />
        </TabsContent>
      </Tabs>

      <PaymentDialog 
        open={isPaymentDialogOpen} 
        onOpenChange={setIsPaymentDialogOpen}
        balance={0}
        onPaymentProcessed={handlePaymentProcessed}
      />
    </div>
  );
}
