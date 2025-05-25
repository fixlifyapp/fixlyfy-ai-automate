
import React, { useState } from "react";
import { ModernCard, ModernCardHeader, ModernCardContent, ModernCardTitle } from "@/components/ui/modern-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Edit, Save, X, Tag, Plus, Trash2 } from "lucide-react";
import { useJobs } from "@/hooks/useJobs";
import { toast } from "sonner";

interface JobTagsCardProps {
  tags: string[];
  jobId?: string;
  editable?: boolean;
}

export const JobTagsCard = ({ tags, jobId, editable = false }: JobTagsCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTags, setEditTags] = useState<string[]>(tags || []);
  const [newTag, setNewTag] = useState("");
  const { updateJob } = useJobs();

  if (!tags || tags.length === 0) {
    if (!editable) return null;
    
    return (
      <ModernCard variant="elevated" className="hover:shadow-lg transition-all duration-300">
        <ModernCardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <ModernCardTitle icon={Tag}>
              Tags
            </ModernCardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
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
    );
  }

  const handleSave = async () => {
    if (!jobId) return;
    
    const result = await updateJob(jobId, {
      tags: editTags.filter(tag => tag.trim())
    });
    if (result) {
      setIsEditing(false);
      toast.success("Tags updated successfully");
    }
  };

  const handleCancel = () => {
    setEditTags(tags || []);
    setNewTag("");
    setIsEditing(false);
  };

  const addTag = () => {
    if (newTag.trim() && !editTags.includes(newTag.trim())) {
      setEditTags([...editTags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setEditTags(editTags.filter(tag => tag !== tagToRemove));
  };

  return (
    <ModernCard variant="elevated" className="hover:shadow-lg transition-all duration-300">
      <ModernCardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <ModernCardTitle icon={Tag}>
            Tags
          </ModernCardTitle>
          {editable && !isEditing ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="text-fixlyfy hover:text-fixlyfy-dark"
            >
              <Edit className="h-4 w-4" />
            </Button>
          ) : editable && isEditing ? (
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
          ) : null}
        </div>
      </ModernCardHeader>
      <ModernCardContent>
        {isEditing ? (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {editTags.map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="bg-purple-50 border-purple-200 text-purple-600 flex items-center gap-1"
                >
                  {tag}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTag(tag)}
                    className="h-auto p-0 ml-1 text-purple-600 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2 items-center">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add new tag..."
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={addTag}
                className="text-green-600 hover:text-green-700"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="bg-purple-50 border-purple-200 text-purple-600">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </ModernCardContent>
    </ModernCard>
  );
};
