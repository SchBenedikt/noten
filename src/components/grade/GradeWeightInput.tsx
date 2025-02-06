import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface GradeWeightInputProps {
  weight: string;
  onChange: (weight: string) => void;
}

export const GradeWeightInput = ({ weight, onChange }: GradeWeightInputProps) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor="weight">Gewichtung</Label>
      <Input
        id="weight"
        type="number"
        min="0.5"
        max="3"
        step="0.5"
        value={weight}
        onChange={(e) => onChange(e.target.value)}
        required
      />
    </div>
  );
};