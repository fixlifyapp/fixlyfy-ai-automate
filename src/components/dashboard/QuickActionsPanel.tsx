
import { Button } from "@/components/ui/button";
import { Plus, FileText, MessageSquare, FileBarChart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { JobsCreateModal } from "@/components/jobs/JobsCreateModal";
import { toast } from "sonner";

export const QuickActionsPanel = () => {
  const navigate = useNavigate();
  const [isCreateJobModalOpen, setIsCreateJobModalOpen] = useState(false);
  
  const handleJobCreated = (job: any) => {
    toast.success(`Job ${job.id} created successfully`);
    navigate(`/jobs/${job.id}`);
  };

  return (
    <div className="flex items-center gap-2">
      <Button 
        className="bg-primary hover:bg-primary/90"
        size="sm"
        onClick={() => setIsCreateJobModalOpen(true)}
      >
        <Plus size={16} className="mr-2" />
        New Job
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            More Actions
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => navigate("/estimates")}>
            <FileText size={16} className="mr-2" />
            Create Estimate
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/messaging")}>
            <MessageSquare size={16} className="mr-2" />
            Send Bulk SMS
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/reports")}>
            <FileBarChart size={16} className="mr-2" />
            Export Report
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <JobsCreateModal 
        open={isCreateJobModalOpen}
        onOpenChange={setIsCreateJobModalOpen}
        onSuccess={handleJobCreated}
      />
    </div>
  );
};
