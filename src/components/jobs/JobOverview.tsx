
import React, { useState } from "react";
import { useJobDetails } from "./context/JobDetailsContext";
import { useJobs } from "@/hooks/useJobs";
import { JobSummaryCard } from "./overview/JobSummaryCard";
import { ScheduleInfoCard } from "./overview/ScheduleInfoCard";
import { JobDescriptionCard } from "./overview/JobDescriptionCard";
import { JobTagsCard } from "./overview/JobTagsCard";
import { TasksCard } from "./overview/TasksCard";
import { TechnicianCard } from "./overview/TechnicianCard";
import { AdditionalInfoCard } from "./overview/AdditionalInfoCard";
import { AttachmentsCard } from "./overview/AttachmentsCard";
import { ConditionalCustomFieldsCard } from "./overview/ConditionalCustomFieldsCard";
import { TaskManagementDialog } from "./dialogs/TaskManagementDialog";
import { toast } from "sonner";
import type { JobInfo } from "./overview/types";

interface JobOverviewProps {
  jobId: string;
}

interface Task {
  id: number;
  name: string;
  completed: boolean;
}

export const JobOverview = ({ jobId }: JobOverviewProps) => {
  const { job, isLoading } = useJobDetails();
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { updateJob } = useJobs();

  // Transform job to JobInfo format
  const transformJobToJobInfo = (job: any): JobInfo => {
    const clientName = typeof job.client === 'string' ? job.client : (job.client?.name || '');
    const clientPhone = job.phone || (typeof job.client === 'object' ? job.client?.phone : '') || '';
    const clientEmail = job.email || (typeof job.client === 'object' ? job.client?.email : '') || '';

    return {
      ...job,
      clientId: job.client_id,
      client: clientName,
      phone: clientPhone,
      email: clientEmail,
      total: job.revenue || job.total || 0,
      tasks: Array.isArray(job.tasks) ? job.tasks : []
    };
  };

  // Convert job tasks to dialog format
  const convertToDialogTasks = (jobTasks: string[] | undefined): Task[] => {
    if (!jobTasks || !Array.isArray(jobTasks)) return [];
    
    return jobTasks.map((task, index) => ({
      id: index + 1,
      name: typeof task === 'string' ? task : String(task),
      completed: false // For now, we'll assume all tasks are incomplete
    }));
  };

  // Convert dialog tasks back to job format
  const convertToJobTasks = (dialogTasks: Task[]): string[] => {
    return dialogTasks.map(task => task.name);
  };

  const handleUpdateTasks = async (updatedTasks: Task[]) => {
    setIsUpdating(true);
    const taskNames = convertToJobTasks(updatedTasks);
    
    try {
      const result = await updateJob(jobId, {
        tasks: taskNames
      });
      
      if (result) {
        console.log("Tasks updated successfully:", taskNames);
        toast.success("Tasks updated successfully");
        // Real-time will handle the refresh automatically
      }
    } catch (error) {
      console.error("Error updating tasks:", error);
      toast.error("Failed to update tasks");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4 w-48"></div>
          <div className="h-5 bg-gray-200 rounded w-72"></div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="space-y-6">
        <div className="text-red-500">Error loading job details</div>
      </div>
    );
  }

  const jobInfo = transformJobToJobInfo(job);

  return (
    <div className="space-y-6">
      {/* Primary Information Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <JobDescriptionCard 
            description={jobInfo.description || ""} 
            jobId={jobId} 
            editable 
          />
          <JobSummaryCard 
            job={jobInfo} 
            jobId={jobId} 
            editable 
          />
          <TechnicianCard 
            job={jobInfo} 
            jobId={jobId} 
            editable 
          />
          <TasksCard 
            tasks={jobInfo.tasks || []} 
            jobId={jobId} 
            editable 
            onManageTasks={() => setIsTaskDialogOpen(true)}
          />
        </div>
        
        <div className="space-y-6">
          <AdditionalInfoCard job={jobInfo} />
          <ScheduleInfoCard 
            job={jobInfo} 
            jobId={jobId} 
            editable 
          />
          <AttachmentsCard 
            jobId={jobId} 
            editable 
          />
          <ConditionalCustomFieldsCard jobId={jobId} />
        </div>
      </div>

      {/* Secondary Information Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <JobTagsCard 
            tags={jobInfo.tags || []} 
            jobId={jobId} 
            editable 
          />
        </div>
      </div>

      {/* Task Management Dialog */}
      <TaskManagementDialog
        open={isTaskDialogOpen}
        onOpenChange={setIsTaskDialogOpen}
        initialTasks={convertToDialogTasks(jobInfo.tasks)}
        onSave={handleUpdateTasks}
        disabled={isUpdating}
      />
    </div>
  );
};
