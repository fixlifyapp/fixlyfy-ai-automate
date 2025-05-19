
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClientJobsProps {
  clientId: string | undefined;
  onCreateJob: () => void;
}

// Mock client jobs data - in a real app, this would be filtered based on clientId
const mockClientJobs = [
  {
    id: "JOB-1001",
    status: "scheduled",
    date: "2023-05-15",
    time: "13:30",
    service: "HVAC Repair",
    technician: {
      name: "Robert Smith",
      avatar: "https://i.pravatar.cc/150?img=1",
      initials: "RS",
    },
    revenue: 250.00,
  },
  {
    id: "JOB-1004",
    status: "scheduled",
    date: "2023-05-16",
    time: "09:00",
    service: "HVAC Maintenance",
    technician: {
      name: "Robert Smith",
      avatar: "https://i.pravatar.cc/150?img=1",
      initials: "RS",
    },
    revenue: 200.00,
  },
  {
    id: "JOB-1005",
    status: "canceled",
    date: "2023-05-14",
    time: "15:30",
    service: "Electrical",
    technician: {
      name: "John Doe",
      avatar: "https://i.pravatar.cc/150?img=2",
      initials: "JD",
    },
    revenue: 0.00,
  },
];

export const ClientJobs = ({ clientId, onCreateJob }: ClientJobsProps) => {
  const navigate = useNavigate();

  const handleJobClick = (jobId: string) => {
    navigate(`/jobs/${jobId}`);
  };

  return (
    <div className="space-y-6">
      <div className="fixlyfy-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job #</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Technician</TableHead>
              <TableHead>Revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockClientJobs.map((job, idx) => (
              <TableRow 
                key={job.id}
                className={cn(
                  idx % 2 === 0 ? "bg-white" : "bg-fixlyfy-bg-interface/50",
                  "cursor-pointer hover:bg-fixlyfy-bg-interface"
                )}
                onClick={() => handleJobClick(job.id)}
              >
                <TableCell>
                  <span className="font-medium">{job.id}</span>
                </TableCell>
                <TableCell>
                  {job.service}
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
                  <div className="flex items-center">
                    <Calendar size={14} className="text-fixlyfy-text-secondary mr-1" />
                    <span>
                      {new Date(job.date).toLocaleDateString()} 
                      <span className="text-xs text-fixlyfy-text-secondary ml-1">{job.time}</span>
                    </span>
                  </div>
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
                <TableCell className="font-medium">
                  ${job.revenue.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {mockClientJobs.length === 0 && (
          <div className="p-6 text-center">
            <p className="text-fixlyfy-text-secondary mb-4">This client has no jobs yet.</p>
            <Button onClick={onCreateJob} className="bg-fixlyfy hover:bg-fixlyfy/90">
              <Plus size={18} className="mr-2" /> Create First Job
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
