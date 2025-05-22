
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { ClientForm } from "@/components/clients/ClientForm";
import { JobsCreateModal } from "@/components/jobs/JobsCreateModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ClientJobs } from "@/components/clients/ClientJobs";

const ClientDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isCreateJobModalOpen, setIsCreateJobModalOpen] = useState(false);
  
  const handleCreateJob = () => {
    setIsCreateJobModalOpen(true);
  };

  return (
    <PageLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Client Details</h1>
          <p className="text-muted-foreground">
            View and manage client information.
          </p>
        </div>
        <Button onClick={() => setIsCreateJobModalOpen(true)} className="bg-primary hover:bg-primary/90">
          <Plus size={18} className="mr-2" /> Create Job
        </Button>
      </div>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Client Information</h2>
          <ClientForm clientId={id} onCreateJob={handleCreateJob} />
        </div>
        
        <ClientJobs clientId={id} />
      </div>
      
      <JobsCreateModal 
        open={isCreateJobModalOpen} 
        onOpenChange={setIsCreateJobModalOpen}
        preselectedClientId={id}
      />
    </PageLayout>
  );
};

export default ClientDetailPage;
