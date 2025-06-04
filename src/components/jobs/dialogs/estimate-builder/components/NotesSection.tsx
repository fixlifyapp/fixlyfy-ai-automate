
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface NotesSectionProps {
  notes: string;
  onNotesChange: (notes: string) => void;
}

export const NotesSection = ({ notes, onNotesChange }: NotesSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Additional Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="upsell-notes">Special Instructions or Comments</Label>
          <Textarea
            id="upsell-notes"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Add any special notes or instructions for the client..."
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
};
