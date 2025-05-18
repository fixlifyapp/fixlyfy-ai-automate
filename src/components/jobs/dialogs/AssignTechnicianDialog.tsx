
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { toast } from "sonner";
import { TeamMember } from "@/types/team";

interface AssignTechnicianDialogProps {
  selectedJobs: string[];
  technicians: TeamMember[];
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AssignTechnicianDialog({ 
  selectedJobs, 
  technicians, 
  onOpenChange, 
  onSuccess 
}: AssignTechnicianDialogProps) {
  const [technicianId, setTechnicianId] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!technicianId) {
      toast.error("Please select a technician");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // In a real app, this would be an actual API call
      // await fetch('/api/jobs/bulk-assign-tech', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     jobIds: selectedJobs,
      //     technicianId,
      //   }),
      // });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const selectedTech = technicians.find(tech => tech.id === technicianId);
      const techName = selectedTech ? selectedTech.name : "selected technician";
      
      toast.success(`Assigned ${selectedJobs.length} jobs to ${techName}`);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to assign technician:", error);
      toast.error("Failed to assign technician. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Assign Technician</DialogTitle>
        <DialogDescription>
          Select a technician to assign to the {selectedJobs.length} selected jobs.
        </DialogDescription>
      </DialogHeader>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="technician" className="text-sm font-medium">
              Technician
            </label>
            <Select onValueChange={setTechnicianId}>
              <SelectTrigger>
                <SelectValue placeholder="Select technician" />
              </SelectTrigger>
              <SelectContent>
                {technicians.map((tech) => (
                  <SelectItem key={tech.id} value={tech.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={tech.avatar} alt={tech.name} />
                        <AvatarFallback>
                          {tech.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      {tech.name}
                    </div>
                  </SelectItem>
                ))}
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
          <Button type="submit" disabled={isSubmitting || !technicianId}>
            {isSubmitting ? "Assigning..." : "Assign Technician"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
