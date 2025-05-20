
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { JobsList } from "@/components/jobs/JobsList";
import { JobsFilters } from "@/components/jobs/JobsFilters";
import { Button } from "@/components/ui/button";
import { Plus, Grid, List, Loader2, Upload } from "lucide-react";
import { JobsCreateModal } from "@/components/jobs/JobsCreateModal";
import { BulkActionsBar } from "@/components/jobs/BulkActionsBar";
import { toast } from "sonner";
import { useJobs } from "@/hooks/useJobs";
import { generateAllTestData } from "@/utils/test-data-generator";

const JobsPage = () => {
  const [isGridView, setIsGridView] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  
  // Use the useJobs hook to fetch job data from Supabase
  const { jobs, isLoading, addJob, updateJob, deleteJob, refreshJobs } = useJobs();
  
  // Handler for bulk status updates
  const handleUpdateJobsStatus = (jobIds: string[], newStatus: string) => {
    // Update job data in Supabase for each selected job
    Promise.all(jobIds.map(id => updateJob(id, { status: newStatus })))
      .then(() => {
        toast.success(`Updated ${jobIds.length} jobs to "${newStatus}"`);
        setSelectedJobs([]);
        refreshJobs(); // Refresh the job list
      })
      .catch(error => {
        console.error("Failed to update jobs status:", error);
        toast.error("Failed to update job status");
      });
  };
  
  // Handler for bulk technician assignment
  const handleAssignTechnician = (jobIds: string[], technicianId: string, technicianName: string) => {
    // Update job data in Supabase for each selected job
    Promise.all(jobIds.map(id => updateJob(id, { technician_id: technicianId })))
      .then(() => {
        toast.success(`Assigned ${jobIds.length} jobs to ${technicianName}`);
        setSelectedJobs([]);
        refreshJobs(); // Refresh the job list
      })
      .catch(error => {
        console.error("Failed to assign technician:", error);
        toast.error("Failed to assign technician");
      });
  };
  
  // Handler for bulk deletion
  const handleDeleteJobs = (jobIds: string[]) => {
    // Delete jobs from Supabase
    Promise.all(jobIds.map(id => deleteJob(id)))
      .then(() => {
        toast.success(`Deleted ${jobIds.length} jobs`);
        setSelectedJobs([]);
      })
      .catch(error => {
        console.error("Failed to delete jobs:", error);
        toast.error("Failed to delete jobs");
      });
  };
  
  // Handler for sending reminders
  const handleSendReminders = (jobIds: string[], reminderType: string) => {
    // In a real app, this would trigger an API call to send reminders
    toast.success(`Sent ${reminderType.toUpperCase()} reminders to ${jobIds.length} clients`);
    setSelectedJobs([]);
  };
  
  // Handler for tagging jobs
  const handleTagJobs = (jobIds: string[], tags: string[]) => {
    // Update job tags in Supabase
    Promise.all(jobIds.map(id => {
      const job = jobs.find(j => j.id === id);
      if (!job) return Promise.resolve(null);
      
      // Merge existing tags with new tags
      const existingTags = job.tags || [];
      const updatedTags = [...new Set([...existingTags, ...tags])];
      
      return updateJob(id, { tags: updatedTags });
    }))
      .then(() => {
        toast.success(`Tagged ${jobIds.length} jobs with ${tags.length} tags`);
        setSelectedJobs([]);
        refreshJobs(); // Refresh the job list
      })
      .catch(error => {
        console.error("Failed to tag jobs:", error);
        toast.error("Failed to tag jobs");
      });
  };
  
  // Handler for marking jobs as paid
  const handleMarkAsPaid = (jobIds: string[], paymentMethod: string) => {
    // In a real app, this would update payment status in the database
    toast.success(`Marked ${jobIds.length} jobs as paid via ${paymentMethod}`);
    setSelectedJobs([]);
  };

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
      setSelectedJobs(jobs.map(job => job.id));
    } else {
      setSelectedJobs([]);
    }
  };
  
  // Clear selection of jobs
  const handleClearSelection = () => {
    setSelectedJobs([]);
  };

  // Handle importing test data
  const handleImportTestData = async () => {
    setIsImporting(true);
    try {
      toast.info("Importing test data...");
      await generateAllTestData(20, 40);
      toast.success("Successfully imported 40 test jobs!");
      refreshJobs();
    } catch (error) {
      console.error("Error importing test data:", error);
      toast.error("Failed to import test data");
    } finally {
      setIsImporting(false);
    }
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
        <div className="flex gap-2">
          <Button 
            onClick={handleImportTestData} 
            variant="outline"
            disabled={isImporting}
          >
            <Upload size={18} className="mr-2" /> 
            {isImporting ? "Importing..." : "Import Test Data"}
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)} className="bg-fixlyfy hover:bg-fixlyfy/90">
            <Plus size={18} className="mr-2" /> Create Job
          </Button>
        </div>
      </div>
      
      {selectedJobs.length > 0 && (
        <BulkActionsBar 
          selectedJobs={selectedJobs} 
          onClearSelection={handleClearSelection} 
          onUpdateStatus={handleUpdateJobsStatus}
          onAssignTechnician={handleAssignTechnician}
          onDeleteJobs={handleDeleteJobs}
          onSendReminders={handleSendReminders}
          onTagJobs={handleTagJobs}
          onMarkAsPaid={handleMarkAsPaid}
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
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 size={32} className="animate-spin text-fixlyfy mr-2" />
          <span>Loading jobs...</span>
        </div>
      ) : (
        <JobsList 
          jobs={jobs}
          isGridView={isGridView} 
          selectedJobs={selectedJobs}
          onSelectJob={handleSelectJob}
          onSelectAllJobs={handleSelectAllJobs}
        />
      )}
      
      <JobsCreateModal 
        open={isCreateModalOpen} 
        onOpenChange={setIsCreateModalOpen}
        onSuccess={(job) => {
          refreshJobs();
          toast.success(`Job ${job.id} created successfully`);
        }}
      />
    </PageLayout>
  );
};

export default JobsPage;
