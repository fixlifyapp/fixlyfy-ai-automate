
import { useState, useCallback } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { JobsList } from "@/components/jobs/JobsList";
import { JobsFilters } from "@/components/jobs/JobsFilters";
import { PageHeader } from "@/components/ui/page-header";
import { ModernCard } from "@/components/ui/modern-card";
import { GradientButton } from "@/components/ui/gradient-button";
import { AnimatedContainer } from "@/components/ui/animated-container";
import { Plus, Grid, List, Loader2, Upload, Briefcase, Target, Zap, Clock } from "lucide-react";
import { ScheduleJobModal } from "@/components/schedule/ScheduleJobModal";
import { BulkActionsBar } from "@/components/jobs/BulkActionsBar";
import { toast } from "sonner";
import { useJobs } from "@/hooks/useJobs";
import { generateAllTestData } from "@/utils/test-data";
import { Button } from "@/components/ui/button";

const JobsPage = () => {
  const [isGridView, setIsGridView] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  
  // Use jobs hook with custom fields enabled
  const { jobs, isLoading, addJob, updateJob, deleteJob, refreshJobs } = useJobs(undefined, true);
  
  // Handle job creation using centralized logic
  const handleJobCreated = async (jobData: any) => {
    try {
      const createdJob = await addJob(jobData);
      if (createdJob) {
        toast.success(`Job ${createdJob.id} created successfully`);
        refreshJobs();
        return createdJob;
      }
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error('Failed to create job');
      throw error;
    }
  };

  // Handle successful job creation
  const handleJobSuccess = (job: any) => {
    toast.success(`Job ${job.id} created successfully`);
    refreshJobs();
  };
  
  // Handler for bulk status updates
  const handleUpdateJobsStatus = (jobIds: string[], newStatus: string) => {
    Promise.all(jobIds.map(id => updateJob(id, { status: newStatus })))
      .then(() => {
        toast.success(`Updated ${jobIds.length} jobs to "${newStatus}"`);
        setSelectedJobs([]);
      })
      .catch(error => {
        console.error("Failed to update jobs status:", error);
        toast.error("Failed to update job status");
      });
  };
  
  const handleAssignTechnician = (jobIds: string[], technicianId: string, technicianName: string) => {
    Promise.all(jobIds.map(id => updateJob(id, { technician_id: technicianId })))
      .then(() => {
        toast.success(`Assigned ${jobIds.length} jobs to ${technicianName}`);
        setSelectedJobs([]);
      })
      .catch(error => {
        console.error("Failed to assign technician:", error);
        toast.error("Failed to assign technician");
      });
  };
  
  const handleDeleteJobs = (jobIds: string[]) => {
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
  
  const handleSendReminders = (jobIds: string[], reminderType: string) => {
    toast.success(`Sent ${reminderType.toUpperCase()} reminders to ${jobIds.length} clients`);
    setSelectedJobs([]);
  };
  
  const handleTagJobs = (jobIds: string[], tags: string[]) => {
    Promise.all(jobIds.map(id => {
      const job = jobs.find(j => j.id === id);
      if (!job) return Promise.resolve(null);
      
      const existingTags = job.tags || [];
      const updatedTags = [...new Set([...existingTags, ...tags])];
      
      return updateJob(id, { tags: updatedTags });
    }))
      .then(() => {
        toast.success(`Tagged ${jobIds.length} jobs with ${tags.length} tags`);
        setSelectedJobs([]);
      })
      .catch(error => {
        console.error("Failed to tag jobs:", error);
        toast.error("Failed to tag jobs");
      });
  };
  
  const handleMarkAsPaid = (jobIds: string[], paymentMethod: string) => {
    toast.success(`Marked ${jobIds.length} jobs as paid via ${paymentMethod}`);
    setSelectedJobs([]);
  };

  const handleSelectJob = (jobId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedJobs(prev => [...prev, jobId]);
    } else {
      setSelectedJobs(prev => prev.filter(id => id !== jobId));
    }
  };
  
  const handleSelectAllJobs = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedJobs(jobs.map(job => job.id));
    } else {
      setSelectedJobs([]);
    }
  };
  
  const handleClearSelection = () => {
    setSelectedJobs([]);
  };

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
      <AnimatedContainer animation="fade-in">
        <PageHeader
          title="Service Jobs"
          subtitle="Manage and track all your service jobs with custom fields and real-time sync"
          icon={Briefcase}
          badges={[
            { text: "Smart Tracking", icon: Target, variant: "fixlyfy" },
            { text: "Real-time Updates", icon: Zap, variant: "success" },
            { text: "Custom Fields", icon: Clock, variant: "info" }
          ]}
          actionButton={{
            text: "Create Job",
            icon: Plus,
            onClick: () => setIsCreateModalOpen(true)
          }}
        />
      </AnimatedContainer>
      
      {selectedJobs.length > 0 && (
        <AnimatedContainer animation="slide-up" delay={100}>
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
        </AnimatedContainer>
      )}
      
      <AnimatedContainer animation="fade-in" delay={200}>
        <ModernCard variant="glass" className="p-4 mb-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <JobsFilters />
            <div className="flex items-center gap-2">
              <GradientButton 
                variant="info"
                onClick={handleImportTestData}
                disabled={isImporting}
                icon={Upload}
                gradient={false}
                size="sm"
              >
                {isImporting ? "Importing..." : "Import Test Data"}
              </GradientButton>
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
        {isLoading ? (
          <ModernCard variant="elevated" className="flex justify-center items-center py-12">
            <div className="flex items-center gap-3">
              <Loader2 size={32} className="animate-spin text-fixlyfy" />
              <span className="text-lg">Loading jobs...</span>
            </div>
          </ModernCard>
        ) : (
          <JobsList 
            jobs={jobs}
            isGridView={isGridView} 
            selectedJobs={selectedJobs}
            onSelectJob={handleSelectJob}
            onSelectAllJobs={handleSelectAllJobs}
          />
        )}
      </AnimatedContainer>
      
      <ScheduleJobModal 
        open={isCreateModalOpen} 
        onOpenChange={setIsCreateModalOpen}
        onJobCreated={handleJobCreated}
        onSuccess={handleJobSuccess}
      />
    </PageLayout>
  );
};

export default JobsPage;
