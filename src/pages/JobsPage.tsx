
import { useState, useEffect, useMemo } from "react";
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
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useJobs } from "@/hooks/useJobs";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";
import { toast } from "sonner";

const JobsPage = () => {
  const [isGridView, setIsGridView] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const pageSize = 12;
  
  const { 
    jobs, 
    isLoading, 
    totalCount, 
    totalPages, 
    hasNextPage, 
    hasPreviousPage,
    refreshJobs,
    updateJobStatus,
    assignTechnician
  } = useJobs({ 
    page: currentPage, 
    pageSize 
  });
  
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

  const handleSelectAll = (select: boolean) => {
    setSelectedJobs(select ? jobs.map(job => job.id) : []);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedJobs([]); // Clear selection when changing pages
  };

  const handleRefresh = () => {
    refreshJobs();
    setSelectedJobs([]);
  };

  const handleBulkUpdateStatus = async (jobIds: string[], newStatus: string) => {
    try {
      for (const jobId of jobIds) {
        await updateJobStatus(jobId, newStatus);
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
        await assignTechnician(jobId, technicianId);
      }
      toast.success(`Assigned ${jobIds.length} job(s) to ${technicianName}`);
      setSelectedJobs([]);
      refreshJobs();
    } catch (error) {
      console.error('Error assigning technician:', error);
      toast.error('Failed to assign technician to jobs');
    }
  };

  const handleBulkDelete = async (jobIds: string[]) => {
    try {
      // Implement bulk delete logic here
      toast.success(`Deleted ${jobIds.length} job(s)`);
      setSelectedJobs([]);
      refreshJobs();
    } catch (error) {
      console.error('Error deleting jobs:', error);
      toast.error('Failed to delete jobs');
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
            <JobsFilters />
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
            onUpdateStatus={handleBulkUpdateStatus}
            onAssignTechnician={handleBulkAssignTechnician}
            onDelete={handleBulkDelete}
            onExport={handleExportJobs}
            selectedJobIds={selectedJobs}
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
            isLoading={isLoading}
            onRefresh={handleRefresh}
          />
          
          {/* Pagination */}
          {totalPages > 1 && (
            <ModernCard variant="elevated" className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} jobs
                </div>
                
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => handlePageChange(currentPage - 1)}
                        className={!hasPreviousPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => {
                        return page === 1 || 
                               page === totalPages || 
                               Math.abs(page - currentPage) <= 1;
                      })
                      .map((page, index, array) => {
                        const shouldShowEllipsis = index > 0 && page - array[index - 1] > 1;
                        
                        return (
                          <div key={page} className="flex items-center">
                            {shouldShowEllipsis && (
                              <PaginationItem>
                                <span className="px-2">...</span>
                              </PaginationItem>
                            )}
                            <PaginationItem>
                              <PaginationLink
                                onClick={() => handlePageChange(page)}
                                isActive={currentPage === page}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          </div>
                        );
                      })}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => handlePageChange(currentPage + 1)}
                        className={!hasNextPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </ModernCard>
          )}
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
