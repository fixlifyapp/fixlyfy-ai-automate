
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { JobsList } from "@/components/jobs/JobsList";
import { JobsFilters } from "@/components/jobs/JobsFilters";
import { Button } from "@/components/ui/button";
import { Plus, Grid, List } from "lucide-react";
import { JobsCreateModal } from "@/components/jobs/JobsCreateModal";
import { BulkActionsBar } from "@/components/jobs/BulkActionsBar";

const JobsPage = () => {
  const [isGridView, setIsGridView] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  
  // Handle selecting or deselecting a job
  const handleSelectJob = (jobId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedJobs(prev => [...prev, jobId]);
    } else {
      setSelectedJobs(prev => prev.filter(id => id !== jobId));
    }
  };
  
  // Handle selecting or deselecting all jobs
  const handleSelectAllJobs = (isSelected: boolean) => {
    if (isSelected) {
      // In a real app, you'd fetch all job IDs from your data
      setSelectedJobs(["JOB-1001", "JOB-1002", "JOB-1003", "JOB-1004", "JOB-1005"]);
    } else {
      setSelectedJobs([]);
    }
  };
  
  // Clear selection of jobs
  const handleClearSelection = () => {
    setSelectedJobs([]);
  };
  
  return (
    <PageLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Jobs</h1>
          <p className="text-fixlyfy-text-secondary">
            Manage and track all your service jobs in one place.
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="bg-fixlyfy hover:bg-fixlyfy/90">
          <Plus size={18} className="mr-2" /> Create Job
        </Button>
      </div>
      
      {selectedJobs.length > 0 && (
        <BulkActionsBar 
          selectedJobs={selectedJobs} 
          onClearSelection={handleClearSelection} 
        />
      )}
      
      <div className="fixlyfy-card p-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <JobsFilters />
          <div className="flex items-center gap-2">
            <Button
              variant={isGridView ? "ghost" : "secondary"}
              size="sm"
              onClick={() => setIsGridView(false)}
              className="flex gap-2"
            >
              <List size={18} /> List
            </Button>
            <Button 
              variant={isGridView ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setIsGridView(true)}
              className="flex gap-2"
            >
              <Grid size={18} /> Grid
            </Button>
          </div>
        </div>
      </div>
      
      <JobsList 
        isGridView={isGridView} 
        selectedJobs={selectedJobs}
        onSelectJob={handleSelectJob}
        onSelectAllJobs={handleSelectAllJobs}
      />
      
      <JobsCreateModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} />
    </PageLayout>
  );
};

export default JobsPage;
