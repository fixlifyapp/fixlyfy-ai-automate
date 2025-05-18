
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

interface DeleteJobsDialogProps {
  selectedJobs: string[];
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DeleteJobsDialog({ selectedJobs, onOpenChange, onSuccess }: DeleteJobsDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDelete = async () => {
    setIsSubmitting(true);
    
    try {
      // In a real app, this would be an actual API call
      // await fetch('/api/jobs/bulk-delete', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     jobIds: selectedJobs,
      //   }),
      // });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success(`Deleted ${selectedJobs.length} jobs`);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to delete jobs:", error);
      toast.error("Failed to delete jobs. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
  );
}
