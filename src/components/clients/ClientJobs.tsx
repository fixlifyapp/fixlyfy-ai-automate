
import { useState, useEffect } from "react";
import { useJobs } from "@/hooks/useJobs";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { JobsCreateModal } from "../jobs/JobsCreateModal";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface ClientJobsProps {
  clientId?: string;
}

export const ClientJobs = ({
  clientId
}: ClientJobsProps) => {
  const [isCreateJobModalOpen, setIsCreateJobModalOpen] = useState(false);
  const {
    jobs,
    isLoading,
    refreshJobs
  } = useJobs(clientId);
  const navigate = useNavigate();

  const handleJobCreated = () => {
    refreshJobs();
    toast.success("Job created successfully!");
  };
  
  if (isLoading) {
    return <div className="flex justify-center items-center py-12">
        <Loader2 size={32} className="animate-spin mr-2" />
        <span>Loading jobs...</span>
      </div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Client Jobs</h2>
        <Button 
          onClick={() => setIsCreateJobModalOpen(true)} 
          className="bg-primary hover:bg-primary/90"
        >
          <Plus size={18} className="mr-2" /> Create Job
        </Button>
      </div>
      
      {jobs && jobs.length > 0 ? (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <div 
              key={job.id} 
              className="p-4 border rounded-lg bg-white cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/jobs/${job.id}`)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{job.title}</h3>
                  <p className="text-sm text-muted-foreground">{new Date(job.date).toLocaleDateString()}</p>
                  {job.description && (
                    <p className="text-sm mt-2 line-clamp-2">{job.description}</p>
                  )}
                </div>
                <div className="flex flex-col items-end">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    job.status === 'completed' ? 'bg-green-100 text-green-800' :
                    job.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    job.status === 'scheduled' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {job.status}
                  </span>
                  {job.revenue > 0 && (
                    <span className="text-sm font-medium mt-2">${job.revenue.toFixed(2)}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-8 border border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">No jobs found for this client.</p>
          <Button 
            onClick={() => setIsCreateJobModalOpen(true)} 
            variant="outline"
          >
            Create First Job
          </Button>
        </div>
      )}
      
      <JobsCreateModal 
        open={isCreateJobModalOpen}
        onOpenChange={setIsCreateJobModalOpen}
        preselectedClientId={clientId}
        onSuccess={handleJobCreated}
      />
    </div>
  );
};
