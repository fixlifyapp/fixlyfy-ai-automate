
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { ClientsList } from "@/components/clients/ClientsList";
import { ClientsFilters } from "@/components/clients/ClientsFilters";
import { ClientsCreateModal } from "@/components/clients/ClientsCreateModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useUnifiedRealtime } from "@/hooks/useUnifiedRealtime";

const ClientsPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isGridView, setIsGridView] = useState(false);

  // Set up real-time updates for clients page
  useUnifiedRealtime({
    tables: ['clients', 'jobs'],
    onUpdate: () => {
      console.log('Real-time update triggered for clients page');
      setRefreshTrigger(prev => prev + 1);
    },
    enabled: true
  });

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
            <p className="text-gray-600">Manage your customer relationships</p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Client
          </Button>
        </div>
        
        <ClientsFilters />
        <ClientsList key={refreshTrigger} isGridView={isGridView} />
        
        <ClientsCreateModal 
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
        />
      </div>
    </PageLayout>
  );
};

export default ClientsPage;
