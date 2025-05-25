
import React from "react";
import { EditableJobDescriptionCard } from "./EditableJobDescriptionCard";

interface JobDescriptionCardProps {
  description: string;
  jobId?: string;
  editable?: boolean;
}

export const JobDescriptionCard = ({ description, jobId, editable = false }: JobDescriptionCardProps) => {
  if (editable && jobId) {
    return <EditableJobDescriptionCard description={description} jobId={jobId} />;
  }

  // Fallback to simple display if not editable
  if (!description) return null;

  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-lg font-semibold mb-4">Job Description</h3>
      <p>{description}</p>
    </div>
  );
};
