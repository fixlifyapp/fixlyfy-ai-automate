
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useJobHistoryIntegration } from "@/hooks/useJobHistoryIntegration";

interface JobDetailsEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  onSuccess?: () => void;
  initialDescription?: string; // Added for backward compatibility
  onSave?: (description: string) => void; // Added for backward compatibility
}

export const JobDetailsEditDialog = ({
  open,
  onOpenChange,
  jobId,
  onSuccess,
  onSave
}: JobDetailsEditDialogProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    notes: '',
    address: ''
  });
  const [originalData, setOriginalData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { logNoteAdded } = useJobHistoryIntegration();

  useEffect(() => {
    if (open) {
      fetchJobData();
    }
  }, [open, jobId]);

  const fetchJobData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('title, description, notes, address')
        .eq('id', jobId)
        .single();

      if (error) throw error;

      setFormData({
        title: data?.title || '',
        description: data?.description || '',
        notes: data?.notes || '',
        address: data?.address || ''
      });
      setOriginalData(data);
    } catch (error) {
      console.error('Error fetching job details:', error);
      toast.error('Failed to load job details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('jobs')
        .update({
          title: formData.title,
          description: formData.description,
          notes: formData.notes,
          address: formData.address,
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId);

      if (error) throw error;

      // Log significant changes to job history
      const changes = [];
      if (originalData?.title !== formData.title) {
        changes.push(`Title changed from "${originalData?.title}" to "${formData.title}"`);
      }
      if (originalData?.description !== formData.description) {
        changes.push(`Description updated`);
      }
      if (originalData?.address !== formData.address) {
        changes.push(`Address changed from "${originalData?.address}" to "${formData.address}"`);
      }
      if (originalData?.notes !== formData.notes && formData.notes) {
        changes.push(`Notes updated: ${formData.notes}`);
      }

      if (changes.length > 0) {
        await logNoteAdded(jobId, `Job details updated: ${changes.join('; ')}`);
      }

      toast.success('Job details updated successfully');
      
      // Call both callbacks for backward compatibility
      onSuccess?.();
      onSave?.(formData.description);
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating job details:', error);
      toast.error('Failed to update job details');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Edit Job Details</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="description" className="text-right mt-1">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="notes" className="text-right mt-1">
              Notes
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="address" className="text-right">
              Address
            </Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="col-span-3"
            />
          </div>
        </div>
        <Button type="submit" onClick={handleSave} disabled={isLoading}>
          {isLoading ? "Saving..." : "Save changes"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
