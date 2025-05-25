
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useLeadSources } from "@/hooks/useConfigItems";
import { toast } from "sonner";

interface QuickAddLeadSourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLeadSourceAdded?: (leadSource: { id: string; name: string }) => void;
}

export const QuickAddLeadSourceDialog = ({
  open,
  onOpenChange,
  onLeadSourceAdded
}: QuickAddLeadSourceDialogProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addItem } = useLeadSources();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Lead source name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const newLeadSource = await addItem({
        name: name.trim(),
        description: description.trim() || undefined,
        is_active: true
      });

      if (newLeadSource) {
        toast.success(`Lead source "${newLeadSource.name}" created successfully`);
        if (onLeadSourceAdded) {
          onLeadSourceAdded({ id: newLeadSource.id, name: newLeadSource.name });
        }
        setName("");
        setDescription("");
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error creating lead source:", error);
      toast.error("Failed to create lead source");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Add New Lead Source</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="leadSourceName">Name *</Label>
            <Input
              id="leadSourceName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Google Ads, Facebook, Referral"
              maxLength={100}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="leadSourceDescription">Description</Label>
            <Textarea
              id="leadSourceDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description for this lead source"
              rows={3}
            />
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
            <Button 
              type="submit" 
              disabled={isSubmitting || !name.trim()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Lead Source'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
