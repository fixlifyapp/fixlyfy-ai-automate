
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useUnifiedRealtime } from "@/hooks/useUnifiedRealtime";

const InvoicesPage = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Set up real-time updates for invoices page
  useUnifiedRealtime({
    tables: ['invoices', 'jobs', 'clients', 'payments'],
    onUpdate: () => {
      console.log('Real-time update triggered for invoices page');
      setRefreshTrigger(prev => prev + 1);
    },
    enabled: true
  });

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
            <p className="text-gray-600">Manage invoices and billing</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
        </div>
        
        <div className="text-center py-8 text-muted-foreground" key={refreshTrigger}>
          <p>Invoice management interface coming soon...</p>
        </div>
      </div>
    </PageLayout>
  );
};

export default InvoicesPage;
