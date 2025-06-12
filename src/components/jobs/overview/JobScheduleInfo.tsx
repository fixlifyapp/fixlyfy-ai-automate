
import React from "react";
import { format } from "date-fns";

interface JobScheduleInfoProps {
  job: {
    date?: string;
    schedule_start?: string;
    schedule_end?: string;
    created_at: string;
    updated_at: string;
  } | null;
}

export const JobScheduleInfo = ({ job }: JobScheduleInfoProps) => {
  if (!job) return <div>No schedule information available</div>;

  return (
    <div className="space-y-3">
      {job.date && (
        <div>
          <label className="text-sm font-medium text-muted-foreground">Date</label>
          <p className="text-sm">{format(new Date(job.date), "PPP")}</p>
        </div>
      )}

      {job.schedule_start && (
        <div>
          <label className="text-sm font-medium text-muted-foreground">Start Time</label>
          <p className="text-sm">{format(new Date(job.schedule_start), "p")}</p>
        </div>
      )}

      {job.schedule_end && (
        <div>
          <label className="text-sm font-medium text-muted-foreground">End Time</label>
          <p className="text-sm">{format(new Date(job.schedule_end), "p")}</p>
        </div>
      )}

      <div>
        <label className="text-sm font-medium text-muted-foreground">Created</label>
        <p className="text-sm">{format(new Date(job.created_at), "PPp")}</p>
      </div>

      <div>
        <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
        <p className="text-sm">{format(new Date(job.updated_at), "PPp")}</p>
      </div>
    </div>
  );
};
