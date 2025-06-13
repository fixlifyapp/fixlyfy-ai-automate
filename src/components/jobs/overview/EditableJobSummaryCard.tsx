
import React, { useState } from "react";
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardContent } from "@/components/ui/modern-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Edit3, Save, X, FileText } from "lucide-react";
import { useJobUpdates } from "../hooks/useJobUpdates";
import { toast } from "sonner";

interface EditableJobSummaryCardProps {
  title: string;
  description: string;
  jobId: string;
}

export const EditableJobSummaryCard = ({ title, description, jobId }: EditableJobSummaryCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [titleValue, setTitleValue] = useState(title || "");
  const [descValue, setDescValue] = useState(description || "");
  const { updateJob, isUpdating } = useJobUpdates();

  const handleSave = async () => {
    try {
      await updateJob(jobId, { 
        title: titleValue,
        description: descValue 
      });
      setIsEditing(false);
      toast.success("Job summary updated successfully");
    } catch (error) {
      toast.error("Failed to update job summary");
    }
  };

  const handleCancel = () => {
    setTitleValue(title || "");
    setDescValue(description || "");
    setIsEditing(false);
  };

  return (
    <ModernCard variant="elevated">
      <ModernCardHeader className="flex flex-row items-center justify-between space-y-0">
        <ModernCardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Job Summary
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
            <div className="space-y-2">
              <label className="text-sm font-medium">Job Title</label>
              <Input
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                placeholder="Enter job title..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={descValue}
                onChange={(e) => setDescValue(e.target.value)}
                placeholder="Enter job description..."
                className="min-h-[100px]"
              />
            </div>
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
          <div className="space-y-3">
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Title</h3>
              <p className="text-sm">{title || "No title provided"}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Description</h3>
              <p className="text-sm">{description || "No description provided"}</p>
            </div>
          </div>
        )}
      </ModernCardContent>
    </ModernCard>
  );
};
