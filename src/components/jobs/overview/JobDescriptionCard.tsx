
import React from "react";
import { EditableJobDescriptionCard } from "./EditableJobDescriptionCard";
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardContent } from "@/components/ui/modern-card";
import { FileText } from "lucide-react";

interface JobDescriptionCardProps {
  description: string;
  jobId?: string;
  editable?: boolean;
}

export const JobDescriptionCard = ({ description, jobId, editable = false }: JobDescriptionCardProps) => {
  if (editable && jobId) {
    return <EditableJobDescriptionCard description={description} jobId={jobId} />;
  }

  return (
    <ModernCard variant="elevated">
      <ModernCardHeader>
        <ModernCardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Job Description
        </ModernCardTitle>
      </ModernCardHeader>
      <ModernCardContent>
        <div className="text-sm text-muted-foreground">
          {description || "No description provided"}
        </div>
      </ModernCardContent>
    </ModernCard>
  );
};
