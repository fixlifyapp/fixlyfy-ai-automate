
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

interface JobTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialType: string;
  onSave: (type: string) => void;
}

export function JobTypeDialog({
  open,
  onOpenChange,
  initialType,
  onSave,
}: JobTypeDialogProps) {
  const [selectedType, setSelectedType] = useState(initialType);
  
  const jobTypes = [
    "Diagnostic", 
    "Repair service", 
    "Maintenance", 
    "Installation"
  ];

  const handleSave = () => {
    onSave(selectedType);
    onOpenChange(false);
    toast.success("Job type updated");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select Job Type</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <RadioGroup 
            value={selectedType} 
            onValueChange={setSelectedType}
            className="space-y-3"
          >
            {jobTypes.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <RadioGroupItem value={type} id={`type-${type}`} />
                <Label htmlFor={`type-${type}`}>{type}</Label>
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
