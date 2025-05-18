
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

interface JobDetailsEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDescription: string;
  onSave: (description: string) => void;
}

export function JobDetailsEditDialog({
  open,
  onOpenChange,
  initialDescription,
  onSave,
}: JobDetailsEditDialogProps) {
  const [description, setDescription] = useState(initialDescription);

  const handleSave = () => {
    onSave(description);
    onOpenChange(false);
    toast.success("Job description updated");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Job Description</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full"
          />
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
