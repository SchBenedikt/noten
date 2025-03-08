import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface GradeNotesInputProps {
  notes: string;
  onChange: (notes: string) => void;
}

export const GradeNotesInput = ({ notes, onChange }: GradeNotesInputProps) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor="notes">Notizen</Label>
      <Textarea
        id="notes"
        value={notes}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Optionale Notizen zur Note..."
        className="min-h-[100px]"
      />
    </div>
  );
};
