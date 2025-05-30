
import { memo, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ModernCard } from "@/components/ui/modern-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Edit, 
  Calendar, 
  MapPin, 
  DollarSign,
  Tag,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { Job } from "@/hooks/useJobs";

interface JobsListOptimizedProps {
  jobs: Job[];
  isGridView?: boolean;
  selectedJobs: string[];
  onSelectJob: (jobId: string, isSelected: boolean) => void;
  onSelectAllJobs: (isSelected: boolean) => void;
  onRefresh?: () => void;
}

// Memoized job card component to prevent unnecessary re-renders
const JobCard = memo(({ 
  job, 
  isSelected, 
  onSelect, 
  onEdit 
}: { 
  job: Job; 
  isSelected: boolean; 
  onSelect: (checked: boolean) => void; 
  onEdit: () => void;
}) => {
  const getStatusBadgeStyle = (status: string) => {
    const statusStyles: Record<string, any> = {
      "completed": "bg-green-100 text-green-700 border-green-200",
      "in-progress": "bg-blue-100 text-blue-700 border-blue-200", 
      "scheduled": "bg-amber-100 text-amber-700 border-amber-200",
      "cancelled": "bg-red-100 text-red-700 border-red-200",
      "canceled": "bg-red-100 text-red-700 border-red-200"
    };
    return statusStyles[status.toLowerCase()] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'in-progress': return <Clock className="h-4 w-4" />;
      case 'scheduled': return <Calendar className="h-4 w-4" />;
      case 'cancelled':
      case 'canceled': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatTime = () => {
    if (job.schedule_start) {
      return format(new Date(job.schedule_start), "HH:mm");
    }
    if (job.date) {
      return format(new Date(job.date), "HH:mm");
    }
    return "TBD";
  };

  return (
    <ModernCard variant="elevated" className="hover:shadow-lg transition-shadow duration-200 group cursor-pointer">
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox 
              checked={isSelected}
              onCheckedChange={onSelect}
              onClick={(e) => e.stopPropagation()}
            />
            <span className="font-mono text-sm font-medium text-blue-600">{job.id}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
        
        <div>
          <h3 className="font-semibold text-lg mb-1">{job.client?.name || 'Unknown Client'}</h3>
          <p className="text-sm text-gray-600">{formatTime()}</p>
        </div>
        
        <div className="flex items-center justify-between">
          <Badge 
            variant="outline" 
            className={`flex items-center gap-1 ${getStatusBadgeStyle(job.status)}`}
          >
            {getStatusIcon(job.status)}
            {job.status}
          </Badge>
          
          {(job.job_type || job.service) && (
            <Badge variant="secondary">
              {job.job_type || job.service}
            </Badge>
          )}
        </div>
        
        {job.address && (
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            <span className="truncate">{job.address}</span>
          </div>
        )}
        
        {job.revenue && job.revenue > 0 && (
          <div className="flex items-center text-sm font-medium text-green-600">
            <DollarSign className="h-4 w-4 mr-1" />
            ${job.revenue.toFixed(2)}
          </div>
        )}
        
        {job.tags && job.tags.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            <Tag className="h-3 w-3 text-gray-500" />
            {job.tags.slice(0, 2).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {typeof tag === 'string' ? tag : String(tag)}
              </Badge>
            ))}
            {job.tags.length > 2 && (
              <span className="text-xs text-gray-500">
                +{job.tags.length - 2} more
              </span>
            )}
          </div>
        )}
      </div>
    </ModernCard>
  );
});

JobCard.displayName = "JobCard";

export const JobsListOptimized = memo(({ 
  jobs, 
  isGridView = false, 
  selectedJobs, 
  onSelectJob, 
  onSelectAllJobs,
  onRefresh
}: JobsListOptimizedProps) => {
  const navigate = useNavigate();

  const handleJobClick = (jobId: string) => {
    navigate(`/jobs/${jobId}`);
  };

  const handleEditJob = (e: React.MouseEvent, jobId: string) => {
    e.stopPropagation();
    navigate(`/jobs/${jobId}`);
  };

  const areAllJobsSelected = useMemo(() => 
    jobs.length > 0 && jobs.every(job => selectedJobs.includes(job.id)),
    [jobs, selectedJobs]
  );

  if (jobs.length === 0) {
    return (
      <ModernCard variant="elevated" className="p-12 text-center">
        <div className="text-gray-500">
          <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
          <p>No jobs match your current filters.</p>
          {onRefresh && (
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={onRefresh}
            >
              Refresh Jobs
            </Button>
          )}
        </div>
      </ModernCard>
    );
  }

  if (isGridView) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox 
              checked={areAllJobsSelected}
              onCheckedChange={onSelectAllJobs}
            />
            <span className="text-sm text-gray-600">
              Select all ({jobs.length})
            </span>
          </div>
          {onRefresh && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onRefresh}
            >
              Refresh
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job) => (
            <div key={job.id} onClick={() => handleJobClick(job.id)}>
              <JobCard
                job={job}
                isSelected={selectedJobs.includes(job.id)}
                onSelect={(checked) => onSelectJob(job.id, checked)}
                onEdit={(e) => handleEditJob(e, job.id)}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // List view implementation would go here...
  return (
    <div className="space-y-4">
      <p className="text-gray-600">List view - {jobs.length} jobs loaded</p>
    </div>
  );
});

JobsListOptimized.displayName = "JobsListOptimized";
