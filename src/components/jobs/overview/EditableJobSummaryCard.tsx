
import React, { useState } from "react";
import { ModernCard, ModernCardHeader, ModernCardContent, ModernCardTitle } from "@/components/ui/modern-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Save, X, FileText } from "lucide-react";
import { JobInfo } from "../context/types";
import { useJobs } from "@/hooks/useJobs";
import { toast } from "sonner";

interface EditableJobSummaryCardProps {
  job: JobInfo;
  jobId: string;
}

export const EditableJobSummaryCard = ({ job, jobId }: EditableJobSummaryCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    service: job.service || job.job_type || "General Service",
    lead_source: job.lead_source || ""
  });
  const { updateJob } = useJobs();

  const handleSave = async () => {
    const result = await updateJob(jobId, {
      service: editValues.service,
      job_type: editValues.service,
      lead_source: editValues.lead_source
    });
    if (result) {
      setIsEditing(false);
      toast.success("Job summary updated successfully");
    }
  };

  const handleCancel = () => {
    setEditValues({
      service: job.service || job.job_type || "General Service",
      lead_source: job.lead_source || ""
    });
    setIsEditing(false);
  };

  return (
    <ModernCard variant="elevated" className="hover:shadow-lg transition-all duration-300">
      <ModernCardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <ModernCardTitle icon={FileText}>
            Job Summary
          </ModernCardTitle>
          {!isEditing ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="text-fixlyfy hover:text-fixlyfy-dark"
            >
              <Edit className="h-4 w-4" />
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                className="text-green-600 hover:text-green-700"
              >
                <Save className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="text-gray-500 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </ModernCardHeader>
      <ModernCardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Job Type</p>
            {isEditing ? (
              <Input
                value={editValues.service}
                onChange={(e) => setEditValues(prev => ({ ...prev, service: e.target.value }))}
                placeholder="Enter job type..."
              />
            ) : (
              <p className="font-medium">{job.service || job.job_type || "General Service"}</p>
            )}
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Lead Source</p>
            {isEditing ? (
              <Input
                value={editValues.lead_source}
                onChange={(e) => setEditValues(prev => ({ ...prev, lead_source: e.target.value }))}
                placeholder="Enter lead source..."
              />
            ) : (
              <p className="font-medium">{job.lead_source || "Not specified"}</p>
            )}
          </div>
        </div>
      </ModernCardContent>
    </ModernCard>
  );
};
