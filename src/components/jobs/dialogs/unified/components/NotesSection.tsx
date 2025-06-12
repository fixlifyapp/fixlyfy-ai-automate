
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface NotesSectionProps {
  notes: string;
  onNotesChange?: (notes: string) => void;
  readOnly?: boolean;
}

export const NotesSection = ({ notes, onNotesChange, readOnly = false }: NotesSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Additional Notes</CardTitle>
      </CardHeader>
      <CardContent>
        {readOnly ? (
          <div className="min-h-[100px] p-3 bg-gray-50 rounded-md border">
            <p className="text-gray-700 whitespace-pre-wrap">
              {notes || 'No additional notes'}
            </p>
          </div>
        ) : (
          <textarea
            placeholder="Add any additional notes, terms, or special instructions..."
            value={notes}
            onChange={(e) => onNotesChange?.(e.target.value)}
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}
      </CardContent>
    </Card>
  );
};
