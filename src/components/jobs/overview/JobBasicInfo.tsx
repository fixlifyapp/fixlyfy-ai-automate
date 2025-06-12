
import React from "react";

interface JobBasicInfoProps {
  job: {
    id: string;
    title?: string;
    description?: string;
    service?: string;
    job_type?: string;
    lead_source?: string;
    status: string;
    tags?: string[];
    notes?: string;
  } | null;
}

export const JobBasicInfo = ({ job }: JobBasicInfoProps) => {
  if (!job) return <div>No job information available</div>;

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium text-muted-foreground">Job ID</label>
        <p className="text-sm">{job.id}</p>
      </div>

      {job.title && (
        <div>
          <label className="text-sm font-medium text-muted-foreground">Title</label>
          <p className="text-sm">{job.title}</p>
        </div>
      )}

      {job.description && (
        <div>
          <label className="text-sm font-medium text-muted-foreground">Description</label>
          <p className="text-sm">{job.description}</p>
        </div>
      )}

      {job.service && (
        <div>
          <label className="text-sm font-medium text-muted-foreground">Service</label>
          <p className="text-sm">{job.service}</p>
        </div>
      )}

      {job.job_type && (
        <div>
          <label className="text-sm font-medium text-muted-foreground">Job Type</label>
          <p className="text-sm">{job.job_type}</p>
        </div>
      )}

      {job.lead_source && (
        <div>
          <label className="text-sm font-medium text-muted-foreground">Lead Source</label>
          <p className="text-sm">{job.lead_source}</p>
        </div>
      )}

      {job.notes && (
        <div>
          <label className="text-sm font-medium text-muted-foreground">Notes</label>
          <p className="text-sm">{job.notes}</p>
        </div>
      )}
    </div>
  );
};
