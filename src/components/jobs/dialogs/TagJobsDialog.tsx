
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface TagJobsDialogProps {
  selectedJobs: string[];
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

// Mock tags - in a real app these would come from the API
const existingTags = [
  { id: "1", name: "Urgent" },
  { id: "2", name: "Follow-up Required" },
  { id: "3", name: "Material Needed" },
  { id: "4", name: "Customer Complaint" },
  { id: "5", name: "High Value" },
  { id: "6", name: "Warranty Work" },
];

export function TagJobsDialog({ selectedJobs, onOpenChange, onSuccess }: TagJobsDialogProps) {
  const [activeTab, setActiveTab] = useState("add");
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [customTag, setCustomTag] = useState("");
  const [tagsToAdd, setTagsToAdd] = useState<string[]>([]);
  const [tagsToRemove, setTagsToRemove] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddTag = () => {
    if (selectedTag && !tagsToAdd.includes(selectedTag)) {
      setTagsToAdd([...tagsToAdd, selectedTag]);
      setSelectedTag("");
    }
  };

  const handleAddCustomTag = () => {
    if (customTag.trim() && !tagsToAdd.includes(customTag.trim())) {
      setTagsToAdd([...tagsToAdd, customTag.trim()]);
      setCustomTag("");
    }
  };

  const removeTagFromAdd = (tag: string) => {
    setTagsToAdd(tagsToAdd.filter(t => t !== tag));
  };

  const removeTagFromRemove = (tag: string) => {
    setTagsToRemove(tagsToRemove.filter(t => t !== tag));
  };

  const handleSubmit = async () => {
    if ((activeTab === "add" && tagsToAdd.length === 0) || 
        (activeTab === "remove" && tagsToRemove.length === 0)) {
      toast.error("Please select at least one tag");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // In a real app, this would be an actual API call
      if (activeTab === "add") {
        // await fetch('/api/jobs/bulk-add-tags', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     jobIds: selectedJobs,
        //     tags: tagsToAdd,
        //   }),
        // });
        console.log("Adding tags:", tagsToAdd, "to jobs:", selectedJobs);
      } else {
        // await fetch('/api/jobs/bulk-remove-tags', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     jobIds: selectedJobs,
        //     tags: tagsToRemove,
        //   }),
        // });
        console.log("Removing tags:", tagsToRemove, "from jobs:", selectedJobs);
      }
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success(
        activeTab === "add"
          ? `Added ${tagsToAdd.length} tags to ${selectedJobs.length} jobs`
          : `Removed ${tagsToRemove.length} tags from ${selectedJobs.length} jobs`
      );
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update tags:", error);
      toast.error("Failed to update tags. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Manage Tags</DialogTitle>
        <DialogDescription>
          Add or remove tags for the {selectedJobs.length} selected jobs.
        </DialogDescription>
      </DialogHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="add">Add Tags</TabsTrigger>
          <TabsTrigger value="remove">Remove Tags</TabsTrigger>
        </TabsList>
        
        <TabsContent value="add" className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Existing Tags</label>
            <div className="flex gap-2">
              <Select value={selectedTag} onValueChange={setSelectedTag}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a tag" />
                </SelectTrigger>
                <SelectContent>
                  {existingTags.map((tag) => (
                    <SelectItem key={tag.id} value={tag.name}>
                      {tag.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" onClick={handleAddTag} disabled={!selectedTag}>
                Add
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Custom Tag</label>
            <div className="flex gap-2">
              <Input 
                value={customTag} 
                onChange={(e) => setCustomTag(e.target.value)} 
                placeholder="Enter custom tag"
                className="flex-1"
              />
              <Button 
                type="button" 
                onClick={handleAddCustomTag}
                disabled={!customTag.trim()}
              >
                Add
              </Button>
            </div>
          </div>
          
          {tagsToAdd.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Tags to Add</label>
              <div className="flex flex-wrap gap-2">
                {tagsToAdd.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {tag}
                    <X 
                      size={14} 
                      className="cursor-pointer" 
                      onClick={() => removeTagFromAdd(tag)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="remove" className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Tags to Remove</label>
            <div className="flex flex-wrap gap-2">
              {existingTags.map((tag) => (
                <Badge 
                  key={tag.id} 
                  variant={tagsToRemove.includes(tag.name) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => {
                    if (tagsToRemove.includes(tag.name)) {
                      removeTagFromRemove(tag.name);
                    } else {
                      setTagsToRemove([...tagsToRemove, tag.name]);
                    }
                  }}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>
          
          {tagsToRemove.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Tags to Remove</label>
              <div className="flex flex-wrap gap-2">
                {tagsToRemove.map((tag, index) => (
                  <Badge key={index} className="gap-1">
                    {tag}
                    <X 
                      size={14} 
                      className="cursor-pointer" 
                      onClick={() => removeTagFromRemove(tag)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <DialogFooter>
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => onOpenChange(false)}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          type="button" 
          onClick={handleSubmit}
          disabled={isSubmitting || (activeTab === "add" ? tagsToAdd.length === 0 : tagsToRemove.length === 0)}
        >
          {isSubmitting ? "Updating..." : activeTab === "add" ? "Add Tags" : "Remove Tags"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
