
import React from "react";

interface JobClientInfoProps {
  job: {
    client?: string;
    phone?: string;
    email?: string;
    address?: string;
  } | null;
}

export const JobClientInfo = ({ job }: JobClientInfoProps) => {
  if (!job) return <div>No client information available</div>;

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium text-muted-foreground">Client Name</label>
        <p className="text-sm">{job.client || 'Unknown Client'}</p>
      </div>

      {job.phone && (
        <div>
          <label className="text-sm font-medium text-muted-foreground">Phone</label>
          <p className="text-sm">{job.phone}</p>
        </div>
      )}

      {job.email && (
        <div>
          <label className="text-sm font-medium text-muted-foreground">Email</label>
          <p className="text-sm">{job.email}</p>
        </div>
      )}

      {job.address && (
        <div>
          <label className="text-sm font-medium text-muted-foreground">Address</label>
          <p className="text-sm">{job.address}</p>
        </div>
      )}
    </div>
  );
};
