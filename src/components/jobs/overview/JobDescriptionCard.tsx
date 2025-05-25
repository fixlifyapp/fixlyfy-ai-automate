
import React from "react";
import { EditableJobDescriptionCard } from "./EditableJobDescriptionCard";
import { ModernCard, ModernCardHeader, ModernCardContent, ModernCardTitle } from "@/components/ui/modern-card";
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

  // Always show the card, even if description is empty
  return (
    <ModernCard variant="elevated" className="hover:shadow-lg transition-all duration-300">
      <ModernCardHeader className="pb-4">
        <ModernCardTitle icon={FileText}>
          Job Description
        </ModernCardTitle>
      </ModernCardHeader>
      <ModernCardContent>
        {description ? (
          <p className="text-gray-700 leading-relaxed">{description}</p>
        ) : (
          <p className="text-muted-foreground text-sm">No description provided</p>
        )}
      </ModernCardContent>
    </ModernCard>
  );
};
