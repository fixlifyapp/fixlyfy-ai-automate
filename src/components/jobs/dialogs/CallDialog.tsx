
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface CallDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: {
    name: string;
    phone: string;
  };
}

export const CallDialog = ({ open, onOpenChange, client }: CallDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Call Client</DialogTitle>
        </DialogHeader>
        <div className="py-6 text-center">
          <p className="text-xl font-medium mb-2">{client.name}</p>
          <p className="text-xl mb-6">{client.phone}</p>
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={() => {
              toast.success(`Calling ${client.name}...`);
              onOpenChange(false);
            }}>Call Now</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
