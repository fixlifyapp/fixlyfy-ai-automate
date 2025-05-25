
import React from "react";
import { useJobDetails } from "./context/JobDetailsContext";
import { useJobOverview } from "@/hooks/useJobOverview";
import { JobSummaryCard } from "./overview/JobSummaryCard";
import { ClientInfoCard } from "./overview/ClientInfoCard";
import { ScheduleInfoCard } from "./overview/ScheduleInfoCard";
import { JobDescriptionCard } from "./overview/JobDescriptionCard";
import { JobTagsCard } from "./overview/JobTagsCard";
import { PropertyInfoCard } from "./overview/PropertyInfoCard";

interface JobOverviewProps {
  jobId: string;
}

export const JobOverview = ({ jobId }: JobOverviewProps) => {
  const { job, isLoading: jobLoading } = useJobDetails();
  const { overview, isLoading: overviewLoading } = useJobOverview(jobId);

  if (jobLoading || overviewLoading) {
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

  // Get data from job or overview
  const leadSource = overview?.lead_source || "Not specified";

  return (
    <div className="space-y-6">
      <JobSummaryCard job={job} leadSource={leadSource} />
      <ClientInfoCard job={job} />
      <ScheduleInfoCard job={job} />
      <JobDescriptionCard description={job.description || ""} />
      <JobTagsCard tags={job.tags || []} />
      {overview && <PropertyInfoCard overview={overview} />}
    </div>
  );
};
