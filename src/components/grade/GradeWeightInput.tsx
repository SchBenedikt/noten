
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface GradeWeightInputProps {
  weight: string;
  onChange: (weight: string) => void;
  hasError?: boolean;
}

export const GradeWeightInput = ({ weight, onChange, hasError = false }: GradeWeightInputProps) => {
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
        className={hasError ? 'border-red-500' : ''}
      />
      {hasError && <p className="text-sm text-red-500">Bitte gib eine gültige Gewichtung ein (0.5-3)</p>}
    </div>
  );
};
