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
import { jobs } from "@/data/real-jobs";

interface JobsListProps {
  isGridView: boolean;
  selectedJobs: string[];
  onSelectJob: (jobId: string, isSelected: boolean) => void;
  onSelectAllJobs: (isSelected: boolean) => void;
}

export const JobsList = ({ isGridView, selectedJobs = [], onSelectJob, onSelectAllJobs }: JobsListProps) => {
  const navigate = useNavigate();

  const handleJobClick = (jobId: string) => {
    navigate(`/jobs/${jobId}`);
  };

  // Add null/undefined check to prevent the error
  const areAllJobsSelected = jobs.length > 0 && selectedJobs && jobs.every(job => selectedJobs.includes(job.id));

  // Modified to handle selection without propagation
  const handleCheckboxClick = (e: React.MouseEvent, jobId: string) => {
    e.stopPropagation();
    onSelectJob(jobId, !(selectedJobs && selectedJobs.includes(jobId)));
  };

  const handleSelectAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectAllJobs(!areAllJobsSelected);
  };

  // Add safety checks for selectedJobs
  const isJobSelected = (jobId: string) => selectedJobs && selectedJobs.includes(jobId);

  return (
    <>
      {isGridView ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {jobs.map((job) => (
            <div 
              key={job.id} 
              className={cn(
                "fixlyfy-card hover:shadow-lg transition-shadow cursor-pointer relative",
                isJobSelected(job.id) && "ring-2 ring-fixlyfy"
              )} 
              onClick={() => handleJobClick(job.id)}
            >
              {/* Add checkbox for selection */}
              <div className="absolute top-3 left-3 z-10" onClick={(e) => handleCheckboxClick(e, job.id)}>
                <Checkbox checked={isJobSelected(job.id)} />
              </div>

              <div className="p-4 border-b border-fixlyfy-border">
                <div className="flex justify-between items-start">
                  <div className="pl-7"> {/* Add padding to make room for checkbox */}
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
              
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center">
                    <Calendar size={14} className="text-fixlyfy-text-secondary mr-1" />
                    <span className="text-xs text-fixlyfy-text-secondary">
                      {new Date(job.date).toLocaleDateString()} {job.time}
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
          ))}
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
                <TableHead>Scheduled</TableHead>
                <TableHead>Technician</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job, idx) => (
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
                    {new Date(job.date).toLocaleDateString()} 
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
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
};
