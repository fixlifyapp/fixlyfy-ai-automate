import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useJobHistoryIntegration } from "@/hooks/useJobHistoryIntegration";

interface AssignTechnicianDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  currentTechnicianId?: string;
  currentTechnicianName?: string;
  onSuccess?: () => void;
}

export const AssignTechnicianDialog = ({
  open,
  onOpenChange,
  jobId,
  currentTechnicianId,
  currentTechnicianName,
  onSuccess
}: AssignTechnicianDialogProps) => {
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string>("");
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { logTechnicianChange } = useJobHistoryIntegration();

  const fetchTechnicians = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('role', 'technician');

      if (error) throw error;

      setTechnicians(data || []);
    } catch (error) {
      console.error('Error fetching technicians:', error);
      toast.error('Failed to load technicians');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchTechnicians();
      setSelectedTechnicianId(currentTechnicianId || "");
    }
  }, [open, currentTechnicianId]);

  const handleAssign = async () => {
    if (!selectedTechnicianId) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ 
          technician_id: selectedTechnicianId,
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId);

      if (error) throw error;

      // Log technician change to job history
      const newTechnician = technicians.find(t => t.id === selectedTechnicianId);
      if (newTechnician) {
        await logTechnicianChange(
          jobId,
          currentTechnicianName || 'Unassigned',
          newTechnician.name
        );
      }

      toast.success('Technician assigned successfully');
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error assigning technician:', error);
      toast.error('Failed to assign technician');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Technician</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label
              htmlFor="technician"
              className="text-right text-sm font-medium leading-none text-right"
            >
              Technician
            </label>
            <div className="col-span-3">
              <Select value={selectedTechnicianId} onValueChange={setSelectedTechnicianId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a technician" />
                </SelectTrigger>
                <SelectContent>
                  {technicians.map(technician => (
                    <SelectItem key={technician.id} value={technician.id}>
                      {technician.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <Button onClick={handleAssign} disabled={isLoading}>
          {isLoading ? "Assigning..." : "Assign Technician"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
