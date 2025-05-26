
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

// Import refactored components
import { ClientFormHeader } from "./client-form/ClientFormHeader";
import { ClientInsights } from "./client-form/ClientInsights";
import { ClientDetailsTab } from "./client-form/ClientDetailsTab";
import { EmptyTabContent } from "./client-form/EmptyTabContent";
import { InvoiceModal } from "./client-form/InvoiceModal";
import { PaymentsTab } from "./client-form/PaymentsTab";
import { PropertiesTab } from "./client-form/PropertiesTab";
import { ClientStatsCard } from "./ClientStatsCard";
import { ClientContactActions } from "./ClientContactActions";

// Import custom hooks
import { useClientData } from "./client-form/hooks/useClientData";
import { useInvoiceCreation } from "./client-form/hooks/useInvoiceCreation";
import { useClientStats } from "@/hooks/useClientStats";
import { ClientJobs } from "./ClientJobs";

interface ClientFormProps {
  clientId?: string;
  onCreateJob?: () => void;
}

export const ClientForm = ({ clientId, onCreateJob }: ClientFormProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("details");
  
  // Use the custom hooks
  const {
    client,
    isLoading,
    isSaving,
    formData,
    showInsights,
    isGeneratingInsight,
    aiInsight,
    handleInputChange,
    saveChanges,
    setShowInsights
  } = useClientData(clientId);

  const {
    isInvoiceModalOpen,
    setIsInvoiceModalOpen,
    invoiceData,
    setInvoiceData,
    handleCreateInvoice,
    handleInvoiceSubmit
  } = useInvoiceCreation(clientId);

  const { stats, isLoading: statsLoading } = useClientStats(clientId);
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow p-8 text-center">
        <div className="flex flex-col items-center justify-center">
          <Loader className="h-8 w-8 animate-spin text-primary mb-4" />
          <div className="text-muted-foreground">Loading client details...</div>
        </div>
      </div>
    );
  }
  
  if (!client) {
    return (
      <div className="bg-white rounded-xl shadow p-8 text-center">
        <div className="text-muted-foreground">Client not found</div>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => navigate('/clients')}
        >
          Back to Clients
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow p-6">
        <ClientFormHeader
          client={client}
          isSaving={isSaving}
          onCreateJob={onCreateJob || (() => {})}
          onCreateInvoice={handleCreateInvoice}
          onSaveChanges={saveChanges}
        />

        {/* Client Contact Actions */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h3>
          <ClientContactActions client={client} />
        </div>
        
        <ClientInsights
          client={client}
          isGeneratingInsight={isGeneratingInsight}
          aiInsight={aiInsight}
          showInsights={showInsights}
          onHideInsights={() => setShowInsights(false)}
        />
        
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-1">
            <TabsTrigger value="details" className="relative">
              <User size={16} className="mr-2" />
              Details
            </TabsTrigger>
            <TabsTrigger value="jobs" className="relative">
              Jobs
            </TabsTrigger>
            <TabsTrigger value="payments" className="relative">
              Payments
            </TabsTrigger>
            <TabsTrigger value="properties" className="relative">
              Properties
            </TabsTrigger>
          </TabsList>
          
          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6">
            {/* Client Statistics */}
            {!statsLoading && (
              <ClientStatsCard clientId={clientId || ''} stats={stats} />
            )}
            
            <ClientDetailsTab 
              formData={formData}
              handleInputChange={handleInputChange}
            />
          </TabsContent>
          
          {/* Jobs Tab */}
          <TabsContent value="jobs" className="space-y-6">
            <ClientJobs clientId={clientId} />
          </TabsContent>
          
          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <PaymentsTab 
              clientId={clientId} 
              onCreateInvoice={handleCreateInvoice} 
            />
          </TabsContent>
          
          {/* Properties Tab */}
          <TabsContent value="properties" className="space-y-6">
            <PropertiesTab clientId={clientId} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Invoice Modal */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onOpenChange={setIsInvoiceModalOpen}
        clientName={client?.name || ''}
        invoiceData={invoiceData}
        setInvoiceData={setInvoiceData}
        onSubmit={handleInvoiceSubmit}
      />
    </div>
  );
};
