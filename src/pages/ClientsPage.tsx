
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { ModernCard } from "@/components/ui/modern-card";
import { AnimatedContainer } from "@/components/ui/animated-container";
import { Button } from "@/components/ui/button";
import { Grid, List, Plus, Users, Target, Heart, TrendingUp } from "lucide-react";
import { ClientsList } from "@/components/clients/ClientsList";
import { ClientsFilters } from "@/components/clients/ClientsFilters";
import { ClientsCreateModal } from "@/components/clients/ClientsCreateModal";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";
import { useClients } from "@/hooks/useClients";

const ClientsPage = () => {
  const [isGridView, setIsGridView] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { refreshClients } = useClients();
  
  // Set up real-time sync for clients table
  useRealtimeSync({
    tables: ['clients'],
    onUpdate: () => {
      console.log('Clients table updated, refreshing...');
      refreshClients();
    },
    enabled: true
  });
  
  return (
    <PageLayout>
      <AnimatedContainer animation="fade-in">
        <PageHeader
          title="Client Management"
          subtitle="Manage your customer database and track interactions"
          icon={Users}
          badges={[
            { text: "Relationship Building", icon: Heart, variant: "fixlyfy" },
            { text: "Growth Tracking", icon: TrendingUp, variant: "success" },
            { text: "Smart Insights", icon: Target, variant: "info" }
          ]}
          actionButton={{
            text: "Add Client",
            icon: Plus,
            onClick: () => setIsCreateModalOpen(true)
          }}
        />
      </AnimatedContainer>
      
      <AnimatedContainer animation="fade-in" delay={200}>
        <ModernCard variant="glass" className="p-4 mb-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <ClientsFilters />
            <div className="flex items-center gap-2">
              <Button
                variant={isGridView ? "ghost" : "secondary"}
                size="sm"
                onClick={() => setIsGridView(false)}
                className="flex gap-2 rounded-xl"
              >
                <List size={18} /> List
              </Button>
              <Button 
                variant={isGridView ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setIsGridView(true)}
                className="flex gap-2 rounded-xl"
              >
                <Grid size={18} /> Grid
              </Button>
            </div>
          </div>
        </ModernCard>
      </AnimatedContainer>
      
      <AnimatedContainer animation="fade-in" delay={300}>
        <ClientsList isGridView={isGridView} />
      </AnimatedContainer>
      
      <ClientsCreateModal 
        open={isCreateModalOpen} 
        onOpenChange={setIsCreateModalOpen} 
      />
    </PageLayout>
  );
};

export default ClientsPage;
