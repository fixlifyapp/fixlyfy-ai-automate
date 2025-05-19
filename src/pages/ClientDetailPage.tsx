
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { ClientForm } from "@/components/clients/ClientForm";
import { JobsCreateModal } from "@/components/jobs/JobsCreateModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientJobs } from "@/components/clients/ClientJobs";

const ClientDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isCreateJobModalOpen, setIsCreateJobModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  
  const handleCreateJob = () => {
    setIsCreateJobModalOpen(true);
  };

  return (
    <PageLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Client Details</h1>
          <p className="text-fixlyfy-text-secondary">
            View and manage client information.
          </p>
        </div>
        <Button onClick={() => setIsCreateJobModalOpen(true)} className="bg-fixlyfy hover:bg-fixlyfy/90">
          <Plus size={18} className="mr-2" /> Create Job
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <ClientForm clientId={id} onCreateJob={handleCreateJob} />
        </TabsContent>
        
        <TabsContent value="jobs">
          <ClientJobs clientId={id} onCreateJob={handleCreateJob} />
        </TabsContent>
      </Tabs>
      
      <JobsCreateModal 
        open={isCreateJobModalOpen} 
        onOpenChange={setIsCreateJobModalOpen}
        preselectedClientId={id}
      />
    </PageLayout>
  );
};

export default ClientDetailPage;
