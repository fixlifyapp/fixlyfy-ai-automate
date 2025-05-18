
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { toast } from "sonner";

interface TagJobsDialogProps {
  selectedJobs: string[];
  onOpenChange: (open: boolean) => void;
  onSuccess: (tags: string[]) => void;
}

// Mock available tags - in a real app, these would come from an API
const availableTags = [
  { id: "tag-1", name: "Urgent" },
  { id: "tag-2", name: "Follow-up" },
  { id: "tag-3", name: "VIP" },
  { id: "tag-4", name: "Quote Required" },
  { id: "tag-5", name: "Warranty" },
];

export function TagJobsDialog({ selectedJobs, onOpenChange, onSuccess }: TagJobsDialogProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTagToggle = (tagName: string) => {
    setSelectedTags(prev => 
      prev.includes(tagName)
        ? prev.filter(t => t !== tagName)
        : [...prev, tagName]
    );
  };

  const handleAddCustomTag = () => {
    if (customTag && !selectedTags.includes(customTag)) {
      setSelectedTags(prev => [...prev, customTag]);
      setCustomTag("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedTags.length === 0) {
      toast.error("Please select at least one tag");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // In a real app, this would be an actual API call
      // await fetch('/api/jobs/bulk-add-tags', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     jobIds: selectedJobs,
      //     tags: selectedTags,
      //   }),
      // });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onSuccess(selectedTags);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to tag jobs:", error);
      toast.error("Failed to tag jobs. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add Tags to Jobs</DialogTitle>
        <DialogDescription>
          Select tags to add to the {selectedJobs.length} selected jobs.
        </DialogDescription>
      </DialogHeader>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Select Tags
            </label>
            <div className="grid grid-cols-2 gap-2">
              {availableTags.map((tag) => (
                <div key={tag.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`tag-${tag.id}`} 
                    checked={selectedTags.includes(tag.name)}
                    onCheckedChange={() => handleTagToggle(tag.name)}
                  />
                  <label htmlFor={`tag-${tag.id}`} className="text-sm">
                    {tag.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Custom Tag
            </label>
            <div className="flex gap-2">
              <Input 
                value={customTag} 
                onChange={(e) => setCustomTag(e.target.value)} 
                placeholder="Enter custom tag"
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleAddCustomTag}
                disabled={!customTag.trim()}
              >
                Add
              </Button>
            </div>
          </div>

          {selectedTags.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Selected Tags:</p>
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag, index) => (
                  <div 
                    key={index} 
                    className="bg-fixlyfy-bg-interface px-2 py-1 text-xs rounded-md flex items-center gap-1"
                  >
                    {tag}
                    <button 
                      type="button" 
                      className="hover:text-fixlyfy-error" 
                      onClick={() => setSelectedTags(prev => prev.filter(t => t !== tag))}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || selectedTags.length === 0}>
            {isSubmitting ? "Adding Tags..." : "Add Tags"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
