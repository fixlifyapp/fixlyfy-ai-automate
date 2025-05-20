
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Product } from "@/components/jobs/builder/types";

export interface EstimateUpsellOptionsProps {
  warranty?: Product | null;
  techniciansNote?: string;
  onWarrantyChange: (warranty: Product | null) => void;
  onNotesChange: (note: string) => void;
}

export const EstimateUpsellOptions = ({
  warranty,
  techniciansNote = "",
  onWarrantyChange,
  onNotesChange
}: EstimateUpsellOptionsProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Technician's Notes</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Add any notes or recommendations from the technician.
        </p>
        
        <div className="space-y-2">
          <Label htmlFor="technicians-note">Notes</Label>
          <Textarea
            id="technicians-note"
            value={techniciansNote}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Enter any additional notes or recommendations..."
            className="min-h-[150px]"
          />
        </div>
      </div>
    </div>
  );
};
