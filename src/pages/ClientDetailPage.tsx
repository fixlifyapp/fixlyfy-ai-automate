
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { ClientForm } from "@/components/clients/ClientForm";
import { JobsCreateModal } from "@/components/jobs/JobsCreateModal";
import { Button } from "@/components/ui/button";
import { PaymentDialog } from "@/components/jobs/dialogs/PaymentDialog";
import { ExpenseDialog } from "@/components/jobs/dialogs/ExpenseDialog";
import { SearchDialog } from "@/components/jobs/dialogs/SearchDialog";
import { File, Plus, Search } from "lucide-react";

const ClientDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isCreateJobModalOpen, setIsCreateJobModalOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  
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
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex gap-2 items-center"
            onClick={() => setIsPaymentDialogOpen(true)}
          >
            <File size={16} />
            <span>Add Payment</span>
          </Button>
          <Button 
            variant="outline" 
            className="flex gap-2 items-center"
            onClick={() => setIsExpenseDialogOpen(true)}
          >
            <File size={16} />
            <span>Add Expense</span>
          </Button>
          <Button 
            variant="outline" 
            className="flex gap-2 items-center"
            onClick={() => setIsSearchDialogOpen(true)}
          >
            <Search size={16} />
            <span>Search</span>
          </Button>
        </div>
      </div>
      
      <ClientForm clientId={id} onCreateJob={handleCreateJob} />
      
      <JobsCreateModal 
        open={isCreateJobModalOpen} 
        onOpenChange={setIsCreateJobModalOpen}
        preselectedClientId={id}
      />

      <PaymentDialog 
        open={isPaymentDialogOpen} 
        onOpenChange={setIsPaymentDialogOpen} 
        balance={0} // We don't have the balance here, so passing 0
        onPaymentProcessed={() => {}} // Empty callback
      />
      
      <ExpenseDialog 
        open={isExpenseDialogOpen} 
        onOpenChange={setIsExpenseDialogOpen} 
      />

      <SearchDialog
        open={isSearchDialogOpen}
        onOpenChange={setIsSearchDialogOpen}
      />
    </PageLayout>
  );
};

export default ClientDetailPage;
