
import React from 'react';
import { Job } from '@/hooks/useJobs';
import { ModernCard } from '@/components/ui/modern-card';
import { AnimatedContainer } from '@/components/ui/animated-container';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { Eye, Edit, Calendar, MapPin, DollarSign, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatDate } from '@/lib/utils';

interface JobsListProps {
  jobs: Job[];
  isLoading: boolean;
  onRefresh: () => void;
}

const statusColors = {
  scheduled: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
} as const;

// Helper function to get client name
const getClientName = (client: any): string => {
  if (typeof client === 'string') {
    return client;
  }
  if (client && typeof client === 'object' && client.name) {
    return client.name;
  }
  return 'Unassigned';
};

export const JobsList = ({ jobs, isLoading, onRefresh }: JobsListProps) => {
  const navigate = useNavigate();

  if (isLoading) {
    return <LoadingSkeleton type="job-list" count={5} />;
  }

  if (jobs.length === 0) {
    return (
      <AnimatedContainer>
        <ModernCard className="p-12 text-center">
          <div className="text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
            <p>Start by creating your first job or adjust your filters.</p>
          </div>
        </ModernCard>
      </AnimatedContainer>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job, index) => (
        <AnimatedContainer key={job.id} delay={index * 50}>
          <ModernCard className="p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                  <Badge 
                    className={statusColors[job.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}
                  >
                    {job.status?.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {job.description || 'No description provided'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/jobs/${job.id}`)}
                  className="gap-2"
                >
                  <Eye className="h-4 w-4" />
                  View
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Client</p>
                  <p className="font-medium">{getClientName(job.client)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Scheduled</p>
                  <p className="font-medium">
                    {job.schedule_start ? formatDate(job.schedule_start) : 'Not scheduled'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Location</p>
                  <p className="font-medium truncate" title={job.address}>
                    {job.address || 'No address'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Value</p>
                  <p className="font-medium">
                    {job.revenue ? formatCurrency(job.revenue) : 'TBD'}
                  </p>
                </div>
              </div>
            </div>

            {job.tags && job.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {job.tags.map((tag, tagIndex) => (
                  <Badge key={tagIndex} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </ModernCard>
        </AnimatedContainer>
      ))}
    </div>
  );
};
