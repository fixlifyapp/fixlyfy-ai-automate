
import React, { useState } from "react";
import { useJobDetails } from "./context/JobDetailsContext";
import { JobSummaryCard } from "./overview/JobSummaryCard";
import { ScheduleInfoCard } from "./overview/ScheduleInfoCard";
import { JobDescriptionCard } from "./overview/JobDescriptionCard";
import { JobTagsCard } from "./overview/JobTagsCard";
import { TasksCard } from "./overview/TasksCard";
import { TechnicianCard } from "./overview/TechnicianCard";
import { AdditionalInfoCard } from "./overview/AdditionalInfoCard";
import { AttachmentsCard } from "./overview/AttachmentsCard";
import { JobCustomFieldsDisplay } from "./JobCustomFieldsDisplay";
import { TaskManagementDialog } from "./dialogs/TaskManagementDialog";

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

  const handleUpdateTasks = (updatedTasks: Task[]) => {
    // Here we would update the job with the new tasks
    // This would require adding an updateJob function to the context
    console.log("Updated tasks:", updatedTasks);
    
    // For now, we'll just close the dialog
    // In a real implementation, this would call an API to update the job
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

  return (
    <div className="space-y-6">
      {/* Primary Information Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <JobDescriptionCard description={job.description || ""} jobId={jobId} editable />
          <JobSummaryCard job={job} jobId={jobId} editable />
          <TechnicianCard job={job} jobId={jobId} editable />
        </div>
        
        <div className="space-y-6">
          <AdditionalInfoCard job={job} />
          <ScheduleInfoCard job={job} jobId={jobId} editable />
          <AttachmentsCard jobId={jobId} editable />
        </div>
      </div>

      {/* Secondary Information Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <JobCustomFieldsDisplay jobId={jobId} />
        <div className="space-y-6">
          <TasksCard 
            tasks={job.tasks || []} 
            jobId={jobId} 
            editable 
            onManageTasks={() => setIsTaskDialogOpen(true)}
          />
          <JobTagsCard tags={job.tags || []} jobId={jobId} editable />
        </div>
      </div>

      {/* Task Management Dialog */}
      <TaskManagementDialog
        open={isTaskDialogOpen}
        onOpenChange={setIsTaskDialogOpen}
        initialTasks={convertToDialogTasks(job.tasks)}
        onSave={handleUpdateTasks}
      />
    </div>
  );
};
