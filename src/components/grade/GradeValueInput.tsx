
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface GradeValueInputProps {
  value: string;
  onChange: (value: string) => void;
  hasError?: boolean;
}

export const GradeValueInput = ({ value, onChange, hasError = false }: GradeValueInputProps) => {
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
        className={hasError ? 'border-red-500' : ''}
      />
      {hasError && <p className="text-sm text-red-500">Bitte gib eine gültige Note ein (1-6)</p>}
    </div>
  );
};
