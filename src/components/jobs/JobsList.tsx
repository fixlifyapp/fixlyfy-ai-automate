
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ModernCard } from "@/components/ui/modern-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ExternalLink, 
  Edit, 
  Calendar, 
  User, 
  MapPin, 
  DollarSign,
  Tag,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { Job } from "@/hooks/useJobs";
import { useJobStatuses, useJobTypes } from "@/hooks/useConfigItems";

interface JobsListProps {
  jobs: Job[];
  isGridView?: boolean;
  selectedJobs: string[];
  onSelectJob: (jobId: string, isSelected: boolean) => void;
  onSelectAllJobs: (isSelected: boolean) => void;
}

export const JobsList = ({ 
  jobs, 
  isGridView = false, 
  selectedJobs, 
  onSelectJob, 
  onSelectAllJobs 
}: JobsListProps) => {
  const navigate = useNavigate();
  
  // Get configuration data for styling and display
  const { items: jobStatuses } = useJobStatuses();
  const { items: jobTypes } = useJobTypes();

  const handleJobClick = (jobId: string) => {
    navigate(`/jobs/${jobId}`);
  };

  const handleEditJob = (e: React.MouseEvent, jobId: string) => {
    e.stopPropagation();
    navigate(`/jobs/${jobId}`);
  };

  const areAllJobsSelected = jobs.length > 0 && jobs.every(job => selectedJobs.includes(job.id));

  // Get status styling from configuration
  const getStatusBadgeStyle = (status: string) => {
    const statusConfig = jobStatuses?.find(s => s.name.toLowerCase() === status.toLowerCase());
    if (statusConfig?.color) {
      return { backgroundColor: `${statusConfig.color}20`, color: statusConfig.color, borderColor: statusConfig.color };
    }
    
    // Fallback styles
    const statusStyles: Record<string, any> = {
      "completed": { backgroundColor: "#10b98120", color: "#10b981", borderColor: "#10b981" },
      "in-progress": { backgroundColor: "#3b82f620", color: "#3b82f6", borderColor: "#3b82f6" }, 
      "scheduled": { backgroundColor: "#f59e0b20", color: "#f59e0b", borderColor: "#f59e0b" },
      "cancelled": { backgroundColor: "#ef444420", color: "#ef4444", borderColor: "#ef4444" },
      "canceled": { backgroundColor: "#ef444420", color: "#ef4444", borderColor: "#ef4444" }
    };
    
    return statusStyles[status.toLowerCase()] || { backgroundColor: "#6b728020", color: "#6b7280", borderColor: "#6b7280" };
  };

  // Get job type styling from configuration
  const getJobTypeDisplay = (job: Job) => {
    if (job.job_type) {
      const jobTypeConfig = jobTypes?.find(jt => jt.name === job.job_type);
      return {
        name: jobTypeConfig?.name || job.job_type,
        color: jobTypeConfig?.color
      };
    }
    if (job.service) {
      return { name: job.service, color: null };
    }
    return { name: "Service Job", color: null };
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'in-progress':
        return <Clock className="h-4 w-4" />;
      case 'scheduled':
        return <Calendar className="h-4 w-4" />;
      case 'cancelled':
      case 'canceled':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (jobs.length === 0) {
    return (
      <ModernCard variant="elevated" className="p-12 text-center">
        <div className="text-muted-foreground">
          <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
          <p>Start by creating your first job.</p>
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
            <span className="text-sm text-muted-foreground">
              Select all ({jobs.length})
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => {
            const statusStyle = getStatusBadgeStyle(job.status);
            const jobTypeDisplay = getJobTypeDisplay(job);
            const statusIcon = getStatusIcon(job.status);
            
            return (
              <div key={job.id} className="cursor-pointer" onClick={() => handleJobClick(job.id)}>
                <ModernCard 
                  variant="elevated" 
                  className="hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          checked={selectedJobs.includes(job.id)}
                          onCheckedChange={(checked) => onSelectJob(job.id, !!checked)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="font-mono text-sm text-muted-foreground">{job.id}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleEditJob(e, job.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">{job.title}</h3>
                      {job.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{job.description}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant="outline" 
                        className="flex items-center gap-1"
                        style={statusStyle}
                      >
                        {statusIcon}
                        {job.status}
                      </Badge>
                      
                      {jobTypeDisplay.color ? (
                        <Badge 
                          variant="outline"
                          style={{ borderColor: jobTypeDisplay.color, color: jobTypeDisplay.color }}
                        >
                          {jobTypeDisplay.name}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          {jobTypeDisplay.name}
                        </Badge>
                      )}
                    </div>
                    
                    {job.date && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-2" />
                        {format(new Date(job.date), "MMM dd, yyyy")}
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
                        <Tag className="h-3 w-3 text-muted-foreground" />
                        {job.tags.slice(0, 2).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {job.tags.length > 2 && (
                          <span className="text-xs text-muted-foreground">
                            +{job.tags.length - 2} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </ModernCard>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // List view (table format)
  return (
    <ModernCard variant="elevated">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-4 w-12">
                <Checkbox 
                  checked={areAllJobsSelected}
                  onCheckedChange={onSelectAllJobs}
                />
              </th>
              <th className="text-left p-4 font-semibold">Job ID</th>
              <th className="text-left p-4 font-semibold">Title</th>
              <th className="text-left p-4 font-semibold">Status</th>
              <th className="text-left p-4 font-semibold">Type</th>
              <th className="text-left p-4 font-semibold">Date</th>
              <th className="text-left p-4 font-semibold">Revenue</th>
              <th className="text-right p-4 w-20">Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => {
              const statusStyle = getStatusBadgeStyle(job.status);
              const jobTypeDisplay = getJobTypeDisplay(job);
              const statusIcon = getStatusIcon(job.status);
              
              return (
                <tr 
                  key={job.id} 
                  className="border-b hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleJobClick(job.id)}
                >
                  <td className="p-4">
                    <Checkbox 
                      checked={selectedJobs.includes(job.id)}
                      onCheckedChange={(checked) => onSelectJob(job.id, !!checked)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  <td className="p-4">
                    <span className="font-mono text-sm">{job.id}</span>
                  </td>
                  <td className="p-4">
                    <div>
                      <div className="font-medium">{job.title}</div>
                      {job.description && (
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {job.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge 
                      variant="outline" 
                      className="flex items-center gap-1 w-fit"
                      style={statusStyle}
                    >
                      {statusIcon}
                      {job.status}
                    </Badge>
                  </td>
                  <td className="p-4">
                    {jobTypeDisplay.color ? (
                      <Badge 
                        variant="outline"
                        style={{ borderColor: jobTypeDisplay.color, color: jobTypeDisplay.color }}
                      >
                        {jobTypeDisplay.name}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        {jobTypeDisplay.name}
                      </Badge>
                    )}
                  </td>
                  <td className="p-4">
                    {job.date ? (
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        {format(new Date(job.date), "MMM dd, yyyy")}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="p-4">
                    {job.revenue && job.revenue > 0 ? (
                      <div className="flex items-center text-sm font-medium text-green-600">
                        <DollarSign className="h-4 w-4 mr-1" />
                        ${job.revenue.toFixed(2)}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleEditJob(e, job.id)}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </ModernCard>
  );
};
