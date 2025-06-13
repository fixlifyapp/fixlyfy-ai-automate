
import React, { useState } from "react";
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardContent } from "@/components/ui/modern-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tag, Plus, X, Edit3 } from "lucide-react";

interface JobTagsCardProps {
  tags: string[];
  jobId?: string;
  editable?: boolean;
  onTagsUpdate?: (tags: string[]) => void;
}

export const JobTagsCard = ({ tags = [], jobId, editable = false, onTagsUpdate }: JobTagsCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [localTags, setLocalTags] = useState(tags);

  const handleAddTag = () => {
    if (newTag.trim() && !localTags.includes(newTag.trim())) {
      const updatedTags = [...localTags, newTag.trim()];
      setLocalTags(updatedTags);
      setNewTag("");
      onTagsUpdate?.(updatedTags);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = localTags.filter(tag => tag !== tagToRemove);
    setLocalTags(updatedTags);
    onTagsUpdate?.(updatedTags);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <ModernCard variant="elevated">
      <ModernCardHeader className="flex flex-row items-center justify-between space-y-0">
        <ModernCardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5" />
          Tags
        </ModernCardTitle>
        {editable && !isEditing && (
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
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {localTags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {tag}
                {isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </Badge>
            ))}
            {localTags.length === 0 && (
              <span className="text-sm text-muted-foreground">No tags added</span>
            )}
          </div>
          
          {isEditing && (
            <div className="flex gap-2">
              <Input
                placeholder="Add new tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button
                size="sm"
                onClick={handleAddTag}
                disabled={!newTag.trim()}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>
          )}
          
          {isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(false)}
              className="gap-2"
            >
              Done
            </Button>
          )}
        </div>
      </ModernCardContent>
    </ModernCard>
  );
};
