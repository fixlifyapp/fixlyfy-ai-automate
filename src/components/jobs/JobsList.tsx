
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

interface JobsListProps {
  jobs: Job[];
  isGridView: boolean;
  selectedJobs: string[];
  onSelectJob: (jobId: string, isSelected: boolean) => void;
  onSelectAllJobs: (isSelected: boolean) => void;
}

export const JobsList = ({ jobs = [], isGridView, selectedJobs = [], onSelectJob, onSelectAllJobs }: JobsListProps) => {
  const navigate = useNavigate();

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

  const formatJobForDisplay = (job: Job) => {
    return {
      id: job.id,
      client: job.client?.name || "Unknown Client",
      address: job.client?.address || "No address available",
      service: job.service || job.title || "Service Call",
      status: job.status || "scheduled",
      date: job.date ? new Date(job.date).toLocaleDateString() : "No date",
      time: job.schedule_start ? new Date(job.schedule_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "",
      technician: {
        name: "Unassigned",
        avatar: "",
        initials: "UA",
        id: job.technician_id || ""
      },
      priority: "medium" as "low" | "medium" | "high",
      revenue: job.revenue || 0,
      tags: job.tags || [],
      custom_fields: job.custom_fields || []
    };
  };

  const displayJobs = jobs.map(formatJobForDisplay);

  return (
    <>
      {isGridView ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayJobs.length === 0 ? (
            <div className="col-span-full text-center py-8 text-fixlyfy-text-secondary">
              <p>No jobs found.</p>
              <p className="text-sm mt-2">Try creating a new job or adjusting your filters.</p>
            </div>
          ) : (
            displayJobs.map((job) => (
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
                      <h3 className="font-medium">{job.client}</h3>
                      <p className="text-xs text-fixlyfy-text-secondary">{job.address}</p>
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
                  {/* Tags section for grid view */}
                  {job.tags && job.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {job.tags.slice(0, 2).map((tag, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className={`text-xs ${getTagColor(tag)}`}
                        >
                          {tag}
                        </Badge>
                      ))}
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
                        {job.date} {job.time}
                      </span>
                    </div>
                    <Badge className={cn(
                      "bg-fixlyfy-bg-interface border",
                      job.priority === "high" && "text-fixlyfy-error border-fixlyfy-error/20",
                      job.priority === "medium" && "text-fixlyfy border-fixlyfy/20",
                      job.priority === "low" && "text-fixlyfy-text-secondary border-fixlyfy-text-secondary/20"
                    )}>
                      {job.priority}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarImage src={job.technician.avatar} />
                        <AvatarFallback>{job.technician.initials}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs">{job.technician.name}</span>
                    </div>
                    <div className="text-sm font-medium">
                      ${job.revenue.toFixed(2)}
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
                <TableHead>Priority</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayJobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8 text-fixlyfy-text-secondary">
                    <p>No jobs found.</p>
                    <p className="text-sm mt-2">Try creating a new job or adjusting your filters.</p>
                  </TableCell>
                </TableRow>
              ) : (
                displayJobs.map((job, idx) => (
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
                      <div className="font-medium">{job.client}</div>
                      <div className="text-xs text-fixlyfy-text-secondary">{job.service}</div>
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
                          {job.tags.slice(0, 2).map((tag, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className={`text-xs ${getTagColor(tag)}`}
                            >
                              {tag}
                            </Badge>
                          ))}
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
                      {job.date} 
                      <div className="text-xs text-fixlyfy-text-secondary">{job.time}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Avatar className="h-7 w-7 mr-2">
                          <AvatarImage src={job.technician.avatar} />
                          <AvatarFallback>{job.technician.initials}</AvatarFallback>
                        </Avatar>
                        <span>{job.technician.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn(
                        "bg-fixlyfy-bg-interface border",
                        job.priority === "high" && "text-fixlyfy-error border-fixlyfy-error/20",
                        job.priority === "medium" && "text-fixlyfy border-fixlyfy/20",
                        job.priority === "low" && "text-fixlyfy-text-secondary border-fixlyfy-text-secondary/20"
                      )}>
                        {job.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      ${job.revenue.toFixed(2)}
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
