
import React, { useState } from "react";
import { ModernCard, ModernCardHeader, ModernCardContent, ModernCardTitle } from "@/components/ui/modern-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Tag, Plus } from "lucide-react";
import { useJobs } from "@/hooks/useJobs";
import { useTags } from "@/hooks/useConfigItems";
import { toast } from "sonner";
import { TagSelectionDialog } from "../dialogs/TagSelectionDialog";

interface JobTagsCardProps {
  tags: string[];
  jobId?: string;
  editable?: boolean;
  onUpdate?: () => void;
}

export const JobTagsCard = ({ tags, jobId, editable = false, onUpdate }: JobTagsCardProps) => {
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const { updateJob } = useJobs();
  const { items: tagItems } = useTags();

  // Create a map for tag colors
  const tagColorMap = tagItems.reduce((acc, tag) => {
    acc[tag.name] = tag.color || '#6366f1';
    return acc;
  }, {} as Record<string, string>);

  if (!tags || tags.length === 0) {
    if (!editable) return null;
    
    return (
      <>
        <ModernCard variant="elevated" className="hover:shadow-lg transition-all duration-300">
          <ModernCardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <ModernCardTitle icon={Tag}>
                Tags
              </ModernCardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsTagDialogOpen(true)}
                className="text-fixlyfy hover:text-fixlyfy-dark"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </ModernCardHeader>
          <ModernCardContent>
            <p className="text-muted-foreground">No tags assigned yet</p>
          </ModernCardContent>
        </ModernCard>

        <TagSelectionDialog
          open={isTagDialogOpen}
          onOpenChange={setIsTagDialogOpen}
          initialTags={[]}
          onSave={async (selectedTags) => {
            if (jobId) {
              const result = await updateJob(jobId, { tags: selectedTags });
              if (result) {
                toast.success("Tags updated successfully");
                // Trigger real-time refresh
                if (onUpdate) {
                  onUpdate();
                }
              }
            }
          }}
        />
      </>
    );
  }

  const handleTagsUpdate = async (selectedTags: string[]) => {
    if (!jobId) return;
    
    const result = await updateJob(jobId, { tags: selectedTags });
    if (result) {
      toast.success("Tags updated successfully");
      // Trigger real-time refresh
      if (onUpdate) {
        onUpdate();
      }
    }
  };

  return (
    <>
      <ModernCard variant="elevated" className="hover:shadow-lg transition-all duration-300">
        <ModernCardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <ModernCardTitle icon={Tag}>
              Tags
            </ModernCardTitle>
            {editable && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsTagDialogOpen(true)}
                className="text-fixlyfy hover:text-fixlyfy-dark"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
        </ModernCardHeader>
        <ModernCardContent>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => {
              const tagColor = tagColorMap[tag];
              return (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="text-xs"
                  style={tagColor ? { borderColor: tagColor, color: tagColor } : undefined}
                >
                  {tag}
                </Badge>
              );
            })}
          </div>
        </ModernCardContent>
      </ModernCard>

      <TagSelectionDialog
        open={isTagDialogOpen}
        onOpenChange={setIsTagDialogOpen}
        initialTags={tags}
        onSave={handleTagsUpdate}
      />
    </>
  );
};
