import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface GradeValueInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const GradeValueInput = ({ value, onChange }: GradeValueInputProps) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor="value">Note</Label>
      <Input
        id="value"
        type="number"
        min="1"
        max="6"
        step="0.5"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
      />
    </div>
  );
};
