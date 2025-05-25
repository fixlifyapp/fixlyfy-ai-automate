
import React from "react";
import { useJobDetails } from "./context/JobDetailsContext";
import { JobSummaryCard } from "./overview/JobSummaryCard";
import { ClientInfoCard } from "./overview/ClientInfoCard";
import { ScheduleInfoCard } from "./overview/ScheduleInfoCard";
import { JobDescriptionCard } from "./overview/JobDescriptionCard";
import { JobTagsCard } from "./overview/JobTagsCard";
import { TasksCard } from "./overview/TasksCard";
import { TechnicianCard } from "./overview/TechnicianCard";
import { AdditionalInfoCard } from "./overview/AdditionalInfoCard";

interface JobOverviewProps {
  jobId: string;
}

export const JobOverview = ({ jobId }: JobOverviewProps) => {
  const { job, isLoading } = useJobDetails();

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
      <JobSummaryCard job={job} />
      <ClientInfoCard job={job} />
      <ScheduleInfoCard job={job} />
      <TechnicianCard job={job} />
      <JobDescriptionCard description={job.description || ""} />
      <TasksCard tasks={job.tasks || []} />
      <JobTagsCard tags={job.tags || []} />
      <AdditionalInfoCard job={job} />
    </div>
  );
};
