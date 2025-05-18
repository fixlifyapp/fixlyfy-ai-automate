
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
  
  // Mock team data with colors
  const teams = [
    { id: "1", name: "Robert Smith", color: "bg-purple-100 text-purple-600" },
    { id: "2", name: "Jane Cooper", color: "bg-blue-100 text-blue-600" },
    { id: "3", name: "Michael Johnson", color: "bg-green-100 text-green-600" },
    { id: "4", name: "Sarah Williams", color: "bg-pink-100 text-pink-600" },
    { id: "5", name: "David Martinez", color: "bg-amber-100 text-amber-600" }
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
                  <div className={`w-8 h-8 rounded-full ${team.color.split(" ")[0]} flex items-center justify-center`}>
                    <User size={16} className={team.color.split(" ")[1]} />
                  </div>
                  <span className={team.color.split(" ")[1]}>{team.name}</span>
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
