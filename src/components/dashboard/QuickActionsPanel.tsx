
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
import { ScheduleJobModal } from "@/components/schedule/ScheduleJobModal";
import { toast } from "sonner";
import { useJobs } from "@/hooks/useJobs";

export const QuickActionsPanel = () => {
  const navigate = useNavigate();
  const [isCreateJobModalOpen, setIsCreateJobModalOpen] = useState(false);
  const { addJob } = useJobs();
  
  const handleJobCreated = async (jobData: any) => {
    try {
      const createdJob = await addJob(jobData);
      if (createdJob) {
        toast.success(`Job ${createdJob.id} created successfully`);
        navigate(`/jobs/${createdJob.id}`);
        return createdJob;
      }
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error('Failed to create job');
      throw error;
    }
  };

  const handleJobSuccess = (job: any) => {
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

      <ScheduleJobModal 
        open={isCreateJobModalOpen}
        onOpenChange={setIsCreateJobModalOpen}
        onJobCreated={handleJobCreated}
        onSuccess={handleJobSuccess}
      />
    </div>
  );
};
