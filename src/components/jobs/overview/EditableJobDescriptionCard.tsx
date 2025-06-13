
import React, { useState } from "react";
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardContent } from "@/components/ui/modern-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Edit3, Save, X, FileText } from "lucide-react";
import { useJobUpdates } from "../hooks/useJobUpdates";
import { toast } from "sonner";

interface EditableJobDescriptionCardProps {
  description: string;
  jobId: string;
}

export const EditableJobDescriptionCard = ({ description, jobId }: EditableJobDescriptionCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(description || "");
  const { updateJob, isUpdating } = useJobUpdates();

  const handleSave = async () => {
    try {
      await updateJob(jobId, { description: value });
      setIsEditing(false);
      toast.success("Description updated successfully");
    } catch (error) {
      toast.error("Failed to update description");
    }
  };

  const handleCancel = () => {
    setValue(description || "");
    setIsEditing(false);
  };

  return (
    <ModernCard variant="elevated">
      <ModernCardHeader className="flex flex-row items-center justify-between space-y-0">
        <ModernCardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Job Description
        </ModernCardTitle>
        {!isEditing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="gap-2"
          >
            <Edit3 className="h-4 w-4" />
            Edit
          </Button>
        )}
      </ModernCardHeader>
      <ModernCardContent>
        {isEditing ? (
          <div className="space-y-4">
            <Textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter job description..."
              className="min-h-[100px]"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isUpdating}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Save
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isUpdating}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            {description || "No description provided"}
          </div>
        )}
      </ModernCardContent>
    </ModernCard>
  );
};
