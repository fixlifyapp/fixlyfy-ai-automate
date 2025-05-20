
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ChangeStatusDialogProps {
  selectedJobs: string[];
  onOpenChange: (open: boolean) => void;
  onSuccess: (status: string) => void;
}

export function ChangeStatusDialog({ selectedJobs, onOpenChange, onSuccess }: ChangeStatusDialogProps) {
  const [status, setStatus] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!status) {
      toast.error("Please select a status");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Update status for all selected jobs in Supabase
      const { error } = await supabase
        .from('jobs')
        .update({ status })
        .in('id', selectedJobs);
        
      if (error) {
        throw error;
      }
      
      // Call onSuccess with the new status
      onSuccess(status);
      onOpenChange(false);
      toast.success(`Updated ${selectedJobs.length} jobs to "${status}"`);
    } catch (error) {
      console.error("Failed to update job status:", error);
      toast.error("Failed to update job status. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Change Status for {selectedJobs.length} Selected Jobs</DialogTitle>
        <DialogDescription>
          Update the status for all selected jobs. This will override their current status.
        </DialogDescription>
      </DialogHeader>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="status" className="text-sm font-medium">
              New Status
            </label>
            <Select onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
          <Button type="submit" disabled={isSubmitting || !status}>
            {isSubmitting ? "Updating..." : "Update Status"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
