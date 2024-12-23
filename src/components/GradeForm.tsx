import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Grade } from '@/types';

interface GradeFormProps {
  onSubmit: (grade: Omit<Grade, 'id'>) => void;
  subjectType?: 'main' | 'secondary';
}

export const GradeForm = ({ onSubmit, subjectType = 'main' }: GradeFormProps) => {
  const [value, setValue] = useState('');
  const [weight, setWeight] = useState('1');
  const [type, setType] = useState<'oral' | 'written'>('oral');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      value: Number(value),
      weight: Number(weight),
      type,
      date,
    });
    setValue('');
    setWeight('1');
    setType('oral');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="value">Note</Label>
          <Input
            id="value"
            type="number"
            min="1"
            max="6"
            step="0.5"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="weight">Gewichtung</Label>
          <Input
            id="weight"
            type="number"
            min="1"
            max="3"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label>Art</Label>
          <RadioGroup value={type} onValueChange={(value) => setType(value as 'oral' | 'written')}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="oral" id="oral" />
              <Label htmlFor="oral">Mündlich</Label>
            </div>
            {subjectType === 'main' && (
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="written" id="written" />
                <Label htmlFor="written">Schulaufgabe</Label>
              </div>
            )}
          </RadioGroup>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="date">Datum</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
      </div>
      <Button type="submit">Hinzufügen</Button>
    </form>
  );
};