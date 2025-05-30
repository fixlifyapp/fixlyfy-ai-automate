
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { JobsList } from "@/components/jobs/JobsList";
import { JobsFilters } from "@/components/jobs/JobsFilters";
import { JobsCreateModal } from "@/components/jobs/JobsCreateModal";
import { BulkActionsBar } from "@/components/jobs/BulkActionsBar";
import { ModernCard } from "@/components/ui/modern-card";
import { AnimatedContainer } from "@/components/ui/animated-container";
import { Button } from "@/components/ui/button";
import { Grid, List, Plus, Target, Calendar, CheckCircle } from "lucide-react";
import { useJobs } from "@/hooks/useJobs";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";
import { toast } from "sonner";

const JobsPage = () => {
  const [isGridView, setIsGridView] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [filters, setFilters] = useState({});
  
  const { 
    jobs, 
    isLoading, 
    refreshJobs,
    updateJob,
    deleteJob
  } = useJobs();
  
  // Set up real-time sync
  useRealtimeSync({
    tables: ['jobs', 'clients'],
    onUpdate: () => {
      console.log('Jobs table updated, refreshing...');
      refreshJobs();
    },
    enabled: true
  });

  const handleJobSelect = (jobId: string, isSelected: boolean) => {
    setSelectedJobs(prev => 
      isSelected 
        ? [...prev, jobId]
        : prev.filter(id => id !== jobId)
    );
  };

  const handleRefresh = () => {
    refreshJobs();
    setSelectedJobs([]);
  };

  const handleBulkUpdateStatus = async (jobIds: string[], newStatus: string) => {
    try {
      for (const jobId of jobIds) {
        await updateJob(jobId, { status: newStatus });
      }
      toast.success(`Updated ${jobIds.length} job(s) status to ${newStatus}`);
      setSelectedJobs([]);
      refreshJobs();
    } catch (error) {
      console.error('Error updating job statuses:', error);
      toast.error('Failed to update job statuses');
    }
  };

  const handleBulkAssignTechnician = async (jobIds: string[], technicianId: string, technicianName: string) => {
    try {
      for (const jobId of jobIds) {
        await updateJob(jobId, { technician_id: technicianId });
      }
      toast.success(`Assigned ${jobIds.length} job(s) to ${technicianName}`);
      setSelectedJobs([]);
      refreshJobs();
    } catch (error) {
      console.error('Error assigning technician:', error);
      toast.error('Failed to assign technician to jobs');
    }
  };

  const handleBulkDeleteJobs = async (jobIds: string[]) => {
    try {
      for (const jobId of jobIds) {
        await deleteJob(jobId);
      }
      toast.success(`Deleted ${jobIds.length} job(s)`);
      setSelectedJobs([]);
      refreshJobs();
    } catch (error) {
      console.error('Error deleting jobs:', error);
      toast.error('Failed to delete jobs');
    }
  };

  const handleBulkTagJobs = async (jobIds: string[], tags: string[]) => {
    try {
      for (const jobId of jobIds) {
        await updateJob(jobId, { tags });
      }
      toast.success(`Tagged ${jobIds.length} job(s)`);
      setSelectedJobs([]);
      refreshJobs();
    } catch (error) {
      console.error('Error tagging jobs:', error);
      toast.error('Failed to tag jobs');
    }
  };

  const handleExportJobs = (jobIds: string[]) => {
    // Implement export logic here
    toast.success(`Exported ${jobIds.length} job(s)`);
  };

  const selectedJobsCount = selectedJobs.length;
  
  return (
    <PageLayout>
      <AnimatedContainer animation="fade-in">
        <PageHeader
          title="Jobs Management"
          subtitle="Manage and track all your service jobs efficiently"
          icon={Target}
          badges={[
            { text: "Smart Scheduling", icon: Calendar, variant: "fixlify" },
            { text: "Real-time Updates", icon: CheckCircle, variant: "success" },
            { text: "Team Coordination", icon: Target, variant: "info" }
          ]}
          actionButton={{
            text: "New Job",
            icon: Plus,
            onClick: () => setIsCreateModalOpen(true)
          }}
        />
      </AnimatedContainer>
      
      <AnimatedContainer animation="fade-in" delay={200}>
        <ModernCard variant="glass" className="p-4 mb-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <JobsFilters 
              filters={filters}
              onFiltersChange={setFilters}
            />
            <div className="flex items-center gap-2">
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

      {/* Bulk Actions Bar */}
      {selectedJobsCount > 0 && (
        <AnimatedContainer animation="slide-up" delay={100}>
          <BulkActionsBar
            selectedJobs={selectedJobs}
            onClearSelection={() => setSelectedJobs([])}
            onUpdateStatus={handleBulkUpdateStatus}
            onAssignTechnician={handleBulkAssignTechnician}
            onDeleteJobs={handleBulkDeleteJobs}
            onTagJobs={handleBulkTagJobs}
            onExport={handleExportJobs}
          />
        </AnimatedContainer>
      )}
      
      <AnimatedContainer animation="fade-in" delay={300}>
        <div className="space-y-6">
          {/* Jobs List */}
          <JobsList 
            jobs={jobs}
            isGridView={isGridView}
            selectedJobs={selectedJobs}
            onSelectJob={handleJobSelect}
            onRefresh={handleRefresh}
          />
        </div>
      </AnimatedContainer>
      
      <JobsCreateModal 
        open={isCreateModalOpen} 
        onOpenChange={setIsCreateModalOpen}
        onSuccess={() => {
          setTimeout(() => {
            refreshJobs();
          }, 200);
        }}
      />
    </PageLayout>
  );
};

export default JobsPage;
