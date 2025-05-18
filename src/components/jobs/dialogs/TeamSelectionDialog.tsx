
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
import { User } from "lucide-react";

interface TeamSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTeam: string;
  onSave: (team: string) => void;
}

export function TeamSelectionDialog({
  open,
  onOpenChange,
  initialTeam,
  onSave,
}: TeamSelectionDialogProps) {
  const [selectedTeam, setSelectedTeam] = useState(initialTeam);
  
  // Mock team data
  const teams = [
    { id: "1", name: "Robert Smith" },
    { id: "2", name: "Jane Cooper" },
    { id: "3", name: "Michael Johnson" },
    { id: "4", name: "Sarah Williams" },
    { id: "5", name: "David Martinez" }
  ];

  const handleSave = () => {
    onSave(selectedTeam);
    onOpenChange(false);
    toast.success("Team assignment updated");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Team Member</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <RadioGroup 
            value={selectedTeam} 
            onValueChange={setSelectedTeam}
            className="space-y-3"
          >
            {teams.map((team) => (
              <div key={team.id} className="flex items-center space-x-2">
                <RadioGroupItem value={team.name} id={`team-${team.id}`} />
                <Label htmlFor={`team-${team.id}`} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <User size={16} className="text-purple-600" />
                  </div>
                  {team.name}
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
