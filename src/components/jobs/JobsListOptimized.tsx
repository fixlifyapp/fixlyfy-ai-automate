
import { memo, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ModernCard } from "@/components/ui/modern-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Edit, 
  Calendar, 
  MapPin, 
  DollarSign,
  Tag,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";
import { Job } from "@/hooks/useJobs";
import { useTags } from "@/hooks/useConfigItems";
import { getTagColor } from "@/data/tags";

interface JobsListOptimizedProps {
  jobs: Job[];
  isGridView?: boolean;
  selectedJobs: string[];
  onSelectJob: (jobId: string, isSelected: boolean) => void;
  onSelectAllJobs: (isSelected: boolean) => void;
  onRefresh?: () => void;
}

// Loading skeleton component
const JobCardSkeleton = memo(() => (
  <ModernCard variant="elevated" className="animate-pulse">
    <div className="p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-8 w-8" />
      </div>
      <div>
        <Skeleton className="h-6 w-3/4 mb-1" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-16" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  </ModernCard>
));

JobCardSkeleton.displayName = "JobCardSkeleton";

// Memoized job card component to prevent unnecessary re-renders
const JobCard = memo(({ 
  job, 
  isSelected, 
  onSelect, 
  onEdit,
  tagItems 
}: { 
  job: Job; 
  isSelected: boolean; 
  onSelect: (checked: boolean) => void; 
  onEdit: () => void;
  tagItems: Array<{id: string, name: string, color?: string}>;
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

  // Resolve tags to get proper names and colors
  const resolvedTags = useMemo(() => {
    if (!job.tags || job.tags.length === 0) return [];
    
    return job.tags.map(tag => {
      // If it's a UUID, find the tag by ID
      if (typeof tag === 'string' && tag.length === 36 && tag.includes('-')) {
        const tagItem = tagItems.find(t => t.id === tag);
        return tagItem ? { name: tagItem.name, color: tagItem.color } : { name: tag, color: getTagColor(tag) };
      }
      // If it's a name, find the tag by name for color
      const tagItem = tagItems.find(t => t.name === tag);
      return tagItem ? { name: tagItem.name, color: tagItem.color } : { name: String(tag), color: getTagColor(String(tag)) };
    });
  }, [job.tags, tagItems]);

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
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
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
        
        {resolvedTags && resolvedTags.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            <Tag className="h-3 w-3 text-gray-500" />
            {resolvedTags.slice(0, 2).map((tag, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="text-xs"
                style={tag.color ? { borderColor: tag.color, color: tag.color } : undefined}
              >
                {tag.name}
              </Badge>
            ))}
            {resolvedTags.length > 2 && (
              <span className="text-xs text-gray-500">
                +{resolvedTags.length - 2} more
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
  const { items: tagItems } = useTags();

  const handleJobClick = (jobId: string) => {
    navigate(`/jobs/${jobId}`);
  };

  const handleEditJob = (jobId: string) => {
    navigate(`/jobs/${jobId}`);
  };

  const areAllJobsSelected = useMemo(() => 
    jobs.length > 0 && jobs.every(job => selectedJobs.includes(job.id)),
    [jobs, selectedJobs]
  );

  // Show loading skeletons while jobs are being fetched
  if (jobs.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox disabled />
            <span className="text-sm text-gray-600">Loading jobs...</span>
          </div>
          {onRefresh && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onRefresh}
              disabled
            >
              <RefreshCw className="animate-spin" size={16} />
              Refresh
            </Button>
          )}
        </div>
        
        {isGridView ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <JobCardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {Array.from({ length: 10 }).map((_, index) => (
              <JobCardSkeleton key={index} />
            ))}
          </div>
        )}
      </div>
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
              <RefreshCw size={16} />
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
                onEdit={() => handleEditJob(job.id)}
                tagItems={tagItems}
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
