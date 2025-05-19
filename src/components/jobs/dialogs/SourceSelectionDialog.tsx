
import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";

interface SourceSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialSource: string;
  onSave: (source: string) => void;
  onAddSource?: (source: string) => void;
}

export function SourceSelectionDialog({
  open,
  onOpenChange,
  initialSource,
  onSave,
  onAddSource
}: SourceSelectionDialogProps) {
  const [selectedSource, setSelectedSource] = useState(initialSource);
  const [newSource, setNewSource] = useState("");
  
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

  const handleAddSource = () => {
    if (newSource.trim() && onAddSource) {
      onAddSource(newSource.trim());
      setNewSource("");
      toast.success("Custom source added");
    }
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
          
          {onAddSource && (
            <div className="mt-6 border-t pt-4">
              <Label className="mb-2 block">Add Custom Source</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value)}
                  placeholder="Enter custom source"
                  className="flex-1"
                />
                <Button 
                  onClick={handleAddSource}
                  disabled={!newSource.trim()}
                  type="button"
                >
                  <Plus size={16} /> Add
                </Button>
              </div>
            </div>
          )}
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
