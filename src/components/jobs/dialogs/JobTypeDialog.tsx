
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
    { value: "Diagnostic", color: "bg-blue-50 border-blue-200 text-blue-600" },
    { value: "Repair service", color: "bg-orange-50 border-orange-200 text-orange-600" }, 
    { value: "Maintenance", color: "bg-green-50 border-green-200 text-green-600" }, 
    { value: "Installation", color: "bg-purple-50 border-purple-200 text-purple-600" }
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
              <div key={type.value} className="flex items-center space-x-2">
                <RadioGroupItem value={type.value} id={`type-${type.value}`} />
                <Label 
                  htmlFor={`type-${type.value}`}
                  className={`px-3 py-1 rounded-full ${type.color}`}
                >
                  {type.value}
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
