
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface EstimateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EstimateDialog = ({ open, onOpenChange }: EstimateDialogProps) => {
  // Simplified estimate dialog
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Estimate</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>Estimate form would go here</p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={() => {
              toast.success("Estimate created");
              onOpenChange(false);
            }}>
              Create Estimate
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
