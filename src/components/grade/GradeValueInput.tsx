
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';

interface GradeValueInputProps {
  value: string;
  onChange: (value: string) => void;
  hasError?: boolean;
}

export const GradeValueInput = ({ value, onChange, hasError = false }: GradeValueInputProps) => {
  const [localError, setLocalError] = useState(false);
  
  // Validate the value whenever it changes
  useEffect(() => {
    const numValue = parseFloat(value);
    const isValid = !isNaN(numValue) && numValue >= 1 && numValue <= 6;
    setLocalError(!isValid && value !== '');
  }, [value]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow empty value for user input convenience
    onChange(e.target.value);
  };

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
        onChange={handleChange}
        required
        className={hasError || localError ? 'border-red-500' : ''}
      />
      {(hasError || localError) && <p className="text-sm text-red-500">Bitte gib eine gültige Note ein (1-6)</p>}
    </div>
  );
};
