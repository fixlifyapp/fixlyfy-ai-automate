
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

interface PrioritySelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialPriority: string;
  onSave: (priority: string) => void;
}

export function PrioritySelectionDialog({
  open,
  onOpenChange,
  initialPriority,
  onSave,
}: PrioritySelectionDialogProps) {
  const [selectedPriority, setSelectedPriority] = useState(initialPriority);
  
  const priorities = [
    { value: "High", color: "text-red-500" },
    { value: "Medium", color: "text-orange-500" },
    { value: "Low", color: "text-green-500" },
  ];

  const handleSave = () => {
    onSave(selectedPriority);
    onOpenChange(false);
    toast.success("Job priority updated");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select Priority Level</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <RadioGroup 
            value={selectedPriority} 
            onValueChange={setSelectedPriority}
            className="space-y-3"
          >
            {priorities.map((priority) => (
              <div key={priority.value} className="flex items-center space-x-2">
                <RadioGroupItem value={priority.value} id={`priority-${priority.value}`} />
                <Label htmlFor={`priority-${priority.value}`} className={priority.color}>
                  {priority.value}
                </Label>
              </div>
            ))}
          </RadioGroup>
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
