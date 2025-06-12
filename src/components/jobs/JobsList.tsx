
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ModernCard } from "@/components/ui/modern-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
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
import { useJobStatuses, useJobTypes, useTags } from "@/hooks/useConfigItems";

interface JobsListProps {
  jobs: Job[];
  isGridView?: boolean;
  selectedJobs: string[];
  onSelectJob: (jobId: string, isSelected: boolean) => void;
  onSelectAllJobs: (isSelected: boolean) => void;
  onRefresh?: () => void;
  showClientColumn?: boolean;
}

export const JobsList = ({ 
  jobs, 
  isGridView = true, 
  selectedJobs = [], 
  onSelectJob, 
  onSelectAllJobs,
  showClientColumn = true,
  onRefresh 
}: JobsListProps) => {
  const navigate = useNavigate();
  
  // Get configuration data for styling and display
  const { items: jobStatuses } = useJobStatuses();
  const { items: jobTypes } = useJobTypes();
  const { items: tagItems } = useTags();

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

  // Resolve tag UUIDs to tag names and colors
  const resolveJobTags = (tags: string[]) => {
    if (!tags || tags.length === 0) return [];
    
    return tags.map(tag => {
      // If it's a UUID, find the tag by ID
      if (tag.length === 36 && tag.includes('-')) {
        const tagItem = tagItems.find(t => t.id === tag);
        return tagItem ? { name: tagItem.name, color: tagItem.color } : { name: tag, color: null };
      }
      // If it's a name, find the tag by name
      const tagItem = tagItems.find(t => t.name === tag);
      return tagItem ? { name: tagItem.name, color: tagItem.color } : { name: tag, color: null };
    });
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

  const formatTime = (job: Job) => {
    if (job.schedule_start) {
      return format(new Date(job.schedule_start), "HH:mm");
    }
    if (job.date) {
      return format(new Date(job.date), "HH:mm");
    }
    return "TBD";
  };

  const getClientName = (client: any): string => {
    if (typeof client === 'string') return client;
    if (typeof client === 'object' && client?.name) return client.name;
    return 'Unknown Client';
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {jobs.map((job) => {
        const isSelected = selectedJobs.includes(job.id);
        const clientName = getClientName(job.client);
        const statusStyle = getStatusBadgeStyle(job.status);
        const statusIcon = getStatusIcon(job.status);
        const jobTypeDisplay = getJobTypeDisplay(job);
        const resolvedTags = resolveJobTags(job.tags || []);
        
        return (
          <Card 
            key={job.id} 
            className={`relative transition-all duration-200 hover:shadow-md cursor-pointer group ${
              isSelected ? 'ring-2 ring-primary shadow-lg' : ''
            }`}
            onClick={() => handleJobClick(job.id)}
          >
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    checked={selectedJobs.includes(job.id)}
                    onCheckedChange={(checked) => onSelectJob(job.id, !!checked)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="font-mono text-sm font-medium text-fixlyfy">{job.id}</span>
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
                <h3 className="font-semibold text-lg mb-1">{clientName}</h3>
                <p className="text-sm text-muted-foreground">{formatTime(job)}</p>
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
              
              {job.address && (
                <div className="flex items-center text-sm text-muted-foreground">
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
                  <Tag className="h-3 w-3 text-muted-foreground" />
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
                    <span className="text-xs text-muted-foreground">
                      +{resolvedTags.length - 2} more
                    </span>
                  )}
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );

  const renderTableView = () => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="border-b">
            <TableHead className="text-left p-4 w-12">
              <Checkbox 
                checked={areAllJobsSelected}
                onCheckedChange={onSelectAllJobs}
              />
            </TableHead>
            <TableHead className="text-left p-4 font-semibold">Job Number</TableHead>
            <TableHead className="text-left p-4 font-semibold">Client Name</TableHead>
            <TableHead className="text-left p-4 font-semibold">Time</TableHead>
            <TableHead className="text-left p-4 font-semibold">Address</TableHead>
            <TableHead className="text-left p-4 font-semibold">Tags</TableHead>
            <TableHead className="text-left p-4 font-semibold">Revenue</TableHead>
            <TableHead className="text-right p-4 w-20">
              Actions
              {onRefresh && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={onRefresh}
                  className="ml-2"
                >
                  Refresh
                </Button>
              )}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => {
            const statusStyle = getStatusBadgeStyle(job.status);
            const resolvedTags = resolveJobTags(job.tags || []);
            const clientName = getClientName(job.client);
            
            return (
              <TableRow 
                key={job.id} 
                className="border-b hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => handleJobClick(job.id)}
              >
                <TableCell className="p-4">
                  <Checkbox 
                    checked={selectedJobs.includes(job.id)}
                    onCheckedChange={(checked) => onSelectJob(job.id, !!checked)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </TableCell>
                <TableCell className="p-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium text-fixlyfy">{job.id}</span>
                    <Badge 
                      variant="outline" 
                      className="text-xs"
                      style={statusStyle}
                    >
                      {job.status}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="p-4">
                  <div className="font-medium">{clientName}</div>
                </TableCell>
                <TableCell className="p-4">
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2" />
                    {formatTime(job)}
                  </div>
                </TableCell>
                <TableCell className="p-4">
                  {job.address ? (
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="truncate max-w-[200px]">{job.address}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="p-4">
                  {resolvedTags && resolvedTags.length > 0 ? (
                    <div className="flex items-center gap-1 flex-wrap">
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
                        <span className="text-xs text-muted-foreground">
                          +{resolvedTags.length - 2}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="p-4">
                  {job.revenue && job.revenue > 0 ? (
                    <div className="flex items-center text-sm font-medium text-green-600">
                      <DollarSign className="h-4 w-4 mr-1" />
                      ${job.revenue.toFixed(2)}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="p-4 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleEditJob(e, job.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );

  if (jobs.length === 0) {
    return (
      <ModernCard variant="elevated" className="p-12 text-center">
        <div className="text-muted-foreground">
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
    return renderGridView();
  }

  // List view (table format)
  return renderTableView();
};
