
import React, { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/ui/page-header';
import { ModernCard } from '@/components/ui/modern-card';
import { AnimatedContainer } from '@/components/ui/animated-container';
import { JobsList } from '@/components/jobs/JobsList';
import { JobsKanban } from '@/components/jobs/JobsKanban';
import { CreateJobDialog } from '@/components/jobs/dialogs/CreateJobDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useJobsOptimized } from '@/hooks/useJobsOptimized';
import { Plus, Search, Grid, List, Filter } from 'lucide-react';

const JobsPage = () => {
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  const { jobs, isLoading, refreshJobs, canCreate } = useJobsOptimized({
    page: 1,
    pageSize: 50,
    enableRealtime: true
  });

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = !searchTerm || 
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleCreateSuccess = () => {
    setShowCreateDialog(false);
    refreshJobs();
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        <PageHeader
          title="Jobs"
          subtitle="Manage and track all your service jobs"
          action={
            canCreate ? (
              <Button 
                onClick={() => setShowCreateDialog(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                New Job
              </Button>
            ) : null
          }
        />

        <AnimatedContainer>
          <ModernCard className="p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search jobs by title, client, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              {/* View Toggle */}
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'kanban' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('kanban')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Jobs Display */}
            {viewMode === 'list' ? (
              <JobsList 
                jobs={filteredJobs} 
                isLoading={isLoading}
                onRefresh={refreshJobs}
              />
            ) : (
              <JobsKanban 
                jobs={filteredJobs} 
                isLoading={isLoading}
                onRefresh={refreshJobs}
              />
            )}
          </ModernCard>
        </AnimatedContainer>

        {/* Create Job Dialog */}
        <CreateJobDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSuccess={handleCreateSuccess}
        />
      </div>
    </PageLayout>
  );
};

export default JobsPage;
