
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TagsManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTags: string[];
  onSave: (tags: string[]) => void;
}

export function TagsManagementDialog({
  open,
  onOpenChange,
  initialTags,
  onSave,
}: TagsManagementDialogProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);
  const [newTag, setNewTag] = useState("");
  
  // Common tags in field service industry with colors
  const tagColors = {
    "HVAC": "bg-purple-50 border-purple-200 text-purple-600",
    "Residential": "bg-blue-50 border-blue-200 text-blue-600",
    "Commercial": "bg-indigo-50 border-indigo-200 text-indigo-600",
    "Emergency": "bg-red-50 border-red-200 text-red-600",
    "Maintenance": "bg-green-50 border-green-200 text-green-600",
    "Installation": "bg-amber-50 border-amber-200 text-amber-600",
    "Repair": "bg-orange-50 border-orange-200 text-orange-600",
    "Water Heater": "bg-cyan-50 border-cyan-200 text-cyan-600",
    "Plumbing": "bg-sky-50 border-sky-200 text-sky-600",
    "Electrical": "bg-yellow-50 border-yellow-200 text-yellow-600",
    "Air Conditioning": "bg-teal-50 border-teal-200 text-teal-600",
    "Heating": "bg-rose-50 border-rose-200 text-rose-600"
  };
  
  const commonTags = Object.keys(tagColors);

  // Get color for a tag, cycling through available colors for custom tags
  const getTagColor = (tag: string) => {
    if (tag in tagColors) {
      return tagColors[tag as keyof typeof tagColors];
    }
    
    // For custom tags, cycle through available colors
    const colorValues = Object.values(tagColors);
    const index = selectedTags.indexOf(tag) % colorValues.length;
    return colorValues[index];
  };

  const handleToggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleAddTag = () => {
    if (newTag.trim() && !selectedTags.includes(newTag.trim())) {
      setSelectedTags(prev => [...prev, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setSelectedTags(prev => prev.filter(t => t !== tag));
  };

  const handleSave = () => {
    onSave(selectedTags);
    onOpenChange(false);
    toast.success("Tags updated");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Manage Tags</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          {/* Selected tags */}
          <div>
            <Label>Selected Tags</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedTags.length > 0 ? (
                selectedTags.map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="outline" 
                    className={`flex items-center gap-1 ${getTagColor(tag)}`}
                  >
                    {tag}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      <X size={12} />
                    </Button>
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-gray-500">No tags selected</p>
              )}
            </div>
          </div>
          
          {/* Add custom tag */}
          <div className="flex items-center gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add custom tag..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddTag();
                }
              }}
            />
            <Button 
              onClick={handleAddTag}
              disabled={!newTag.trim()}
            >
              Add
            </Button>
          </div>
          
          {/* Common tags */}
          <div>
            <Label className="mb-2 block">Common Tags</Label>
            <div className="grid grid-cols-2 gap-2">
              {commonTags.map((tag) => (
                <div key={tag} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`tag-${tag}`} 
                    checked={selectedTags.includes(tag)}
                    onCheckedChange={() => handleToggleTag(tag)}
                  />
                  <Label 
                    htmlFor={`tag-${tag}`}
                    className={`px-2 py-0.5 rounded-md ${getTagColor(tag)}`}
                  >
                    {tag}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
