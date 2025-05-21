
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
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { TeamMember } from "@/types/team";
import { fetchTeamMembers } from "@/data/team";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface AssignTechnicianDialogProps {
  selectedJobs: string[];
  onOpenChange: (open: boolean) => void;
  onSuccess: (technicianId: string, technicianName: string) => void;
}

export function AssignTechnicianDialog({ 
  selectedJobs, 
  onOpenChange, 
  onSuccess 
}: AssignTechnicianDialogProps) {
  const [technicianId, setTechnicianId] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [technicians, setTechnicians] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch technicians from Supabase
  useEffect(() => {
    const loadTechnicians = async () => {
      setIsLoading(true);
      try {
        const teamMembers = await fetchTeamMembers();
        setTechnicians(teamMembers);
      } catch (error) {
        console.error("Error loading technicians:", error);
        toast.error("Failed to load technicians");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTechnicians();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!technicianId) {
      toast.error("Please select a technician");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Update all selected jobs with the technician ID
      const updates = selectedJobs.map(jobId => 
        supabase
          .from('jobs')
          .update({ technician_id: technicianId })
          .eq('id', jobId)
      );
      
      await Promise.all(updates);
      
      const selectedTech = technicians.find(tech => tech.id === technicianId);
      const techName = selectedTech ? selectedTech.name : "selected technician";
      
      onSuccess(technicianId, techName);
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
            
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
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
            )}
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
          <Button type="submit" disabled={isSubmitting || !technicianId || isLoading}>
            {isSubmitting ? "Assigning..." : "Assign Technician"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
