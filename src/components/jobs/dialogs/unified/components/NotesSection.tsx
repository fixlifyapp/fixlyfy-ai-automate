
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hooks/use-mobile";

interface NotesSectionProps {
  notes: string;
  onNotesChange: (notes: string) => void;
}

export const NotesSection = ({ notes, onNotesChange }: NotesSectionProps) => {
  const isMobile = useIsMobile();

  return (
    <Card>
      <CardHeader className={isMobile ? 'px-3 py-3' : 'px-6 py-4'}>
        <CardTitle className={isMobile ? 'text-base' : 'text-lg'}>
          Notes & Terms
        </CardTitle>
      </CardHeader>
      <CardContent className={isMobile ? 'px-3 pb-3' : 'px-6 pb-6'}>
        <Textarea
          placeholder="Add any additional notes, terms, or conditions..."
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          className={`resize-none ${isMobile ? 'min-h-[80px] text-sm' : 'min-h-[100px]'}`}
        />
      </CardContent>
    </Card>
  );
};
