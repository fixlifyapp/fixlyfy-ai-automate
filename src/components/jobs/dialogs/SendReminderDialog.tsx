
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";

interface SendReminderDialogProps {
  selectedJobs: string[];
  onOpenChange: (open: boolean) => void;
  onSuccess: (reminderType: string) => void;
}

export function SendReminderDialog({ selectedJobs, onOpenChange, onSuccess }: SendReminderDialogProps) {
  const [reminderType, setReminderType] = useState<string>("sms");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // In a real app, this would be an actual API call
      // await fetch('/api/jobs/bulk-send-reminder', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     jobIds: selectedJobs,
      //     reminderType,
      //   }),
      // });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onSuccess(reminderType);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to send reminders:", error);
      toast.error("Failed to send reminders. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Send Appointment Reminders</DialogTitle>
        <DialogDescription>
          Send appointment reminders to clients for the {selectedJobs.length} selected jobs.
        </DialogDescription>
      </DialogHeader>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="reminder-type" className="text-sm font-medium">
              Reminder Type
            </label>
            <Select defaultValue={reminderType} onValueChange={setReminderType}>
              <SelectTrigger id="reminder-type">
                <SelectValue placeholder="Select reminder type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="both">Both SMS & Email</SelectItem>
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
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send Reminders"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
