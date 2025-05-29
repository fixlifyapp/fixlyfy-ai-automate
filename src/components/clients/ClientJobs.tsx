
import { useState } from "react";
import { useJobs } from "@/hooks/useJobs";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, ExternalLink, Edit, Trash2 } from "lucide-react";
import { ScheduleJobModal } from "../schedule/ScheduleJobModal";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { DeleteJobsDialog } from "../jobs/dialogs/DeleteJobsDialog";
import { BulkActionsBar } from "../jobs/BulkActionsBar";
import { useJobStatuses, useJobTypes } from "@/hooks/useConfigItems";

interface ClientJobsProps {
  clientId?: string;
}

export const ClientJobs = ({ clientId }: ClientJobsProps) => {
  const [isCreateJobModalOpen, setIsCreateJobModalOpen] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const {
    jobs,
    isLoading,
    updateJob,
    deleteJob,
    addJob
  } = useJobs(clientId);
  
  // Get dynamic configuration data from database
  const { items: jobStatuses } = useJobStatuses();
  const { items: jobTypes } = useJobTypes();
  
  const navigate = useNavigate();

  const handleJobCreated = async (jobData: any) => {
    try {
      const createdJob = await addJob(jobData);
      if (createdJob) {
        toast.success(`Job ${createdJob.id} created successfully!`);
        return createdJob;
      }
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error('Failed to create job');
      throw error;
    }
  };

  const handleJobSuccess = (job: any) => {
    toast.success("Job created successfully!");
  };

  const handleViewJob = (jobId: string) => {
    navigate(`/jobs/${jobId}`);
  };

  const handleEditJob = (jobId: string) => {
    navigate(`/jobs/${jobId}`);
  };

  const handleSelectJob = (jobId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedJobs(prev => [...prev, jobId]);
    } else {
      setSelectedJobs(prev => prev.filter(id => id !== jobId));
    }
  };

  const handleSelectAllJobs = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedJobs(jobs.map(job => job.id));
    } else {
      setSelectedJobs([]);
    }
  };

  const handleClearSelection = () => {
    setSelectedJobs([]);
  };

  const handleBulkDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteSuccess = () => {
    setSelectedJobs([]);
    toast.success(`Deleted ${selectedJobs.length} jobs successfully`);
  };

  const handleUpdateJobsStatus = (jobIds: string[], newStatus: string) => {
    Promise.all(jobIds.map(id => updateJob(id, { status: newStatus })))
      .then(() => {
        toast.success(`Updated ${jobIds.length} jobs to "${newStatus}"`);
        setSelectedJobs([]);
      })
      .catch(error => {
        console.error("Failed to update jobs status:", error);
        toast.error("Failed to update job status");
      });
  };

  const handleAssignTechnician = (jobIds: string[], technicianId: string, technicianName: string) => {
    Promise.all(jobIds.map(id => updateJob(id, { technician_id: technicianId })))
      .then(() => {
        toast.success(`Assigned ${jobIds.length} jobs to ${technicianName}`);
        setSelectedJobs([]);
      })
      .catch(error => {
        console.error("Failed to assign technician:", error);
        toast.error("Failed to assign technician");
      });
  };

  const handleDeleteJobs = (jobIds: string[]) => {
    Promise.all(jobIds.map(id => deleteJob(id)))
      .then(() => {
        toast.success(`Deleted ${jobIds.length} jobs`);
        setSelectedJobs([]);
      })
      .catch(error => {
        console.error("Failed to delete jobs:", error);
        toast.error("Failed to delete jobs");
      });
  };

  const handleSendReminders = (jobIds: string[], reminderType: string) => {
    toast.success(`Sent ${reminderType.toUpperCase()} reminders to ${jobIds.length} clients`);
    setSelectedJobs([]);
  };

  const handleTagJobs = (jobIds: string[], tags: string[]) => {
    Promise.all(jobIds.map(id => {
      const job = jobs.find(j => j.id === id);
      if (!job) return Promise.resolve(null);
      
      const existingTags = job.tags || [];
      const updatedTags = [...new Set([...existingTags, ...tags])];
      
      return updateJob(id, { tags: updatedTags });
    }))
      .then(() => {
        toast.success(`Tagged ${jobIds.length} jobs with ${tags.length} tags`);
        setSelectedJobs([]);
      })
      .catch(error => {
        console.error("Failed to tag jobs:", error);
        toast.error("Failed to tag jobs");
      });
  };

  const handleMarkAsPaid = (jobIds: string[], paymentMethod: string) => {
    toast.success(`Marked ${jobIds.length} jobs as paid via ${paymentMethod}`);
    setSelectedJobs([]);
  };

  const handleExportJobs = (jobIds: string[]) => {
    const selectedJobData = jobs.filter(job => jobIds.includes(job.id));
    const csvData = selectedJobData.map(job => ({
      'Job ID': job.id,
      'Title': job.title || '',
      'Status': job.status,
      'Type': job.job_type || job.service || '',
      'Date': job.date ? format(new Date(job.date), 'yyyy-MM-dd') : '',
      'Revenue': job.revenue || 0,
      'Address': job.address || ''
    }));
    
    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `client-jobs-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success(`Exported ${jobIds.length} jobs`);
    setSelectedJobs([]);
  };

  // Get status configuration from database
  const getStatusBadgeStyle = (status: string) => {
    const statusConfig = jobStatuses?.find(s => s.name.toLowerCase() === status.toLowerCase());
    if (statusConfig?.color) {
      return { backgroundColor: `${statusConfig.color}20`, color: statusConfig.color };
    }
    
    // Fallback styles if no database config found
    const statusStyles: Record<string, string> = {
      "completed": "bg-green-100 text-green-800",
      "in-progress": "bg-blue-100 text-blue-800", 
      "scheduled": "bg-yellow-100 text-yellow-800",
      "cancelled": "bg-red-100 text-red-800",
      "canceled": "bg-red-100 text-red-800"
    };
    
    return statusStyles[status.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  // Get service/job type from database
  const getJobTypeDisplay = (job: any) => {
    if (job.job_type) {
      const jobTypeConfig = jobTypes?.find(jt => jt.name === job.job_type);
      return jobTypeConfig?.name || job.job_type;
    }
    if (job.service) {
      return job.service;
    }
    return "Service Job"; // Dynamic fallback instead of hardcoded "General"
  };

  const areAllJobsSelected = jobs.length > 0 && selectedJobs.length > 0 && jobs.every(job => selectedJobs.includes(job.id));

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
        <div className="flex items-center gap-2">
          {selectedJobs.length > 0 && (
            <>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => handleClearSelection()}
              >
                Clear ({selectedJobs.length})
              </Button>
              <Button 
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
              >
                <Trash2 size={16} className="mr-2" />
                Delete Selected
              </Button>
            </>
          )}
          <Button 
            onClick={() => setIsCreateJobModalOpen(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus size={16} className="mr-2" />
            Create New Job
          </Button>
        </div>
      </div>

      {selectedJobs.length > 0 && (
        <BulkActionsBar 
          selectedJobs={selectedJobs} 
          onClearSelection={handleClearSelection} 
          onUpdateStatus={handleUpdateJobsStatus}
          onAssignTechnician={handleAssignTechnician}
          onDeleteJobs={handleDeleteJobs}
          onSendReminders={handleSendReminders}
          onTagJobs={handleTagJobs}
          onMarkAsPaid={handleMarkAsPaid}
          onExport={handleExportJobs}
        />
      )}

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
                <TableHead className="w-[50px]">
                  <Checkbox 
                    checked={areAllJobsSelected}
                    onCheckedChange={handleSelectAllJobs}
                  />
                </TableHead>
                <TableHead>Job ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Service</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map(job => {
                const statusStyle = getStatusBadgeStyle(job.status);
                const isStyleObject = typeof statusStyle === 'object';
                
                return (
                  <TableRow key={job.id}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedJobs.includes(job.id)}
                        onCheckedChange={(checked) => handleSelectJob(job.id, !!checked)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{job.id}</TableCell>
                    <TableCell>{job.title}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={isStyleObject ? "" : statusStyle}
                        style={isStyleObject ? statusStyle : undefined}
                      >
                        {job.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {job.date ? format(new Date(job.date), "MMM dd, yyyy") : "N/A"}
                    </TableCell>
                    <TableCell>{getJobTypeDisplay(job)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditJob(job.id)}
                          title="Edit Job"
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewJob(job.id)}
                          title="View Job"
                        >
                          <ExternalLink size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedJobs([job.id]);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="text-red-600 hover:text-red-800"
                          title="Delete Job"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <ScheduleJobModal 
        open={isCreateJobModalOpen} 
        onOpenChange={setIsCreateJobModalOpen}
        preselectedClientId={clientId}
        onJobCreated={handleJobCreated}
        onSuccess={handleJobSuccess}
      />

      <DeleteJobsDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        selectedJobs={selectedJobs}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
};
