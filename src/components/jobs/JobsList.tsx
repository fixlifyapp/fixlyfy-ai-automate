
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  MoreVertical, 
  Pencil, 
  Eye, 
  Calendar, 
  UserPlus, 
  Mail, 
  Trash, 
  File,
  Tag
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { getTagColor } from "@/data/tags";
import { Job } from "@/hooks/useJobs";
import { useTags } from "@/hooks/useConfigItems";

interface JobsListProps {
  jobs: Job[];
  isGridView: boolean;
  selectedJobs: string[];
  onSelectJob: (jobId: string, isSelected: boolean) => void;
  onSelectAllJobs: (isSelected: boolean) => void;
}

export const JobsList = ({ jobs = [], isGridView, selectedJobs = [], onSelectJob, onSelectAllJobs }: JobsListProps) => {
  const navigate = useNavigate();
  const { items: tagItems } = useTags();

  // Create a map for tag colors
  const tagColorMap = tagItems.reduce((acc, tag) => {
    acc[tag.name] = tag.color || '#6366f1';
    return acc;
  }, {} as Record<string, string>);

  // Updated tag color function to use database colors
  const getTagColor = (tagName: string) => {
    const color = tagColorMap[tagName];
    if (color) {
      // Convert hex color to Tailwind classes
      return `border-current text-current`;
    }
    
    // Fallback to existing color scheme
    const tagColors: Record<string, string> = {
      "HVAC": "bg-purple-50 border-purple-200 text-purple-600",
      "Residential": "bg-blue-50 border-blue-200 text-blue-600",
      "Commercial": "bg-indigo-50 border-indigo-200 text-indigo-600",
      "Emergency": "bg-red-50 border-red-200 text-red-600",
      "Maintenance": "bg-green-50 border-green-200 text-green-600",
      "Installation": "bg-amber-50 border-amber-200 text-amber-600",
      "Repair": "bg-orange-50 border-orange-200 text-orange-600"
    };
    
    return tagColors[tagName] || "bg-purple-50 border-purple-200 text-purple-600";
  };

  const handleJobClick = (jobId: string) => {
    navigate(`/jobs/${jobId}`);
  };

  const areAllJobsSelected = jobs.length > 0 && selectedJobs && jobs.every(job => selectedJobs.includes(job.id));

  const handleCheckboxClick = (e: React.MouseEvent, jobId: string) => {
    e.stopPropagation();
    onSelectJob(jobId, !(selectedJobs && selectedJobs.includes(jobId)));
  };

  const handleSelectAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectAllJobs(!areAllJobsSelected);
  };

  const isJobSelected = (jobId: string) => selectedJobs && selectedJobs.includes(jobId);

  return (
    <>
      {isGridView ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {jobs.length === 0 ? (
            <div className="col-span-full text-center py-8 text-fixlyfy-text-secondary">
              <p>No jobs found.</p>
              <p className="text-sm mt-2">Try creating a new job or adjusting your filters.</p>
            </div>
          ) : (
            jobs.map((job) => (
              <div 
                key={job.id} 
                className={cn(
                  "fixlyfy-card hover:shadow-lg transition-shadow cursor-pointer relative",
                  isJobSelected(job.id) && "ring-2 ring-fixlyfy"
                )} 
                onClick={() => handleJobClick(job.id)}
              >
                <div className="absolute top-3 left-3 z-10" onClick={(e) => handleCheckboxClick(e, job.id)}>
                  <Checkbox checked={isJobSelected(job.id)} />
                </div>

                <div className="p-4 border-b border-fixlyfy-border">
                  <div className="flex justify-between items-start">
                    <div className="pl-7">
                      <Badge variant="outline" className="mb-2">
                        {job.id}
                      </Badge>
                      <h3 className="font-medium">{job.clients?.name || "Unknown Client"}</h3>
                      <p className="text-xs text-fixlyfy-text-secondary">{job.clients?.address || "No address"}</p>
                    </div>
                    <Badge className={cn(
                      job.status === "scheduled" && "bg-fixlyfy-info/10 text-fixlyfy-info",
                      job.status === "in-progress" && "bg-fixlyfy-warning/10 text-fixlyfy-warning",
                      job.status === "completed" && "bg-fixlyfy-success/10 text-fixlyfy-success",
                      job.status === "canceled" && "bg-fixlyfy-error/10 text-fixlyfy-error"
                    )}>
                      {job.status === "scheduled" && "Scheduled"}
                      {job.status === "in-progress" && "In Progress"}
                      {job.status === "completed" && "Completed"}
                      {job.status === "canceled" && "Canceled"}
                    </Badge>
                  </div>
                </div>
                <div className="p-4">
                  {/* Tags section for grid view with database colors */}
                  {job.tags && job.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {job.tags.slice(0, 2).map((tag, index) => {
                        const tagColor = tagColorMap[tag];
                        return (
                          <Badge
                            key={index}
                            variant="outline"
                            className={`text-xs ${getTagColor(tag)}`}
                            style={tagColor ? { borderColor: tagColor, color: tagColor } : undefined}
                          >
                            {tag}
                          </Badge>
                        );
                      })}
                      {job.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs bg-gray-50 border-gray-200 text-gray-600">
                          +{job.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Custom fields preview */}
                  {job.custom_fields && job.custom_fields.length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs text-muted-foreground mb-1">Custom Info:</div>
                      <div className="space-y-1">
                        {job.custom_fields.slice(0, 2).map((field) => (
                          <div key={field.id} className="text-xs">
                            <span className="font-medium">{field.name}:</span>{' '}
                            <span className="text-muted-foreground">
                              {field.value || 'Not set'}
                            </span>
                          </div>
                        ))}
                        {job.custom_fields.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{job.custom_fields.length - 2} more fields
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center">
                      <Calendar size={14} className="text-fixlyfy-text-secondary mr-1" />
                      <span className="text-xs text-fixlyfy-text-secondary">
                        {job.date ? new Date(job.date).toLocaleDateString() : "No date"} 
                        {job.schedule_start ? new Date(job.schedule_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="text-xs">{job.technician_id ? "Assigned" : "Unassigned"}</span>
                    </div>
                    <div className="text-sm font-medium">
                      ${(job.revenue || 0).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="fixlyfy-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox 
                    checked={areAllJobsSelected} 
                    onClick={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Job #</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Custom Info</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Technician</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-fixlyfy-text-secondary">
                    <p>No jobs found.</p>
                    <p className="text-sm mt-2">Try creating a new job or adjusting your filters.</p>
                  </TableCell>
                </TableRow>
              ) : (
                jobs.map((job, idx) => (
                  <TableRow 
                    key={job.id}
                    className={cn(
                      idx % 2 === 0 ? "bg-white" : "bg-fixlyfy-bg-interface/50",
                      "cursor-pointer hover:bg-fixlyfy-bg-interface",
                      isJobSelected(job.id) && "bg-fixlyfy/5"
                    )}
                    onClick={() => handleJobClick(job.id)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox 
                        checked={isJobSelected(job.id)} 
                        onClick={(e) => handleCheckboxClick(e, job.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{job.id}</span>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{job.clients?.name || "Unknown Client"}</div>
                      <div className="text-xs text-fixlyfy-text-secondary">{job.service || job.title || "No service specified"}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn(
                        job.status === "scheduled" && "bg-fixlyfy-info/10 text-fixlyfy-info",
                        job.status === "in-progress" && "bg-fixlyfy-warning/10 text-fixlyfy-warning",
                        job.status === "completed" && "bg-fixlyfy-success/10 text-fixlyfy-success",
                        job.status === "canceled" && "bg-fixlyfy-error/10 text-fixlyfy-error"
                      )}>
                        {job.status === "scheduled" && "Scheduled"}
                        {job.status === "in-progress" && "In Progress"}
                        {job.status === "completed" && "Completed"}
                        {job.status === "canceled" && "Canceled"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {job.tags && job.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {job.tags.slice(0, 2).map((tag, index) => {
                            const tagColor = tagColorMap[tag];
                            return (
                              <Badge
                                key={index}
                                variant="outline"
                                className={`text-xs ${getTagColor(tag)}`}
                                style={tagColor ? { borderColor: tagColor, color: tagColor } : undefined}
                              >
                                {tag}
                              </Badge>
                            );
                          })}
                          {job.tags.length > 2 && (
                            <Badge 
                              variant="outline" 
                              className="text-xs bg-gray-50 border-gray-200 text-gray-600"
                              title={job.tags.slice(2).join(", ")}
                            >
                              +{job.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">No tags</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {job.custom_fields && job.custom_fields.length > 0 ? (
                        <div className="space-y-1">
                          {job.custom_fields.slice(0, 1).map((field) => (
                            <div key={field.id} className="text-xs">
                              <span className="font-medium">{field.name}:</span>{' '}
                              <span className="text-muted-foreground">
                                {field.value || 'Not set'}
                              </span>
                            </div>
                          ))}
                          {job.custom_fields.length > 1 && (
                            <div className="text-xs text-muted-foreground">
                              +{job.custom_fields.length - 1} more
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">No custom fields</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {job.date ? new Date(job.date).toLocaleDateString() : "No date"}
                      {job.schedule_start && (
                        <div className="text-xs text-fixlyfy-text-secondary">
                          {new Date(job.schedule_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span>{job.technician_id ? "Assigned" : "Unassigned"}</span>
                    </TableCell>
                    <TableCell className="font-medium">
                      ${(job.revenue || 0).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => navigate(`/jobs/${job.id}`)}>
                            <Eye size={16} className="mr-2" /> View
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Pencil size={16} className="mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <UserPlus size={16} className="mr-2" /> Assign Technician
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail size={16} className="mr-2" /> Send Reminder
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Tag size={16} className="mr-2" /> Manage Tags
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <File size={16} className="mr-2" /> View Invoice
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-fixlyfy-error">
                            <Trash size={16} className="mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
};
