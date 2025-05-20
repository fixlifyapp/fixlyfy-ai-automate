
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface DeleteJobsDialogProps {
  selectedJobs: string[];
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  open: boolean;
}

export function DeleteJobsDialog({ selectedJobs, onOpenChange, onSuccess, open }: DeleteJobsDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDelete = async () => {
    setIsSubmitting(true);
    
    try {
      // Delete all selected jobs from Supabase
      const { error } = await supabase
        .from('jobs')
        .delete()
        .in('id', selectedJobs);
        
      if (error) {
        throw error;
      }
      
      onSuccess();
      onOpenChange(false);
      toast.success(`Deleted ${selectedJobs.length} jobs successfully`);
    } catch (error) {
      console.error("Failed to delete jobs:", error);
      toast.error("Failed to delete jobs. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Jobs</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {selectedJobs.length} jobs? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="gap-2 sm:gap-0">
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
            variant="destructive" 
            onClick={handleDelete}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Deleting..." : "Delete Jobs"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
