
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

interface SourceSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialSource: string;
  onSave: (source: string) => void;
}

export function SourceSelectionDialog({
  open,
  onOpenChange,
  initialSource,
  onSave,
}: SourceSelectionDialogProps) {
  const [selectedSource, setSelectedSource] = useState(initialSource);
  
  const sources = [
    "Google", 
    "Facebook", 
    "Instagram",
    "Phone Call",
    "Website",
    "Referral",
    "Direct",
    "Email Campaign",
    "Other"
  ];

  const handleSave = () => {
    onSave(selectedSource);
    onOpenChange(false);
    toast.success("Lead source updated");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select Lead Source</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <RadioGroup 
            value={selectedSource} 
            onValueChange={setSelectedSource}
            className="space-y-3"
          >
            {sources.map((source) => (
              <div key={source} className="flex items-center space-x-2">
                <RadioGroupItem value={source} id={`source-${source}`} />
                <Label htmlFor={`source-${source}`}>{source}</Label>
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
