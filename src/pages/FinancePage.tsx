
import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaymentsTable } from "@/components/finance/PaymentsTable";
import { PaymentsFilters } from "@/components/finance/PaymentsFilters";
import { FinanceAiInsights } from "@/components/finance/FinanceAiInsights";
import { DollarSign, TrendingUp, Calculator, CreditCard, BarChart3, Target } from "lucide-react";
import { Payment, PaymentMethod } from "@/types/payment";

const FinancePage = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [showAiInsights, setShowAiInsights] = useState(true);

  // Sample payments data - in real app this would come from API
  useEffect(() => {
    const samplePayments: Payment[] = [
      {
        id: "1",
        clientId: "c1",
        clientName: "John Anderson",
        jobId: "j1",
        amount: 350.00,
        method: "credit-card",
        status: "paid",
        date: "2024-01-15",
        description: "HVAC Repair Service"
      },
      {
        id: "2", 
        clientId: "c2",
        clientName: "Sarah Williams",
        jobId: "j2",
        amount: 225.50,
        method: "cash",
        status: "paid",
        date: "2024-01-14",
        description: "Appliance Maintenance"
      }
    ];
    setPayments(samplePayments);
    setFilteredPayments(samplePayments);
  }, []);

  const handleFilterChange = (
    startDate: Date | undefined,
    endDate: Date | undefined,
    method: PaymentMethod | "all",
    technician: string | "all",
    client: string | "all"
  ) => {
    let filtered = [...payments];
    
    if (method !== "all") {
      filtered = filtered.filter(p => p.method === method);
    }
    
    if (startDate) {
      filtered = filtered.filter(p => new Date(p.date) >= startDate);
    }
    
    if (endDate) {
      filtered = filtered.filter(p => new Date(p.date) <= endDate);
    }
    
    setFilteredPayments(filtered);
  };

  const handleRefund = (payment: Payment) => {
    console.log("Refunding payment:", payment);
  };

  const handleDelete = (payment: Payment) => {
    console.log("Deleting payment:", payment);
  };

  return (
    <PageLayout>
      <PageHeader
        title="Financial Management"
        subtitle="Track payments, revenue, and financial performance"
        icon={DollarSign}
        badges={[
          { text: "Payment Tracking", icon: CreditCard, variant: "fixlyfy" },
          { text: "Revenue Analytics", icon: BarChart3, variant: "success" },
          { text: "Smart Insights", icon: Target, variant: "info" }
        ]}
      />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Financial Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$45,231.89</div>
                <p className="text-xs text-muted-foreground">
                  +20.1% from last month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
                <Calculator className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$12,234</div>
                <p className="text-xs text-muted-foreground">
                  -5% from last month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+12.5%</div>
                <p className="text-xs text-muted-foreground">
                  +2.1% from last month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Collections</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$8,234</div>
                <p className="text-xs text-muted-foreground">
                  +15.2% from last month
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>View and manage all payment transactions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <PaymentsFilters onFilterChange={handleFilterChange} />
              <PaymentsTable 
                payments={filteredPayments}
                onRefund={handleRefund}
                onDelete={handleDelete}
                canRefund={true}
                canDelete={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Financial Reports</CardTitle>
              <CardDescription>Generate detailed financial reports and analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>Financial reporting dashboard coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {showAiInsights && (
            <FinanceAiInsights onClose={() => setShowAiInsights(false)} />
          )}
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};

export default FinancePage;
