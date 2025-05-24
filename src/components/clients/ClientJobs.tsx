
import { useState } from "react";
import { useJobs } from "@/hooks/useJobs";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, ExternalLink } from "lucide-react";
import { JobsCreateModal } from "../jobs/JobsCreateModal";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface ClientJobsProps {
  clientId?: string;
}

export const ClientJobs = ({ clientId }: ClientJobsProps) => {
  const [isCreateJobModalOpen, setIsCreateJobModalOpen] = useState(false);
  const {
    jobs,
    isLoading
  } = useJobs(clientId);
  const navigate = useNavigate();

  const handleJobCreated = (job: any) => {
    toast.success("Job created successfully!");
  };

  const handleViewJob = (jobId: string) => {
    navigate(`/jobs/${jobId}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 size={32} className="animate-spin mr-2" />
        <span>Loading jobs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Client Jobs</h2>
        <Button 
          onClick={() => setIsCreateJobModalOpen(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus size={16} className="mr-2" />
          Create New Job
        </Button>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-8 bg-muted/40 rounded-lg border border-border">
          <p className="text-muted-foreground">No jobs found for this client.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => setIsCreateJobModalOpen(true)}
          >
            <Plus size={16} className="mr-2" />
            Create First Job
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Service</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map(job => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">{job.id}</TableCell>
                  <TableCell>{job.title}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`${
                        job.status === "completed" ? "bg-green-100 text-green-800" :
                        job.status === "in-progress" ? "bg-blue-100 text-blue-800" :
                        job.status === "scheduled" ? "bg-yellow-100 text-yellow-800" :
                        "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {job.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {job.date ? format(new Date(job.date), "MMM dd, yyyy") : "N/A"}
                  </TableCell>
                  <TableCell>{job.service || "General"}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleViewJob(job.id)}
                    >
                      <ExternalLink size={16} className="mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <JobsCreateModal 
        open={isCreateJobModalOpen} 
        onOpenChange={setIsCreateJobModalOpen}
        preselectedClientId={clientId}
        onSuccess={handleJobCreated}
      />
    </div>
  );
};
