
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaymentsTable } from "@/components/finance/PaymentsTable";
import { PaymentsFilters } from "@/components/finance/PaymentsFilters";
import { FinanceAiInsights } from "@/components/finance/FinanceAiInsights";
import { useUnifiedRealtime } from "@/hooks/useUnifiedRealtime";

const FinancePage = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Set up real-time updates for finance page
  useUnifiedRealtime({
    tables: ['payments', 'invoices', 'jobs', 'clients'],
    onUpdate: () => {
      console.log('Real-time update triggered for finance page');
      setRefreshTrigger(prev => prev + 1);
    },
    enabled: true
  });

  return (
    <PageLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Finance</h1>
          <p className="text-gray-600">Track payments, invoices, and financial performance</p>
        </div>

        <Tabs defaultValue="payments" className="space-y-6">
          <TabsList>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="payments" className="space-y-6">
            <PaymentsFilters onFilterChange={() => {}} />
            <PaymentsTable 
              key={refreshTrigger} 
              payments={[]} 
              onRefund={() => {}} 
              canRefund={() => false} 
            />
          </TabsContent>

          <TabsContent value="invoices" className="space-y-6">
            <div className="text-center py-8 text-muted-foreground">
              <p>Invoices management coming soon...</p>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <FinanceAiInsights key={refreshTrigger} onClose={() => {}} />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default FinancePage;
