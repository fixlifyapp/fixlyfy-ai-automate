
import React from 'react';
import { ModernCard } from '@/components/ui/modern-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, MapPin, User, MoreHorizontal } from 'lucide-react';
import { Job } from '@/hooks/useJobs';

interface JobsKanbanProps {
  jobs: Job[];
  isLoading: boolean;
  onRefresh: () => void;
}

interface KanbanColumn {
  id: string;
  title: string;
  status: string;
  jobs: Job[];
}

export const JobsKanban = ({ jobs, isLoading, onRefresh }: JobsKanbanProps) => {
  const columns: KanbanColumn[] = [
    {
      id: 'scheduled',
      title: 'Scheduled',
      status: 'scheduled',
      jobs: jobs.filter(job => job.status === 'scheduled')
    },
    {
      id: 'in_progress',
      title: 'In Progress',
      status: 'in_progress',
      jobs: jobs.filter(job => job.status === 'in_progress')
    },
    {
      id: 'completed',
      title: 'Completed',
      status: 'completed',
      jobs: jobs.filter(job => job.status === 'completed')
    },
    {
      id: 'cancelled',
      title: 'Cancelled',
      status: 'cancelled',
      jobs: jobs.filter(job => job.status === 'cancelled')
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-3">
            <div className="h-6 bg-gray-200 rounded animate-pulse" />
            <div className="space-y-2">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-24 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {columns.map((column) => (
        <div key={column.id} className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-gray-700">{column.title}</h3>
            <Badge variant="outline" className="text-xs">
              {column.jobs.length}
            </Badge>
          </div>
          
          <div className="space-y-2 min-h-[200px]">
            {column.jobs.map((job) => (
              <ModernCard key={job.id} className="p-3 hover:shadow-md transition-shadow cursor-pointer">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium text-sm truncate">
                      {job.title || `Job ${job.id}`}
                    </h4>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getStatusColor(job.status)}`}
                  >
                    {job.status.replace('_', ' ')}
                  </Badge>
                  
                  {job.client && (
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <User className="h-3 w-3" />
                      <span className="truncate">
                        {typeof job.client === 'string' ? job.client : job.client.name || 'Unknown Client'}
                      </span>
                    </div>
                  )}
                  
                  {job.date && (
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <CalendarDays className="h-3 w-3" />
                      <span>{new Date(job.date).toLocaleDateString()}</span>
                    </div>
                  )}
                  
                  {job.address && (
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{job.address}</span>
                    </div>
                  )}
                  
                  {job.revenue && (
                    <div className="text-sm font-medium text-green-600">
                      ${job.revenue.toFixed(2)}
                    </div>
                  )}
                </div>
              </ModernCard>
            ))}
            
            {column.jobs.length === 0 && (
              <div className="text-center text-gray-500 text-xs py-8">
                No jobs in {column.title.toLowerCase()}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
