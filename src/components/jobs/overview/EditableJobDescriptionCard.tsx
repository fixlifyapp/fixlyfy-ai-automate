
import React, { useState } from "react";
import { ModernCard, ModernCardHeader, ModernCardContent, ModernCardTitle } from "@/components/ui/modern-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Save, X, FileText } from "lucide-react";
import { useJobs } from "@/hooks/useJobs";
import { toast } from "sonner";

interface EditableJobDescriptionCardProps {
  description: string;
  jobId: string;
}

export const EditableJobDescriptionCard = ({ description, jobId }: EditableJobDescriptionCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(description || "");
  const { updateJob } = useJobs();

  const handleSave = async () => {
    const result = await updateJob(jobId, { description: editValue });
    if (result) {
      setIsEditing(false);
      toast.success("Job description updated successfully");
    }
  };

  const handleCancel = () => {
    setEditValue(description || "");
    setIsEditing(false);
  };

  // Always show the card
  return (
    <ModernCard variant="elevated" className="hover:shadow-lg transition-all duration-300">
      <ModernCardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <ModernCardTitle icon={FileText}>
            Job Description
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
      <ModernCardContent>
        {isEditing ? (
          <Textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            placeholder="Enter job description..."
            className="min-h-[100px] resize-none"
            autoFocus
          />
        ) : (
          <div>
            {description ? (
              <p className="text-gray-700 leading-relaxed">{description}</p>
            ) : (
              <p className="text-muted-foreground text-sm">No description provided. Click edit to add one.</p>
            )}
          </div>
        )}
      </ModernCardContent>
    </ModernCard>
  );
};
