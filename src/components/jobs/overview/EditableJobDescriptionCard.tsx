import React, { useState } from 'react';
import { ModernCard, ModernCardContent, ModernCardHeader } from '@/components/ui/modern-card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Edit3, 
  Save, 
  X, 
  FileText,
  Plus,
  Trash2
} from 'lucide-react';

interface EditableJobDescriptionCardProps {
  jobId: string;
  description?: string;
  notes?: string;
  tags?: string[];
  onUpdateDescription?: (description: string) => void;
  onUpdateNotes?: (notes: string) => void;
  onUpdateTags?: (tags: string[]) => void;
  canEdit?: boolean;
  isUpdating?: boolean;
}

export const EditableJobDescriptionCard = ({
  jobId,
  description = '',
  notes = '',
  tags = [],
  onUpdateDescription,
  onUpdateNotes,
  onUpdateTags,
  canEdit = true,
  isUpdating = false
}: EditableJobDescriptionCardProps) => {
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [editDescription, setEditDescription] = useState(description);
  const [editNotes, setEditNotes] = useState(notes);
  const [editTags, setEditTags] = useState(tags);
  const [newTag, setNewTag] = useState('');

  const handleSaveDescription = () => {
    onUpdateDescription?.(editDescription);
    setIsEditingDescription(false);
  };

  const handleCancelDescription = () => {
    setEditDescription(description);
    setIsEditingDescription(false);
  };

  const handleSaveNotes = () => {
    onUpdateNotes?.(editNotes);
    setIsEditingNotes(false);
  };

  const handleCancelNotes = () => {
    setEditNotes(notes);
    setIsEditingNotes(false);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !editTags.includes(newTag.trim())) {
      const updatedTags = [...editTags, newTag.trim()];
      setEditTags(updatedTags);
      onUpdateTags?.(updatedTags);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = editTags.filter(tag => tag !== tagToRemove);
    setEditTags(updatedTags);
    onUpdateTags?.(updatedTags);
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <ModernCard>
      <ModernCardHeader>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Job Details
        </h3>
      </ModernCardHeader>
      <ModernCardContent className="space-y-6">
        {/* Description Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">Description</h4>
            {canEdit && !isEditingDescription && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingDescription(true)}
                className="gap-2"
              >
                <Edit3 className="h-4 w-4" />
                Edit
              </Button>
            )}
          </div>
          
          {isEditingDescription ? (
            <div className="space-y-3">
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Enter job description..."
                rows={4}
                disabled={isUpdating}
              />
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleSaveDescription}
                  disabled={isUpdating}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelDescription}
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
              {description || 'No description provided'}
            </div>
          )}
        </div>

        {/* Notes Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">Notes</h4>
            {canEdit && !isEditingNotes && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingNotes(true)}
                className="gap-2"
              >
                <Edit3 className="h-4 w-4" />
                Edit
              </Button>
            )}
          </div>
          
          {isEditingNotes ? (
            <div className="space-y-3">
              <Textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Enter additional notes..."
                rows={3}
                disabled={isUpdating}
              />
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleSaveNotes}
                  disabled={isUpdating}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelNotes}
                  disabled={isUpdating}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground whitespace-pre-wrap">
              {notes || 'No notes added'}
            </div>
          )}
        </div>

        {/* Tags Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">Tags</h4>
          </div>
          
          <div className="space-y-3">
            {/* Existing Tags */}
            {editTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {editTags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="group relative pr-6"
                  >
                    {tag}
                    {canEdit && (
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Add New Tag */}
            {canEdit && (
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={handleTagKeyPress}
                    placeholder="Add a tag..."
                    className="w-full px-3 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={isUpdating}
                  />
                </div>
                <Button
                  size="sm"
                  onClick={handleAddTag}
                  disabled={!newTag.trim() || isUpdating}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
            )}
            
            {editTags.length === 0 && !canEdit && (
              <div className="text-sm text-muted-foreground">
                No tags added
              </div>
            )}
          </div>
        </div>
      </ModernCardContent>
    </ModernCard>
  );
};
