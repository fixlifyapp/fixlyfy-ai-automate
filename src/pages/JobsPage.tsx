import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { ModernCard } from "@/components/ui/modern-card";
import { AnimatedContainer } from "@/components/ui/animated-container";
import { Button } from "@/components/ui/button";
import { 
  Grid, 
  List, 
  Plus, 
  Wrench, 
  Target, 
  TrendingUp,
  RefreshCw
} from "lucide-react";
import { JobsListOptimized } from "@/components/jobs/JobsListOptimized";
import { JobsFilters } from "@/components/jobs/JobsFilters";
import { BulkActionsBar } from "@/components/jobs/BulkActionsBar";
import { ScheduleJobModal } from "@/components/schedule/ScheduleJobModal";
import { useJobsOptimized } from "@/hooks/useJobsOptimized";
import { useJobs } from "@/hooks/useJobs";
import { toast } from "sonner";

const JobsPage = () => {
  const [isGridView, setIsGridView] = useState(false);
  const [isCreateJobModalOpen, setIsCreateJobModalOpen] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    type: "all",
    technician: "all",
    dateRange: { start: null as Date | null, end: null as Date | null },
    tags: [] as string[]
  });
  
  // Use optimized hook for display
  const { 
    jobs: optimizedJobs, 
    isLoading: isOptimizedLoading,
    totalCount,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    refreshJobs: refreshOptimized,
    canCreate,
    canEdit,
    canDelete
  } = useJobsOptimized({
    page: currentPage,
    pageSize: 50,
    enableRealtime: true
  });

  // Keep original hook for mutations only
  const { addJob, updateJob, deleteJob } = useJobs();
  
  // Clear selected jobs when jobs change
  useEffect(() => {
    setSelectedJobs(prev => prev.filter(id => optimizedJobs.some(job => job.id === id)));
  }, [optimizedJobs]);

  // Filter jobs based on current filters
  const filteredJobs = optimizedJobs.filter(job => {
    // Search filter - search in client name, job ID, title, and description
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const searchableFields = [
        job.client?.name || '',
        job.id || '',
        job.title || '',
        job.description || ''
      ];
      
      if (!searchableFields.some(field => field.toLowerCase().includes(searchTerm))) {
        return false;
      }
    }
    
    // Status filter
    if (filters.status !== "all" && job.status.toLowerCase() !== filters.status.toLowerCase()) {
      return false;
    }
    
    // Type filter
    if (filters.type !== "all" && job.job_type?.toLowerCase() !== filters.type.toLowerCase()) {
      return false;
    }
    
    // Date range filter
    if (filters.dateRange.start && job.date && new Date(job.date) < filters.dateRange.start) {
      return false;
    }
    if (filters.dateRange.end && job.date && new Date(job.date) > filters.dateRange.end) {
      return false;
    }
    
    // Tags filter - check if job has any of the selected tags
    if (filters.tags.length > 0) {
      if (!job.tags || !filters.tags.some(tag => job.tags?.includes(tag))) {
        return false;
      }
    }
    
    return true;
  });
  
  const handleJobCreated = async (jobData: any) => {
    try {
      const createdJob = await addJob(jobData);
      if (createdJob) {
        toast.success(`Job ${createdJob.id} created successfully!`);
        // Refresh optimized jobs immediately
        refreshOptimized();
        return createdJob;
      }
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error('Failed to create job');
      throw error;
    }
  };

  const handleSelectJob = (jobId: string, isSelected: boolean) => {
    setSelectedJobs(prev => 
      isSelected 
        ? [...prev, jobId]
        : prev.filter(id => id !== jobId)
    );
  };

  const handleSelectAllJobs = (select: boolean) => {
    setSelectedJobs(select ? filteredJobs.map(job => job.id) : []);
  };

  // Bulk action handlers with optimized refresh
  const handleBulkUpdateStatus = async (jobIds: string[], newStatus: string) => {
    try {
      await Promise.all(jobIds.map(id => updateJob(id, { status: newStatus })));
      toast.success(`Updated ${jobIds.length} jobs to ${newStatus}`);
      setSelectedJobs([]);
      refreshOptimized();
    } catch (error) {
      toast.error('Failed to update job statuses');
    }
  };

  const handleBulkAssignTechnician = async (jobIds: string[], technicianId: string, technicianName: string) => {
    try {
      await Promise.all(jobIds.map(id => updateJob(id, { technician_id: technicianId })));
      toast.success(`Assigned ${jobIds.length} jobs to ${technicianName}`);
      setSelectedJobs([]);
      refreshOptimized();
    } catch (error) {
      toast.error('Failed to assign technician');
    }
  };

  const handleBulkDelete = async (jobIds: string[]) => {
    try {
      await Promise.all(jobIds.map(id => deleteJob(id)));
      toast.success(`Deleted ${jobIds.length} jobs`);
      setSelectedJobs([]);
      refreshOptimized();
    } catch (error) {
      toast.error('Failed to delete jobs');
    }
  };

  const handleBulkExport = (jobIds: string[]) => {
    const selectedJobData = filteredJobs.filter(job => jobIds.includes(job.id));
    const csvData = selectedJobData.map(job => ({
      'Job ID': job.id,
      'Client': job.client?.name || '',
      'Status': job.status,
      'Type': job.job_type || '',
      'Date': job.date ? new Date(job.date).toLocaleDateString() : '',
      'Revenue': job.revenue || 0,
      'Address': job.address || ''
    }));
    
    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jobs-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success(`Exported ${jobIds.length} jobs`);
    setSelectedJobs([]);
  };

  const handleBulkTagJobs = async (jobIds: string[], tags: string[]) => {
    try {
      await Promise.all(jobIds.map(id => {
        const job = filteredJobs.find(j => j.id === id);
        const existingTags = job?.tags || [];
        const newTags = [...new Set([...existingTags, ...tags])];
        return updateJob(id, { tags: newTags });
      }));
      toast.success(`Tagged ${jobIds.length} jobs`);
      setSelectedJobs([]);
      refreshOptimized();
    } catch (error) {
      toast.error('Failed to tag jobs');
    }
  };

  const handleRefreshJobs = () => {
    refreshOptimized();
    setSelectedJobs([]);
    toast.success('Jobs refreshed');
  };

  return (
    <PageLayout>
      <AnimatedContainer animation="fade-in">
        <PageHeader
          title="Job Management"
          subtitle="Manage your jobs efficiently"
          icon={Wrench}
          badges={[
            { text: "Active Jobs", icon: Target, variant: "fixlyfy" },
            { text: "Performance", icon: TrendingUp, variant: "info" }
          ]}
          actionButton={{
            text: "Create Job",
            icon: Plus,
            onClick: () => setIsCreateJobModalOpen(true)
          }}
        />
      </AnimatedContainer>
      
      <AnimatedContainer animation="fade-in" delay={200}>
        <div className="space-y-6">
          <ModernCard variant="glass" className="p-4">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <JobsFilters 
                onFiltersChange={setFilters} 
                filters={filters}
              />
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefreshJobs}
                  className="flex gap-2 rounded-xl"
                  disabled={isOptimizedLoading}
                >
                  <RefreshCw size={18} className={isOptimizedLoading ? "animate-spin" : ""} /> 
                  Refresh
                </Button>
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
          
          <JobsListOptimized 
            isGridView={isGridView}
            jobs={filteredJobs}
            selectedJobs={selectedJobs}
            onSelectJob={handleSelectJob}
            onSelectAllJobs={handleSelectAllJobs}
            onRefresh={handleRefreshJobs}
          />
        </div>
      </AnimatedContainer>
      
      <BulkActionsBar
        selectedJobs={selectedJobs}
        onClearSelection={() => setSelectedJobs([])}
        onUpdateStatus={handleBulkUpdateStatus}
        onAssignTechnician={handleBulkAssignTechnician}
        onDeleteJobs={handleBulkDelete}
        onTagJobs={handleBulkTagJobs}
        onExport={handleBulkExport}
      />
      
      <ScheduleJobModal 
        open={isCreateJobModalOpen} 
        onOpenChange={setIsCreateJobModalOpen}
        onJobCreated={handleJobCreated}
        onSuccess={(job) => toast.success(`Job ${job.id} created successfully!`)}
      />
    </PageLayout>
  );
};

export default JobsPage;
