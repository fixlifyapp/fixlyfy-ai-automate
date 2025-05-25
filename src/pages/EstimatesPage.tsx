
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { EstimatesList } from "@/components/jobs/estimates/EstimatesList";
import { useUnifiedRealtime } from "@/hooks/useUnifiedRealtime";

const EstimatesPage = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Set up real-time updates for estimates page
  useUnifiedRealtime({
    tables: ['estimates', 'jobs', 'clients', 'line_items'],
    onUpdate: () => {
      console.log('Real-time update triggered for estimates page');
      setRefreshTrigger(prev => prev + 1);
    },
    enabled: true
  });

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Estimates</h1>
            <p className="text-gray-600">Manage quotes and estimates for your clients</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Estimate
          </Button>
        </div>
        
        <EstimatesList key={refreshTrigger} />
      </div>
    </PageLayout>
  );
};

export default EstimatesPage;
