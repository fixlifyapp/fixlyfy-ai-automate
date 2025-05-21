
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
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { User, Loader2 } from "lucide-react";
import { fetchTeamMembers } from "@/data/team";
import { TeamMember } from "@/types/team";

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
  const [isLoading, setIsLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  
  // Define team colors based on index
  const teamColors = [
    "bg-purple-100 text-purple-600",
    "bg-blue-100 text-blue-600",
    "bg-green-100 text-green-600",
    "bg-pink-100 text-pink-600",
    "bg-amber-100 text-amber-600",
    "bg-cyan-100 text-cyan-600",
    "bg-indigo-100 text-indigo-600",
    "bg-rose-100 text-rose-600"
  ];
  
  // Fetch team members when dialog opens
  useEffect(() => {
    if (open) {
      const loadTeamMembers = async () => {
        setIsLoading(true);
        try {
          const members = await fetchTeamMembers();
          setTeamMembers(members);
        } catch (error) {
          console.error("Error loading team members:", error);
          toast.error("Failed to load team members");
        } finally {
          setIsLoading(false);
        }
      };
      
      loadTeamMembers();
    }
  }, [open]);

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
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 size={24} className="animate-spin text-primary mr-2" />
              <span>Loading team members...</span>
            </div>
          ) : (
            <RadioGroup 
              value={selectedTeam} 
              onValueChange={setSelectedTeam}
              className="space-y-3"
            >
              {teamMembers.map((member, index) => (
                <div key={member.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={member.name} id={`team-${member.id}`} />
                  <Label htmlFor={`team-${member.id}`} className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full ${teamColors[index % teamColors.length].split(" ")[0]} flex items-center justify-center`}>
                      <User size={16} className={teamColors[index % teamColors.length].split(" ")[1]} />
                    </div>
                    <span className={teamColors[index % teamColors.length].split(" ")[1]}>{member.name}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading || !selectedTeam}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
