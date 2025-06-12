import React from "react";
import { JobStatusBadge } from "../JobStatusBadge";
import { ClientInfoDisplay } from "./ClientInfoDisplay";
import { ClientContactButtons } from "./ClientContactButtons";
import { useJobDetails } from "../context/JobDetailsContext";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface JobInfoSectionProps {
  jobId: string;
}

export const JobInfoSection = ({ jobId }: JobInfoSectionProps) => {
  const { job, isLoading } = useJobDetails();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleEditClient = () => {
    if (job?.client_id) {
      navigate(`/clients/${job.client_id}`);
    } else {
      console.error('No client ID available for editing');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-2 w-48"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-red-500">
        Error loading job information
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Job Title and Status */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground">
            {job.title || 'Untitled Job'}
          </h1>
          <JobStatusBadge status={job.status} />
        </div>
        
        {job.description && (
          <p className="text-muted-foreground max-w-2xl">
            {job.description}
          </p>
        )}
      </div>

      {/* Client Information */}
      <ClientInfoDisplay 
        clientId={job.client_id} 
        clientName={typeof job.client === 'string' ? job.client : job.client?.name || 'Unknown Client'}
        clientPhone={job.phone}
        clientEmail={job.email}
        jobAddress={job.address}
      />

      {/* Contact Actions */}
      <div className="flex items-center gap-3">
        <ClientContactButtons 
          onEditClient={handleEditClient}
        />
      </div>

      {/* Job Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
        {/* Service Type */}
        {job.service && (
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">Service</label>
            <p className="text-sm">{job.service}</p>
          </div>
        )}

        {/* Job Type */}
        {job.job_type && (
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">Type</label>
            <p className="text-sm">{job.job_type}</p>
          </div>
        )}

        {/* Lead Source */}
        {job.lead_source && (
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">Lead Source</label>
            <p className="text-sm">{job.lead_source}</p>
          </div>
        )}

        {/* Revenue */}
        {job.revenue && (
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">Revenue</label>
            <p className="text-sm font-semibold">${job.revenue.toLocaleString()}</p>
          </div>
        )}
      </div>

      {/* Tags */}
      {job.tags && job.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {job.tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
