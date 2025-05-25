
import React, { useState } from "react";
import { ModernCard, ModernCardHeader, ModernCardContent, ModernCardTitle } from "@/components/ui/modern-card";
import { Button } from "@/components/ui/button";
import { Edit, Save, X, FileText } from "lucide-react";
import { JobInfo } from "../context/types";
import { useJobs } from "@/hooks/useJobs";
import { toast } from "sonner";
import { LeadSourceSelectionDialog } from "../dialogs/LeadSourceSelectionDialog";
import { JobTypeSelectionDialog } from "../dialogs/JobTypeSelectionDialog";
import { useUnifiedRealtime } from "@/hooks/useUnifiedRealtime";

interface EditableJobSummaryCardProps {
  job: JobInfo;
  jobId: string;
}

export const EditableJobSummaryCard = ({ job, jobId }: EditableJobSummaryCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLeadSourceDialogOpen, setIsLeadSourceDialogOpen] = useState(false);
  const [isJobTypeDialogOpen, setIsJobTypeDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [editValues, setEditValues] = useState({
    service: job.service || job.job_type || "General Service",
    lead_source: job.lead_source || ""
  });
  const { updateJob } = useJobs();

  // Set up real-time updates for job types and lead sources
  useUnifiedRealtime({
    tables: ['job_types', 'lead_sources'],
    onUpdate: () => {
      console.log('Real-time update for job types/lead sources');
      setRefreshTrigger(prev => prev + 1);
    },
    enabled: true
  });

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

  const handleLeadSourceSave = (source: string) => {
    setEditValues(prev => ({ ...prev, lead_source: source }));
  };

  const handleJobTypeSave = (type: string) => {
    setEditValues(prev => ({ ...prev, service: type }));
  };

  return (
    <>
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
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setIsJobTypeDialogOpen(true)}
                  key={`job-type-${refreshTrigger}`}
                >
                  {editValues.service || "Select job type..."}
                </Button>
              ) : (
                <p className="font-medium">{job.service || job.job_type || "General Service"}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Lead Source</p>
              {isEditing ? (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setIsLeadSourceDialogOpen(true)}
                  key={`lead-source-${refreshTrigger}`}
                >
                  {editValues.lead_source || "Select lead source..."}
                </Button>
              ) : (
                <p className="font-medium">{job.lead_source || "Not specified"}</p>
              )}
            </div>
          </div>
        </ModernCardContent>
      </ModernCard>

      <LeadSourceSelectionDialog
        key={`lead-source-dialog-${refreshTrigger}`}
        open={isLeadSourceDialogOpen}
        onOpenChange={setIsLeadSourceDialogOpen}
        initialSource={editValues.lead_source}
        onSave={handleLeadSourceSave}
      />

      <JobTypeSelectionDialog
        key={`job-type-dialog-${refreshTrigger}`}
        open={isJobTypeDialogOpen}
        onOpenChange={setIsJobTypeDialogOpen}
        initialType={editValues.service}
        onSave={handleJobTypeSave}
      />
    </>
  );
};
